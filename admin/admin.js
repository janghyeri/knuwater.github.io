/* =====================================================================
   admin/admin.js — 연구실 홈페이지 관리자 (서버 없이 GitHub Pages 위에서 동작)

   - 로그인: admin/vault.json 에 등록된 관리자 ID + 비밀번호
   - 저장: 금고에서 복호화한 GitHub 토큰으로 data/*.js 파일을 저장소에 커밋
   - 사진: assets/img/ 아래로 업로드
   ===================================================================== */
(function () {
  "use strict";

  /* ---------------- 설정 ---------------- */
  const REPO = "janghyeri/knuwater.github.io";   // 저장소 (owner/name)
  const BRANCH = "main";
  const VAULT_PATH = "admin/vault.json";
  const API = "https://api.github.com";
  const MIN_PW = 10;

  const VC = window.VaultCrypto;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const app = $("#app");

  const S = { token: "", masterRaw: null, user: null, vault: null, cur: "news", files: {}, ui: { group: {}, section: {}, edit: null, q: "" } };

  /* ---------------- 공통 UI ---------------- */
  let toastTimer;
  function toast(msg, err) {
    const t = $("#toast"); t.textContent = msg; t.className = "toast show" + (err ? " err" : "");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => (t.className = "toast"), err ? 6000 : 3500);
  }
  function busy(btn, on, label) {
    if (!btn) return;
    if (on) { btn.dataset.label = btn.innerHTML; btn.disabled = true; btn.innerHTML = `<span class="spinner"></span>${label || "처리 중…"}`; }
    else { btn.disabled = false; btn.innerHTML = btn.dataset.label || btn.innerHTML; }
  }
  const getPath = (obj, path) => path.split(".").reduce((o, k) => (o == null ? undefined : o[k]), obj);
  function setPath(obj, path, val) {
    const ks = path.split("."); let o = obj;
    ks.slice(0, -1).forEach((k) => { if (o[k] == null || typeof o[k] !== "object") o[k] = {}; o = o[k]; });
    o[ks[ks.length - 1]] = val;
  }

  /* ---------------- GitHub API ---------------- */
  async function gh(path, opts) {
    opts = opts || {};
    const headers = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
    if (S.token) headers.Authorization = "Bearer " + S.token;
    if (opts.body) headers["Content-Type"] = "application/json";
    const res = await fetch(API + path, { method: opts.method || "GET", headers, body: opts.body ? JSON.stringify(opts.body) : undefined });
    if (!res.ok) {
      let msg = res.status + " " + res.statusText;
      try { const j = await res.json(); if (j.message) msg += " — " + j.message; } catch (e) {}
      const err = new Error(msg); err.status = res.status; throw err;
    }
    return res.status === 204 ? null : res.json();
  }
  async function getFile(path) {
    const r = await gh(`/repos/${REPO}/contents/${path}?ref=${BRANCH}`);
    return { text: VC.utf8.dec(VC.b64.dec(r.content)), sha: r.sha };
  }
  async function getSha(path) {
    try { const r = await gh(`/repos/${REPO}/contents/${path}?ref=${BRANCH}`); return r.sha; } catch (e) { if (e.status === 404) return undefined; throw e; }
  }
  async function putFile(path, content64, sha, message) {
    const r = await gh(`/repos/${REPO}/contents/${path}`, { method: "PUT", body: { message, content: content64, sha: sha || undefined, branch: BRANCH } });
    return r.content.sha;
  }
  async function verifyToken(token) {
    const prev = S.token; S.token = token;
    try {
      const user = await gh("/user");
      let repo;
      try { repo = await gh(`/repos/${REPO}`); }
      catch (e) { throw new Error(e.status === 404 ? "이 토큰은 저장소(" + REPO + ")에 접근할 수 없습니다. 토큰의 Repository access 설정을 확인하세요." : e.message); }
      const p = repo.permissions || {};
      if (!(p.push || p.admin || p.maintain)) throw new Error("이 토큰에는 저장소 쓰기 권한(Contents: Read and write)이 없습니다.");
      return user;
    } catch (e) {
      S.token = prev;
      if (e.status === 401) throw new Error("토큰이 유효하지 않습니다 (만료되었거나 잘못 입력됨).");
      throw e;
    }
  }

  /* ---------------- 금고(vault) ---------------- */
  async function loadVault() {
    const tries = [
      `${API}/repos/${REPO}/contents/${VAULT_PATH}?ref=${BRANCH}&t=${Date.now()}`,   // 최신 (public repo, 인증 불필요)
      `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${VAULT_PATH}?t=${Date.now()}`,
      `vault.json?t=${Date.now()}`
    ];
    for (const url of tries) {
      try {
        const r = await fetch(url, { cache: "no-store", headers: url.startsWith(API) ? { Accept: "application/vnd.github.raw+json" } : {} });
        if (r.status === 404) continue;
        if (!r.ok) continue;
        const text = await r.text();
        return JSON.parse(text);
      } catch (e) { /* 다음 방법 시도 */ }
    }
    return null;
  }
  async function saveVault(message) {
    const sha = await getSha(VAULT_PATH);
    await putFile(VAULT_PATH, VC.b64.enc(VC.utf8.enc(JSON.stringify(S.vault, null, 2) + "\n")), sha, message);
  }

  /* ---------------- 세션 ---------------- */
  function saveSession() {
    try { sessionStorage.setItem("knuAdmin", JSON.stringify({ token: S.token, master: VC.b64.enc(S.masterRaw), user: S.user })); } catch (e) {}
  }
  function loadSession() {
    try {
      const j = JSON.parse(sessionStorage.getItem("knuAdmin") || "null");
      if (j && j.token) { S.token = j.token; S.masterRaw = VC.b64.dec(j.master); S.user = j.user; return true; }
    } catch (e) {}
    return false;
  }
  function logout() { S.token = ""; S.masterRaw = null; S.user = null; S.files = {}; sessionStorage.removeItem("knuAdmin"); renderAuth(); }

  /* ---------------- 데이터 스키마 ---------------- */
  const PERSON = [
    { k: "nameEn", l: "영문 이름", req: 1 }, { k: "nameKo", l: "한글 이름", req: 1 },
    { k: "role", l: "직위 (예: Professor)" }, { k: "dept", l: "소속" },
    { k: "email", l: "이메일" }, { k: "office", l: "연구실/사무실" },
    { k: "photo", l: "사진", t: "image", folder: "assets/img/members", full: 1 },
    { k: "interests", l: "연구 분야", t: "lines", full: 1 },
    { k: "education", l: "학력", t: "lines" }, { k: "career", l: "경력", t: "lines" },
    { k: "activities", l: "대외 활동", t: "lines" }, { k: "awards", l: "수상", t: "lines" },
    { k: "courses.ug", l: "강의 (학부)", t: "lines" }, { k: "courses.grad", l: "강의 (대학원)", t: "lines" }
  ];
  const STUDENT = [
    { k: "nameEn", l: "영문 이름", req: 1 }, { k: "nameKo", l: "한글 이름", req: 1 },
    { k: "level", l: "과정", t: "select", opts: [["phd", "박사과정"], ["msphd", "석박사통합과정"], ["ms", "석사과정"], ["bsms", "학석연계과정"], ["ug", "학부연구생"]], req: 1 },
    { k: "status", l: "표시 문구 (예: M.S. Student, Ph.D. Candidate)" },
    { k: "email", l: "이메일" }, { k: "photo", l: "사진", t: "image", folder: "assets/img/members" },
    { k: "interests", l: "연구 관심사", t: "lines", full: 1 }
  ];
  const ALUMNI = [
    { k: "nameEn", l: "영문 이름", req: 1 }, { k: "nameKo", l: "한글 이름" },
    { k: "degree", l: "학위", t: "select", opts: ["Ph.D.", "M.S.", "B.S."], req: 1 },
    { k: "graduated", l: "졸업 연월", t: "month", req: 1 },
    { k: "current", l: "현재 소속 (직장·직위)" }, { k: "email", l: "이메일" },
    { k: "thesis", l: "학위논문 제목", full: 1 },
    { k: "photo", l: "사진 (선택)", t: "image", folder: "assets/img/members", full: 1 }
  ];
  const COLS = [
    { id: "news", label: "소식", file: "data/news.js", key: "news", kind: "list", sort: (a, b) => String(b.date).localeCompare(String(a.date)),
      cols: [["date", "날짜"], ["tag", "구분"], ["title", "제목"]],
      fields: [
        { k: "date", l: "날짜", t: "date", req: 1 },
        { k: "tag", l: "구분", t: "select", opts: ["Notice", "Paper", "Conference", "Award", "Welcome", "News"] },
        { k: "title", l: "제목", req: 1, full: 1 },
        { k: "desc", l: "요약 (한두 줄)", t: "textarea", full: 1 },
        { k: "body", l: "상세 내용 (선택, 소식 페이지에서 펼쳐서 표시)", t: "textarea", rows: 6, full: 1 },
        { k: "link", l: "관련 링크 (선택)", full: 1 }
      ] },
    { id: "publications", label: "논문·발표", file: "data/publications.js", key: "publications", kind: "groups",
      groups: [["sci", "SCI(E) 논문"], ["domestic", "국내 논문"], ["intConf", "국제 학술발표"], ["domConf", "국내 학술발표"], ["patent", "특허"], ["book", "저서·보고서"]],
      sort: (a, b) => (b.year || 0) - (a.year || 0), cols: [["year", "연도"], ["title", "제목"], ["venue", "게재지 · 학회"]],
      fields: [
        { k: "year", l: "연도", t: "number", req: 1 },
        { k: "link", l: "링크 (DOI 등, 없으면 비움)" },
        { k: "title", l: "제목", req: 1, full: 1 },
        { k: "authors", l: "저자 (세미콜론 ; 으로 구분)", req: 1, full: 1 },
        { k: "venue", l: "학술지·학회, 권(호), 쪽, 연월", full: 1 }
      ] },
    { id: "members", label: "구성원", file: "data/members.js", key: "members", kind: "members",
      sections: [
        { key: "professor", label: "교수", kind: "object", fields: PERSON },
        { key: "emeritus", label: "명예교수", kind: "object", fields: PERSON },
        { key: "students", label: "학생", kind: "list", fields: STUDENT, cols: [["nameEn", "이름"], ["level", "과정"], ["email", "이메일"]], manual: 1, graduate: 1 },
        { key: "alumni", label: "졸업생", kind: "list", fields: ALUMNI, cols: [["nameEn", "이름"], ["degree", "학위"], ["graduated", "졸업"], ["current", "현재 소속"]], sort: (a, b) => String(b.graduated || "").localeCompare(String(a.graduated || "")) || String(a.nameEn || "").localeCompare(String(b.nameEn || "")) }
      ] },
    { id: "gallery", label: "갤러리", file: "data/gallery.js", key: "gallery", kind: "list", sort: (a, b) => String(b.date).localeCompare(String(a.date)),
      cols: [["date", "날짜"], ["category", "분류"], ["title", "제목"]],
      fields: [
        { k: "date", l: "날짜", t: "date", req: 1 },
        { k: "category", l: "분류", t: "select", opts: ["Conference", "Lab life", "Field work", "Award", "Seminar"] },
        { k: "title", l: "제목", req: 1, full: 1 },
        { k: "image", l: "사진", t: "image", folder: "assets/img/gallery", full: 1 },
        { k: "caption", l: "설명 (선택)", t: "textarea", full: 1 }
      ] },
    { id: "projects", label: "연구과제", file: "data/projects.js", key: "projects", kind: "list", sort: (a, b) => String(b.period || "").localeCompare(String(a.period || "")),
      cols: [["period", "기간"], ["title", "과제명"], ["agency", "기관"]],
      fields: [
        { k: "title", l: "과제명", req: 1, full: 1 },
        { k: "agency", l: "발주·지원 기관" }, { k: "period", l: "기간 (예: 2024.03 – 2026.02)" },
        { k: "role", l: "역할", t: "select", opts: ["주관", "참여", "위탁", "자문"] },
        { k: "status", l: "상태", t: "select", opts: ["진행 중", "완료"] },
        { k: "desc", l: "설명 (선택)", t: "textarea", full: 1 }
      ] },
    { id: "hero", label: "메인 슬라이드", file: "data/hero.js", key: "hero", kind: "list", manual: 1,
      cols: [["badge", "라벨"], ["title", "제목"]],
      fields: [
        { k: "badge", l: "작은 라벨" }, { k: "image", l: "배경 사진", t: "image", folder: "assets/img" },
        { k: "title", l: "제목 (줄바꿈은 <br>)", t: "textarea", rows: 2, req: 1, full: 1 },
        { k: "lead", l: "설명", t: "textarea", full: 1 },
        { k: "btn1Label", l: "버튼1 문구" }, { k: "btn1Href", l: "버튼1 링크 (예: research.html)" },
        { k: "btn2Label", l: "버튼2 문구" }, { k: "btn2Href", l: "버튼2 링크" }
      ] }
  ];
  const HEADERS = {
    news: "소식(News) 데이터 — 관리자 페이지(admin/)에서 편집됩니다. date: YYYY-MM-DD, tag: Notice|Paper|Conference|Award|Welcome|News",
    publications: "논문/학술발표 데이터 — 관리자 페이지(admin/)에서 편집됩니다. 카테고리: sci | domestic | intConf | domConf | patent | book (빈 카테고리 탭은 자동 숨김)",
    members: "구성원 데이터 — 관리자 페이지(admin/)에서 편집됩니다. level: phd | ms | ug",
    gallery: "갤러리 데이터 — 관리자 페이지(admin/)에서 편집됩니다. 사진은 assets/img/gallery/ 에 업로드됩니다.",
    projects: "연구과제 데이터 — 관리자 페이지(admin/)에서 편집됩니다. status: 진행 중 | 완료",
    hero: "메인 페이지 상단 슬라이드 — 관리자 페이지(admin/)에서 편집됩니다. title 의 줄바꿈은 <br>"
  };

  function parseData(src, key) {
    const w = {};
    try { new Function("window", src)(w); } catch (e) { throw new Error("데이터 파일을 해석할 수 없습니다: " + e.message); }
    const d = (w.LAB_DATA || {})[key];
    if (d === undefined) throw new Error("데이터 파일에 " + key + " 항목이 없습니다.");
    return d;
  }
  function serialize(col, data) {
    return `/* =====================================================================\n   ${HEADERS[col.key]}\n   (직접 편집해도 됩니다. JSON 형식을 유지하세요.)\n   ===================================================================== */\nwindow.LAB_DATA = window.LAB_DATA || {};\n\nwindow.LAB_DATA.${col.key} = ${JSON.stringify(data, null, 2)};\n`;
  }
  const colById = (id) => COLS.find((c) => c.id === id);

  async function loadCol(col, force) {
    if (S.files[col.id] && !force) return S.files[col.id];
    const f = await getFile(col.file);
    S.files[col.id] = { data: parseData(f.text, col.key), sha: f.sha, dirty: false };
    return S.files[col.id];
  }
  async function saveCol(col, btn) {
    const f = S.files[col.id];
    if (!f) return;
    busy(btn, true, "GitHub에 저장 중…");
    try {
      // 저장 전 정렬
      if (col.kind === "list" && col.sort) f.data.sort(col.sort);
      if (col.kind === "groups") Object.keys(f.data).forEach((g) => Array.isArray(f.data[g]) && f.data[g].sort(col.sort));
      if (col.kind === "members" && Array.isArray(f.data.alumni)) f.data.alumni = window.AdminUtil.sortAlumni(f.data.alumni);
      const sha = await putFile(col.file, VC.b64.enc(VC.utf8.enc(serialize(col, f.data))), f.sha, `Update ${col.file} (admin: ${S.user.login})`);
      f.sha = sha; f.dirty = false;
      toast("저장되었습니다. 1~2분 후 사이트에 반영됩니다.");
      renderApp();
    } catch (e) {
      if (e.status === 409) toast("다른 곳에서 먼저 수정되었습니다. '다시 불러오기' 후 다시 저장하세요.", true);
      else toast("저장 실패: " + e.message, true);
      busy(btn, false);
    }
  }
  async function uploadImage(file, folder) {
    if (file.size > 3 * 1024 * 1024) throw new Error("사진은 3MB 이하로 올려 주세요. (https://squoosh.app 에서 줄일 수 있습니다)");
    const base = file.name.toLowerCase().normalize("NFKD").replace(/[^\w.-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const name = base || ("img-" + Date.now() + ".jpg");
    const path = `${folder}/${name}`;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const sha = await getSha(path);
    await putFile(path, VC.b64.enc(bytes), sha, `Upload ${path} (admin: ${S.user.login})`);
    return path;
  }
  const anyDirty = () => Object.values(S.files).some((f) => f.dirty);
  window.addEventListener("beforeunload", (e) => { if (anyDirty()) { e.preventDefault(); e.returnValue = ""; } });

  /* ---------------- 인증 화면 ---------------- */
  function tokenGuide() {
    return `<details style="margin:10px 0 0"><summary style="cursor:pointer;font-weight:700;font-size:14px;color:var(--brand)">GitHub 토큰 만드는 방법 (최초 1회)</summary>
      <ol class="steps" style="margin-top:8px">
        <li>GitHub 로그인 → 오른쪽 위 프로필 → <b>Settings</b> → 왼쪽 맨 아래 <b>Developer settings</b></li>
        <li><b>Personal access tokens → Fine-grained tokens → Generate new token</b></li>
        <li>Token name: <code>knuwater-admin</code>, Expiration: 원하는 기간(예: 1 year)</li>
        <li>Repository access: <b>Only select repositories</b> → <code>${esc(REPO)}</code> 선택</li>
        <li>Permissions → Repository permissions → <b>Contents: Read and write</b> (Metadata는 자동)</li>
        <li>Generate 후 표시되는 <code>github_pat_…</code> 값을 아래에 붙여넣기</li>
      </ol>
      <p class="hint" style="margin-top:8px">토큰은 관리자 비밀번호로 암호화되어 <code>admin/vault.json</code>에 저장되며, 원문은 어디에도 남지 않습니다.</p>
    </details>`;
  }
  function renderAuth() {
    if (!S.vault) return renderSetup();
    app.innerHTML = `
<div class="login">
  <h1>관리자 로그인</h1>
  <p class="sub">등록된 관리자 ID와 비밀번호로 들어갑니다.</p>
  <form id="f">
    <div class="field"><label>관리자 ID</label><input name="id" autocomplete="username" required autofocus></div>
    <div class="field"><label>비밀번호</label><input name="pw" type="password" autocomplete="current-password" required></div>
    <div id="msg"></div>
    <button class="btn primary" type="submit">로그인</button>
  </form>
  <div class="foot"><a href="../index.html">← 홈페이지로</a></div>
</div>`;
    $("#f").addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = $("#f button"), fd = new FormData(e.target);
      busy(btn, true, "확인 중…"); $("#msg").innerHTML = "";
      try {
        const { token, masterRaw } = await VC.unlock(S.vault, fd.get("id"), fd.get("pw"));
        S.masterRaw = masterRaw;
        try { S.user = await verifyToken(token); }
        catch (err) { S.token = token; return renderTokenReset(err.message); }
        saveSession(); renderApp();
      } catch (err) { $("#msg").innerHTML = `<div class="alert err">${esc(err.message)}</div>`; busy(btn, false); }
    });
  }
  function renderSetup() {
    app.innerHTML = `
<div class="login" style="max-width:560px">
  <h1>관리자 초기 설정</h1>
  <p class="sub">아직 관리자 금고(admin/vault.json)가 없습니다. 저장에 사용할 GitHub 토큰과 첫 관리자 계정을 만드세요.</p>
  <form id="f">
    <div class="field"><label class="req">GitHub 토큰 (Fine-grained, Contents: Read and write)</label><input name="token" type="password" autocomplete="off" required placeholder="github_pat_…"></div>
    ${tokenGuide()}
    <hr style="border:0;border-top:1px solid var(--line);margin:16px 0">
    <div class="field"><label class="req">관리자 ID</label><input name="id" required placeholder="예: hyeri"></div>
    <div class="field"><label class="req">비밀번호 <small>(${MIN_PW}자 이상, 길수록 안전)</small></label><input name="pw" type="password" autocomplete="new-password" required minlength="${MIN_PW}"></div>
    <div class="field"><label class="req">비밀번호 확인</label><input name="pw2" type="password" autocomplete="new-password" required></div>
    <div id="msg"></div>
    <button class="btn primary" type="submit">금고 만들고 시작하기</button>
  </form>
  <div class="foot"><a href="../index.html">← 홈페이지로</a></div>
</div>`;
    $("#f").addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = $("#f button"), fd = new FormData(e.target);
      const token = fd.get("token").trim(), id = fd.get("id").trim(), pw = fd.get("pw"), pw2 = fd.get("pw2");
      $("#msg").innerHTML = "";
      if (pw !== pw2) return ($("#msg").innerHTML = `<div class="alert err">비밀번호 확인이 일치하지 않습니다.</div>`);
      if (pw.length < MIN_PW) return ($("#msg").innerHTML = `<div class="alert err">비밀번호는 ${MIN_PW}자 이상이어야 합니다.</div>`);
      busy(btn, true, "토큰 확인 중…");
      try {
        S.user = await verifyToken(token);
        btn.innerHTML = `<span class="spinner"></span>금고 만드는 중…`;
        const { vault, masterRaw } = await VC.createVault({ token, id, password: pw, repo: REPO, branch: BRANCH });
        S.vault = vault; S.masterRaw = masterRaw;
        await saveVault(`Create admin vault (admin: ${S.user.login})`);
        saveSession(); toast("관리자 금고를 만들었습니다."); renderApp();
      } catch (err) { $("#msg").innerHTML = `<div class="alert err">${esc(err.message)}</div>`; busy(btn, false); }
    });
  }
  function renderTokenReset(reason) {
    app.innerHTML = `
<div class="login" style="max-width:560px">
  <h1>토큰 다시 등록</h1>
  <div class="alert err">${esc(reason)}</div>
  <p class="sub">금고에 저장된 GitHub 토큰을 더 이상 쓸 수 없습니다. 새 토큰을 발급해 등록하면 모든 관리자 계정이 그대로 유지됩니다.</p>
  <form id="f">
    <div class="field"><label class="req">새 GitHub 토큰</label><input name="token" type="password" autocomplete="off" required placeholder="github_pat_…"></div>
    ${tokenGuide()}
    <div id="msg"></div>
    <button class="btn primary" type="submit">토큰 등록</button>
  </form>
  <div class="foot"><a href="#" id="back">← 로그인으로</a></div>
</div>`;
    $("#back").addEventListener("click", (e) => { e.preventDefault(); S.token = ""; renderAuth(); });
    $("#f").addEventListener("submit", async (e) => {
      e.preventDefault();
      const btn = $("#f button"), token = new FormData(e.target).get("token").trim();
      busy(btn, true, "확인 중…"); $("#msg").innerHTML = "";
      try {
        S.user = await verifyToken(token);
        await VC.setToken(S.vault, S.masterRaw, token);
        await saveVault(`Rotate admin token (admin: ${S.user.login})`);
        saveSession(); toast("새 토큰을 등록했습니다."); renderApp();
      } catch (err) { $("#msg").innerHTML = `<div class="alert err">${esc(err.message)}</div>`; busy(btn, false); }
    });
  }

  /* ---------------- 앱 화면 ---------------- */
  function renderApp() {
    const side = COLS.map((c) => `<button data-view="${c.id}" class="${S.cur === c.id ? "active" : ""}${S.files[c.id] && S.files[c.id].dirty ? " dirty" : ""}">${esc(c.label)}<span class="dot" title="저장 안 됨"></span></button>`).join("");
    app.innerHTML = `
<div class="adm-top"><div class="in">
  <a class="brand" href="../index.html"><img src="../assets/img/knu-signature-white.png" alt="경북대학교"><span>수자원 연구실 관리자<br><small>KNU Water Resources Lab · Admin</small></span></a>
  <div class="right"><span>${esc(S.user && S.user.login)}</span><a href="../index.html" target="_blank" rel="noopener">사이트 보기 ↗</a><button class="btn outline" id="logout">로그아웃</button></div>
</div></div>
<div class="adm-wrap">
  <aside class="adm-side">${side}<hr>
    <button data-view="accounts" class="${S.cur === "accounts" ? "active" : ""}">관리자 계정</button>
    <button data-view="help" class="${S.cur === "help" ? "active" : ""}">도움말</button>
  </aside>
  <main class="adm-main" id="main"></main>
</div>`;
    $("#logout").addEventListener("click", () => { if (anyDirty() && !confirm("저장하지 않은 변경이 있습니다. 로그아웃할까요?")) return; logout(); });
    $$(".adm-side button").forEach((b) => b.addEventListener("click", () => { S.cur = b.dataset.view; S.ui.edit = null; S.ui.q = ""; renderApp(); }));
    renderMain();
  }
  async function renderMain() {
    const main = $("#main");
    if (S.cur === "accounts") return renderAccounts(main);
    if (S.cur === "help") return renderHelp(main);
    const col = colById(S.cur);
    main.innerHTML = `<div class="panel"><p class="hint"><span class="spinner" style="border-color:#999;border-right-color:transparent"></span> ${esc(col.label)} 불러오는 중…</p></div>`;
    try { await loadCol(col); } catch (e) { main.innerHTML = `<div class="panel"><div class="alert err">불러오기 실패: ${esc(e.message)}</div></div>`; return; }
    if (col.kind === "members") renderMembers(main, col); else renderListView(main, col);
  }

  /* ----- 목록형 (news / gallery / projects / hero / publications) ----- */
  function currentItems(col) {
    const f = S.files[col.id];
    if (col.kind === "groups") { const g = S.ui.group[col.id] || col.groups[0][0]; if (!Array.isArray(f.data[g])) f.data[g] = []; return f.data[g]; }
    return f.data;
  }
  function renderListView(main, col) {
    const f = S.files[col.id];
    const items = currentItems(col);
    const q = S.ui.q.toLowerCase();
    const shown = items.map((it, i) => ({ it, i })).filter(({ it }) => !q || JSON.stringify(it).toLowerCase().includes(q));
    const groupSel = col.kind === "groups" ? `<select id="group">${col.groups.map(([k, l]) => `<option value="${k}" ${(S.ui.group[col.id] || col.groups[0][0]) === k ? "selected" : ""}>${esc(l)} (${(f.data[k] || []).length})</option>`).join("")}</select>` : "";
    main.innerHTML = `
<div class="panel">
  <h2>${esc(col.label)} <small class="muted" style="font-size:13px;font-weight:600">${items.length}건</small></h2>
  <p class="hint">${col.manual ? "표시 순서는 목록 순서를 따릅니다 (↑↓로 변경)." : "저장 시 최신순으로 자동 정렬됩니다."} 변경 후 반드시 <b>GitHub에 저장</b>을 눌러야 사이트에 반영됩니다.</p>
  <div class="toolbar">
    ${groupSel}
    <input type="search" id="q" placeholder="검색" value="${esc(S.ui.q)}">
    <span class="grow"></span>
    <button class="btn outline" id="add">+ 추가</button>
    <button class="btn outline" id="reload">다시 불러오기</button>
    <button class="btn primary" id="save" ${f.dirty ? "" : "disabled"}>GitHub에 저장</button>
  </div>
  <div id="form"></div>
  <div style="overflow-x:auto"><table class="list"><thead><tr>${col.cols.map(([, l]) => `<th>${esc(l)}</th>`).join("")}<th></th></tr></thead>
  <tbody>${shown.map(({ it, i }) => `<tr>${col.cols.map(([k]) => `<td><div class="trunc">${esc(display(col, k, it[k]))}</div></td>`).join("")}
    <td class="ops">${col.manual ? `<button data-up="${i}" title="위로">↑</button><button data-down="${i}" title="아래로">↓</button>` : ""}<button data-edit="${i}">수정</button><button data-del="${i}">삭제</button></td></tr>`).join("") || `<tr><td colspan="${col.cols.length + 1}" class="muted" style="text-align:center;padding:24px">${q ? "검색 결과가 없습니다." : "아직 항목이 없습니다. '+ 추가'를 눌러 입력하세요."}</td></tr>`}</tbody></table></div>
</div>`;
    if (groupSel) $("#group").addEventListener("change", (e) => { S.ui.group[col.id] = e.target.value; S.ui.edit = null; renderListView(main, col); });
    $("#q").addEventListener("input", (e) => { S.ui.q = e.target.value; renderListView(main, col); $("#q").focus(); const v = $("#q").value; $("#q").setSelectionRange(v.length, v.length); });
    $("#add").addEventListener("click", () => openForm(main, col, items, null));
    $("#reload").addEventListener("click", async () => { if (f.dirty && !confirm("저장하지 않은 변경을 버리고 다시 불러올까요?")) return; await loadCol(col, true); S.ui.edit = null; renderApp(); });
    $("#save").addEventListener("click", (e) => saveCol(col, e.currentTarget));
    $$("[data-edit]").forEach((b) => b.addEventListener("click", () => openForm(main, col, items, +b.dataset.edit)));
    $$("[data-del]").forEach((b) => b.addEventListener("click", () => { const i = +b.dataset.del; if (!confirm(`삭제할까요?\n${summary(col, items[i])}`)) return; items.splice(i, 1); f.dirty = true; renderApp(); }));
    $$("[data-up]").forEach((b) => b.addEventListener("click", () => move(col, items, +b.dataset.up, -1)));
    $$("[data-down]").forEach((b) => b.addEventListener("click", () => move(col, items, +b.dataset.down, 1)));
    if (S.ui.edit && S.ui.edit.col === col.id) openForm(main, col, items, S.ui.edit.index, true);
  }
  function move(col, items, i, d) { const j = i + d; if (j < 0 || j >= items.length) return; [items[i], items[j]] = [items[j], items[i]]; S.files[col.id].dirty = true; renderApp(); }
  function display(col, k, v) {
    const fld = (col.fields || []).find((x) => x.k === k);
    if (fld && fld.t === "select" && Array.isArray(fld.opts) && Array.isArray(fld.opts[0])) { const o = fld.opts.find((p) => p[0] === v); return o ? o[1] : v; }
    if (Array.isArray(v)) return v.join(", ");
    return v == null ? "" : String(v).replace(/<br\s*\/?>/gi, " / ");
  }
  const summary = (col, it) => col.cols.map(([k]) => display(col, k, it[k])).filter(Boolean).join(" · ");

  /* ----- 입력 폼 ----- */
  function fieldHtml(fld, val) {
    const id = "f_" + fld.k.replace(/\./g, "_");
    const label = `<label for="${id}" class="${fld.req ? "req" : ""}">${esc(fld.l)}${fld.t === "lines" ? ' <small>(한 줄에 하나)</small>' : ""}</label>`;
    let input;
    if (fld.t === "textarea" || fld.t === "lines") input = `<textarea id="${id}" name="${fld.k}" rows="${fld.rows || (fld.t === "lines" ? 4 : 3)}">${esc(Array.isArray(val) ? val.join("\n") : val || "")}</textarea>`;
    else if (fld.t === "select") input = `<select id="${id}" name="${fld.k}">${fld.opts.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(v)}" ${String(val) === String(v) ? "selected" : ""}>${esc(l)}</option>`; }).join("")}</select>`;
    else if (fld.t === "image") input = `<div class="img"><img id="${id}_pv" src="${val ? "../" + esc(val) : ""}" alt="" onerror="this.style.visibility='hidden'"><input id="${id}" name="${fld.k}" value="${esc(val || "")}" placeholder="${esc(fld.folder)}/파일명.jpg"><label class="btn outline sm" for="${id}_file">업로드</label><input type="file" id="${id}_file" accept="image/*" data-folder="${fld.folder}" data-target="${id}"></div>`;
    else input = `<input id="${id}" name="${fld.k}" type="${fld.t || "text"}" value="${esc(val == null ? "" : val)}" ${fld.req ? "required" : ""}>`;
    return `<div class="field ${fld.full ? "full" : ""}">${label}${input}</div>`;
  }
  function bindUploads(root) {
    $$("input[type=file]", root).forEach((inp) => inp.addEventListener("change", async () => {
      const file = inp.files[0]; if (!file) return;
      const target = $("#" + inp.dataset.target), pv = $("#" + inp.dataset.target + "_pv"), lab = root.querySelector(`label[for="${inp.id}"]`);
      busy(lab, true, "업로드 중…");
      try { const path = await uploadImage(file, inp.dataset.folder); target.value = path; pv.src = "../" + path + "?t=" + Date.now(); pv.style.visibility = "visible"; toast("사진을 업로드했습니다: " + path); }
      catch (e) { toast("업로드 실패: " + e.message, true); }
      busy(lab, false); inp.value = "";
    }));
  }
  function readForm(form, fields, target) {
    for (const fld of fields) {
      const el = form.elements[fld.k]; if (!el) continue;
      let v = el.value;
      if (fld.t === "lines") v = v.split("\n").map((s) => s.trim()).filter(Boolean);
      else if (fld.t === "number") v = v === "" ? "" : Number(v);
      else v = String(v).trim();
      if (fld.req && (v === "" || (Array.isArray(v) && !v.length))) throw new Error(`'${fld.l}' 항목은 필수입니다.`);
      setPath(target, fld.k, v);
    }
    return target;
  }
  function openForm(main, col, items, index, keep) {
    S.ui.edit = { col: col.id, index };
    const it = index == null ? {} : items[index];
    const box = $("#form");
    box.innerHTML = `<form class="form" id="itemForm"><h3>${index == null ? "새 항목 추가" : "항목 수정"}</h3>
      <div class="fgrid">${col.fields.map((f) => fieldHtml(f, getPath(it, f.k))).join("")}</div>
      <div id="fmsg"></div>
      <div class="actions"><button class="btn primary" type="submit">${index == null ? "목록에 추가" : "적용"}</button><button class="btn outline" type="button" id="cancel">취소</button></div>
      <p class="hint" style="margin:10px 0 0">'적용' 후 위의 <b>GitHub에 저장</b>을 눌러야 사이트에 반영됩니다.</p></form>`;
    bindUploads(box);
    if (!keep) box.scrollIntoView({ behavior: "smooth", block: "start" });
    $("#cancel").addEventListener("click", () => { S.ui.edit = null; box.innerHTML = ""; });
    $("#itemForm").addEventListener("submit", (e) => {
      e.preventDefault();
      try {
        const obj = readForm(e.target, col.fields, index == null ? {} : JSON.parse(JSON.stringify(it)));
        if (index == null) items.unshift(obj); else items[index] = obj;
        S.files[col.id].dirty = true; S.ui.edit = null; renderApp();
      } catch (err) { $("#fmsg").innerHTML = `<div class="alert err">${esc(err.message)}</div>`; }
    });
  }

  /* ----- 구성원 ----- */
  function renderMembers(main, col) {
    const f = S.files[col.id];
    const secKey = S.ui.section[col.id] || col.sections[0].key;
    const sec = col.sections.find((s) => s.key === secKey);
    main.innerHTML = `
