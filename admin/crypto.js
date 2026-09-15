/* =====================================================================
   admin/crypto.js — 관리자 금고(vault) 암호화 (브라우저 WebCrypto / Node 공용)

   구조 (envelope 방식)
   - 저장용 GitHub 토큰은 무작위 256비트 마스터키(AES-GCM)로 암호화합니다.
   - 마스터키는 관리자 계정마다 비밀번호(PBKDF2-SHA256, 30만 회)로 감싸서 보관합니다.
   - 따라서 등록된 ID + 비밀번호를 아는 사람만 마스터키 → 토큰을 풀 수 있고,
     토큰 교체나 계정 추가는 다른 사람의 비밀번호 없이도 가능합니다.
   ===================================================================== */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory(globalThis.crypto);
  else root.VaultCrypto = factory(root.crypto);
})(typeof self !== "undefined" ? self : this, function (webcrypto) {
  "use strict";
  const subtle = webcrypto.subtle;
  const te = new TextEncoder(), td = new TextDecoder();

  const b64 = {
    enc(bytes) {
      const u = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
      let s = "";
      for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
      return btoa(s);
    },
    dec(str) {
      const bin = atob(String(str).replace(/\s/g, ""));
      const u = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
      return u;
    }
  };
  const utf8 = { enc: (s) => te.encode(s), dec: (u) => td.decode(u) };
  const rand = (n) => webcrypto.getRandomValues(new Uint8Array(n));
  const KDF = { name: "PBKDF2", hash: "SHA-256", iterations: 300000 };

  async function deriveKey(password, salt, iterations) {
    const base = await subtle.importKey("raw", te.encode(String(password).normalize("NFKC")), "PBKDF2", false, ["deriveKey"]);
    return subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: iterations || KDF.iterations, hash: KDF.hash },
      base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  }
  async function aesEncrypt(key, bytes) {
    const iv = rand(12);
    const ct = new Uint8Array(await subtle.encrypt({ name: "AES-GCM", iv }, key, bytes));
    return { iv: b64.enc(iv), data: b64.enc(ct) };
  }
  async function aesDecrypt(key, box) {
    return new Uint8Array(await subtle.decrypt({ name: "AES-GCM", iv: b64.dec(box.iv) }, key, b64.dec(box.data)));
  }
  const importMaster = (raw) => subtle.importKey("raw", raw, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);

  /** 계정 항목 만들기: 마스터키를 비밀번호로 감싼다 */
  async function wrapAccount(vault, masterRaw, id, password) {
    const salt = rand(16);
    const key = await deriveKey(password, salt, vault.kdf.iterations);
    const box = await aesEncrypt(key, masterRaw);
    return { id: String(id).trim(), salt: b64.enc(salt), iv: box.iv, data: box.data, created: new Date().toISOString().slice(0, 10) };
  }

  /** 새 금고 만들기 */
  async function createVault({ token, id, password, repo, branch }) {
    const masterRaw = rand(32);
    const master = await importMaster(masterRaw);
    const vault = {
      version: 1, repo, branch,
      kdf: { name: KDF.name, hash: KDF.hash, iterations: KDF.iterations },
      token: await aesEncrypt(master, utf8.enc(token)),
      accounts: []
    };
    vault.accounts.push(await wrapAccount(vault, masterRaw, id, password));
    return { vault, masterRaw };
  }

  /** 로그인: ID/비밀번호로 마스터키를 풀고 토큰을 복호화 */
  async function unlock(vault, id, password) {
    const acc = (vault.accounts || []).find((a) => a.id === String(id).trim());
    if (!acc) throw new Error("등록되지 않은 관리자 ID 입니다.");
    const key = await deriveKey(password, b64.dec(acc.salt), vault.kdf.iterations);
    let masterRaw;
    try { masterRaw = await aesDecrypt(key, { iv: acc.iv, data: acc.data }); }
    catch (e) { throw new Error("비밀번호가 올바르지 않습니다."); }
    const master = await importMaster(masterRaw);
    const token = utf8.dec(await aesDecrypt(master, vault.token));
    return { token, masterRaw };
  }

  /** 토큰 교체 (마스터키는 유지) */
  async function setToken(vault, masterRaw, token) {
    const master = await importMaster(masterRaw);
    vault.token = await aesEncrypt(master, utf8.enc(token));
    return vault;
  }

  return { b64, utf8, rand, KDF, createVault, wrapAccount, unlock, setToken };
});