<div class="panel">
  <h2>구성원</h2>
  <p class="hint">교수·명예교수는 이력서형으로, 학생·졸업생은 카드 목록으로 표시됩니다. 변경 후 <b>GitHub에 저장</b>을 눌러야 반영됩니다.</p>
  <div class="toolbar">
    <div class="subtabs" style="margin:0">${col.sections.map((s) => `<button type="button" data-sec="${s.key}" class="${s.key === secKey ? "active" : ""}">${esc(s.label)}</button>`).join("")}</div>
    <span class="grow"></span>
    <button class="btn outline" id="reload">다시 불러오기</button>
    <button class="btn primary" id="save" ${f.dirty ? "" : "disabled"}>GitHub에 저장</button>
  </div>
  <div id="secbody"></div>
</div>`;
    $$("[data-sec]").forEach((b) => b.addEventListener("click", () => { S.ui.section[col.id] = b.dataset.sec; S.ui.edit = null; renderMembers(main, col); }));
    $("#reload").addEventListener("click", async () => { if (f.dirty && !confirm("저장하지 않은 변경을 버리고 다시 불러올까요?")) return; await loadCol(col, true); S.ui.edit = null; renderApp(); });
    $("#save").addEventListener("click", (e) => saveCol(col, e.currentTarget));
    const body = $("#secbody");
    if (sec.kind === "object") {
      if (!f.data[sec.key]) f.data[sec.key] = {};
      const obj = f.data[sec.key];
      body.innerHTML = `<form class="form" id="objForm"><h3>${esc(sec.label)} 정보</h3><div class="fgrid">${sec.fields.map((x) => fieldHtml(x, getPath(obj, x.k))).join("")}</div><div id="fmsg"></div><div class="actions"><button class="btn primary" type="submit">적용</button></div></form>`;
      bindUploads(body);
      $("#objForm").addEventListener("submit", (e) => {
        e.preventDefault();
        try { readForm(e.target, sec.fields, obj); f.dirty = true; toast("적용했습니다. 'GitHub에 저장'을 눌러 반영하세요."); renderApp(); }
        catch (err) { $("#fmsg").innerHTML = `<div class="alert err">${esc(err.message)}</div>`; }
      });
    } else {
      if (!Array.isArray(f.data[sec.key])) f.data[sec.key] = [];
      const items = f.data[sec.key];
      const sub = { id: col.id, label: sec.label, cols: sec.cols, fields: sec.fields, manual: sec.manual };
      const shown = sec.sort ? items.map((it, i) => ({ it, i })).sort((a, b) => sec.sort(a.it, b.it)) : items.map((it, i) => ({ it, i }));
      body.innerHTML = `<div class="toolbar"><span class="muted" style="font-size:14px">${items.length}명 · ${sec.manual ? "표시 순서는 목록 순서(↑↓)" : "저장 시 최근 졸업순으로 자동 정렬"}${sec.graduate ? " · 졸업하면 <b>졸업 처리</b>를 눌러 졸업생으로 옮기세요" : ""}</span><span class="grow"></span><button class="btn outline" id="add">+ 추가</button></div><div id="form"></div>
        <div style="overflow-x:auto"><table class="list"><thead><tr>${sec.cols.map(([, l]) => `<th>${esc(l)}</th>`).join("")}<th></th></tr></thead><tbody>
        ${shown.map(({ it, i }) => `<tr>${sec.cols.map(([k]) => `<td><div class="trunc">${esc(display(sub, k, it[k]))}</div></td>`).join("")}<td class="ops">${sec.manual ? `<button data-up="${i}">↑</button><button data-down="${i}">↓</button>` : ""}${sec.graduate ? `<button data-grad="${i}" style="color:var(--brand);border-color:#f5c2c4">졸업 처리</button>` : ""}<button data-edit="${i}">수정</button><button data-del="${i}">삭제</button></td></tr>`).join("") || `<tr><td colspan="${sec.cols.length + 1}" class="muted" style="text-align:center;padding:24px">아직 항목이 없습니다.</td></tr>`}
        </tbody></table></div>`;
      $("#add").addEventListener("click", () => openForm(main, sub, items, null));
      $$("[data-grad]").forEach((b) => b.addEventListener("click", () => openGraduate(main, col, items, +b.dataset.grad)));
      $$("[data-edit]").forEach((b) => b.addEventListener("click", () => openForm(main, sub, items, +b.dataset.edit)));
      $$("[data-del]").forEach((b) => b.addEventListener("click", () => { const i = +b.dataset.del; if (!confirm(`삭제할까요?\n${summary(sub, items[i])}`)) return; items.splice(i, 1); f.dirty = true; renderApp(); }));
      $$("[data-up]").forEach((b) => b.addEventListener("click", () => move(col, items, +b.dataset.up, -1)));
      $$("[data-down]").forEach((b) => b.addEventListener("click", () => move(col, items, +b.dataset.down, 1)));
      if (S.ui.edit && S.ui.edit.col === col.id) openForm(main, sub, items, S.ui.edit.index, true);
    }
  }

  /* ----- 졸업 처리: 학생 → 졸업생 ----- */
  function openGraduate(main, col, students, i) {
    const s = students[i], U = window.AdminUtil, f = S.files[col.id];
    const box = $("#form");
    const name = `${s.nameEn || ""}${s.nameKo ? ` (${s.nameKo})` : ""}`;
    box.innerHTML = `<form class="form" id="gradForm"><h3>졸업 처리 — ${esc(name)}</h3>
      <p class="hint">아래 정보를 입력하면 학생 목록에서 빠지고 졸업생 목록으로 이동합니다. 사진·이메일은 그대로 옮겨집니다.</p>
      <div class="fgrid">
        <div class="field"><label class="req">학위</label><select name="degree">${["Ph.D.", "M.S.", "B.S."].map((d) => `<option ${d === (U.DEGREE_BY_LEVEL[s.level] || "M.S.") ? "selected" : ""}>${d}</option>`).join("")}</select></div>
        <div class="field"><label class="req">졸업 연월</label><input name="graduated" type="month" value="${U.thisMonth()}" required></div>
        <div class="field full"><label>현재 소속 (직장·직위, 선택)</label><input name="current"></div>
        <div class="field full"><label>학위논문 제목 (선택)</label><input name="thesis"></div>
      </div>
      <div class="actions"><button class="btn primary" type="submit">졸업생으로 이동</button><button class="btn outline" type="button" id="cancel">취소</button></div></form>`;
    box.scrollIntoView({ behavior: "smooth", block: "start" });
    $("#cancel").addEventListener("click", () => (box.innerHTML = ""));
    $("#gradForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const a = U.toAlumni(s, { degree: fd.get("degree"), graduated: fd.get("graduated"), current: fd.get("current").trim(), thesis: fd.get("thesis").trim() });
      if (!Array.isArray(f.data.alumni)) f.data.alumni = [];
      f.data.alumni.unshift(a);
      students.splice(i, 1);
      f.dirty = true; S.ui.edit = null;
      toast(`${name} 님을 졸업생으로 옮겼습니다. 'GitHub에 저장'을 눌러 반영하세요.`);
      S.ui.section[col.id] = "alumni";
      renderApp();
    });
  }

  /* ----- 관리자 계정 ----- */
  function renderAccounts(main) {
    const accs = S.vault.accounts || [];
    main.innerHTML = `
<div class="panel">
  <h2>관리자 계정</h2>
  <p class="hint">여기에 등록된 ID·비밀번호로만 관리자 페이지에 들어올 수 있습니다. 비밀번호는 ${MIN_PW}자 이상으로 정해 주세요.</p>
  ${accs.map((a) => `<div class="acc"><div><b>${esc(a.id)}</b><small>등록 ${esc(a.created || "")}</small>${a.id === currentId() ? '<small style="color:var(--brand)">(현재 로그인)</small>' : ""}</div><div>${accs.length > 1 ? `<button class="btn danger sm" data-rm="${esc(a.id)}">삭제</button>` : ""}</div></div>`).join("")}
</div>
<div class="two">
  <div class="panel"><h3 style="margin:0 0 10px">관리자 추가</h3>
    <form id="addAcc"><div class="field"><label class="req">새 관리자 ID</label><input name="id" required></div>
    <div class="field" style="margin-top:10px"><label class="req">비밀번호</label><input name="pw" type="password" required minlength="${MIN_PW}" autocomplete="new-password"></div>
    <div class="field" style="margin-top:10px"><label class="req">비밀번호 확인</label><input name="pw2" type="password" required autocomplete="new-password"></div>
    <div id="m1"></div><button class="btn primary" style="margin-top:12px" type="submit">추가</button></form></div>
  <div class="panel"><h3 style="margin:0 0 10px">내 비밀번호 변경</h3>
    <form id="chPw"><div class="field"><label class="req">새 비밀번호</label><input name="pw" type="password" required minlength="${MIN_PW}" autocomplete="new-password"></div>
    <div class="field" style="margin-top:10px"><label class="req">새 비밀번호 확인</label><input name="pw2" type="password" required autocomplete="new-password"></div>
    <div id="m2"></div><button class="btn primary" style="margin-top:12px" type="submit">변경</button></form>
    <hr style="border:0;border-top:1px solid var(--line);margin:18px 0">
    <h3 style="margin:0 0 6px">GitHub 토큰 교체</h3><p class="hint">토큰이 만료되면 새 토큰을 발급해 여기서 교체합니다. 계정은 그대로 유지됩니다.</p>
    <form id="rot"><div class="field"><label class="req">새 토큰</label><input name="token" type="password" required autocomplete="off" placeholder="github_pat_…"></div><div id="m3"></div><button class="btn outline" style="margin-top:12px" type="submit">토큰 교체</button></form></div>
</div>`;
    $$("[data-rm]").forEach((b) => b.addEventListener("click", async () => {
      const id = b.dataset.rm; if (!confirm(`관리자 '${id}' 를 삭제할까요?`)) return;
      busy(b, true, "…");
      try { S.vault.accounts = accs.filter((a) => a.id !== id); await saveVault(`Remove admin account ${id} (admin: ${S.user.login})`); toast("삭제했습니다."); renderAccounts(main); }
      catch (e) { toast("실패: " + e.message, true); busy(b, false); }
    }));
    $("#addAcc").addEventListener("submit", async (e) => {
      e.preventDefault(); const fd = new FormData(e.target), btn = e.target.querySelector("button"); const id = fd.get("id").trim();
      $("#m1").innerHTML = "";
      if (accs.some((a) => a.id === id)) return ($("#m1").innerHTML = `<div class="alert err">이미 있는 ID 입니다.</div>`);
      if (fd.get("pw") !== fd.get("pw2")) return ($("#m1").innerHTML = `<div class="alert err">비밀번호 확인이 일치하지 않습니다.</div>`);
      busy(btn, true, "추가 중…");
      try { S.vault.accounts.push(await VC.wrapAccount(S.vault, S.masterRaw, id, fd.get("pw"))); await saveVault(`Add admin account ${id} (admin: ${S.user.login})`); toast(`관리자 '${id}' 를 추가했습니다.`); renderAccounts(main); }
      catch (err) { $("#m1").innerHTML = `<div class="alert err">${esc(err.message)}</div>`; busy(btn, false); }
    });
    $("#chPw").addEventListener("submit", async (e) => {
      e.preventDefault(); const fd = new FormData(e.target), btn = e.target.querySelector("button"); $("#m2").innerHTML = "";
      if (fd.get("pw") !== fd.get("pw2")) return ($("#m2").innerHTML = `<div class="alert err">비밀번호 확인이 일치하지 않습니다.</div>`);
      const id = currentId(); if (!id) return ($("#m2").innerHTML = `<div class="alert err">현재 계정을 확인할 수 없습니다. 다시 로그인하세요.</div>`);
      busy(btn, true, "변경 중…");
      try { const i = S.vault.accounts.findIndex((a) => a.id === id); S.vault.accounts[i] = await VC.wrapAccount(S.vault, S.masterRaw, id, fd.get("pw")); await saveVault(`Change admin password ${id} (admin: ${S.user.login})`); toast("비밀번호를 변경했습니다."); renderAccounts(main); }
      catch (err) { $("#m2").innerHTML = `<div class="alert err">${esc(err.message)}</div>`; busy(btn, false); }
    });
    $("#rot").addEventListener("submit", async (e) => {
      e.preventDefault(); const token = new FormData(e.target).get("token").trim(), btn = e.target.querySelector("button"); $("#m3").innerHTML = "";
      busy(btn, true, "확인 중…");
      try { S.user = await verifyToken(token); await VC.setToken(S.vault, S.masterRaw, token); await saveVault(`Rotate admin token (admin: ${S.user.login})`); saveSession(); toast("토큰을 교체했습니다."); renderAccounts(main); }
      catch (err) { $("#m3").innerHTML = `<div class="alert err">${esc(err.message)}</div>`; busy(btn, false); }
    });
  }
  function currentId() { try { return sessionStorage.getItem("knuAdminId") || ""; } catch (e) { return ""; } }

  /* ----- 도움말 ----- */
  function renderHelp(main) {
    main.innerHTML = `
<div class="panel"><h2>도움말</h2>
  <h3>어떻게 동작하나요?</h3>
  <ol class="steps">
    <li>이 관리자 페이지는 서버 없이 GitHub Pages 위에서 동작합니다. 저장 버튼을 누르면 <code>data/*.js</code> 파일이 GitHub 저장소에 커밋됩니다.</li>
    <li>저장에 쓰는 GitHub 토큰은 관리자 비밀번호로 암호화되어 <code>admin/vault.json</code>에 보관됩니다. 등록된 ID·비밀번호를 아는 사람만 풀 수 있습니다.</li>
    <li>저장 후 GitHub Pages가 다시 빌드되는 데 1~2분 걸립니다. 반영이 안 보이면 새로고침(Ctrl+F5) 하세요.</li>
  </ol>
  <h3>보안 안내</h3>
  <ul class="steps">
    <li>비밀번호는 길고 추측하기 어렵게 정하세요 (${MIN_PW}자 이상, 문장형 권장). 금고 파일은 공개 저장소에 있으므로 짧은 비밀번호는 위험합니다.</li>
    <li>GitHub 토큰은 이 저장소의 <b>Contents 권한만</b> 가진 Fine-grained 토큰을 쓰세요. 유출이 의심되면 GitHub에서 토큰을 폐기(Revoke)하고 '관리자 계정 → 토큰 교체'로 새로 등록하세요.</li>
    <li>공용 PC에서는 사용 후 반드시 로그아웃하세요. 로그인 정보는 브라우저 탭을 닫으면 사라집니다.</li>
  </ul>
  <h3>관리자 페이지 여는 법</h3>
  <ul class="steps"><li>주소창에 <code>사이트주소/admin/</code> 입력</li><li>또는 홈페이지 맨 아래 <b>Designed by</b> 글자를 빠르게 5번 클릭</li></ul>
</div>`;
  }

  /* ---------------- 시작 ---------------- */
  (async function start() {
    // 로그인 폼에서 입력한 ID 기억 (비밀번호 변경 시 사용)
    document.addEventListener("submit", (e) => { const id = e.target.elements && e.target.elements.id; if (id && e.target.id === "f") try { sessionStorage.setItem("knuAdminId", id.value.trim()); } catch (x) {} }, true);
    S.vault = await loadVault();
    if (loadSession()) {
      try { S.user = await verifyToken(S.token); return renderApp(); } catch (e) { logout(); }
    }
    renderAuth();
  })();
})();
