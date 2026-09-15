/* =====================================================================
   KNU Water Resources Lab — 공통 스크립트
   헤더 / 푸터 / 맨 위로 버튼을 모든 페이지에 자동으로 넣습니다.
   연구실 이름, 주소, 이메일, 메뉴는 아래 SITE 객체 한 곳에서만 수정하면 됩니다.
   ===================================================================== */
(function () {
  "use strict";

  const SITE = {
    deptKo: "경북대학교 토목공학과",
    labKo: "수자원 연구실",
    labEn: "KNU Water Resources Lab",
    labEnFull: "Water Resources Laboratory",
    univEn: "Kyungpook National University",
    collegeEn: "College of Engineering · Department of Civil Engineering",
    logo: "assets/img/logo.svg",              // 실제 로고로 바꾸려면 예: "assets/img/knu-logo.png"
    representative: "김병현",
    email: "bhkim@knu.ac.kr",
    address: "대구광역시 북구 대학로 80, 경북대학교 공과대학 2호관 111호",
    addressEn: "Rm 111, Engineering Bldg. 2, 80 Daehak-ro, Buk-gu, Daegu 41566, Republic of Korea",
    designer: "Hyeri Jang",
    nav: [
      { href: "index.html",       label: "Home" },
      { href: "research.html",    label: "Research" },
      { href: "members.html",     label: "Members" },
      { href: "publication.html", label: "Publication" },
      { href: "gallery.html",     label: "Gallery" },
      { href: "about.html",       label: "About" },
      { href: "contact.html",     label: "Contact", cta: true }
    ]
  };
  window.SITE = SITE;

  /* ---------- 공통 헬퍼 ---------- */
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
  window.esc = esc;

  // 이미지가 없을 때 placeholder 배경만 남기기
  window.imgFallback = function (img) {
    img.classList.add("hidden");
    const label = img.getAttribute("data-label");
    if (label && img.parentElement && !img.parentElement.querySelector(".ph-label")) {
      const span = document.createElement("span");
      span.className = "ph-label";
      span.textContent = label;
      img.parentElement.appendChild(span);
    }
  };

  // 이름의 이니셜 (사진 없는 학생 카드용)
  window.initials = function (name) {
    const en = String(name || "").replace(/\(.*?\)/g, "").trim().split(/\s+/);
    return en.slice(0, 2).map((w) => w[0] || "").join("").toUpperCase() || "?";
  };

  function currentPage() {
    const p = location.pathname.split("/").pop();
    return p ? p : "index.html";
  }

  /* ---------- 헤더 ---------- */
  function renderHeader() {
    const el = document.getElementById("site-header");
    if (!el) return;
    const cur = currentPage();
    const links = SITE.nav.map((n) => {
      const active = cur === n.href;
      const cls = [n.cta ? "cta" : "", active ? "active" : ""].filter(Boolean).join(" ");
      return `<a href="${n.href}"${cls ? ` class="${cls}"` : ""}${active ? ' aria-current="page"' : ""}>${esc(n.label)}</a>`;
    }).join("");

    el.outerHTML = `
<header class="site-header">
  <div class="container nav">
    <a class="brand" href="index.html" aria-label="${esc(SITE.labEn)}">
      <img class="brand-logo" src="${SITE.logo}" alt="${esc(SITE.labEn)} logo">
      <span class="brand-stack">
        <span class="dept">${esc(SITE.deptKo)}</span>
        <span class="lab">${esc(SITE.labKo)}</span>
      </span>
    </a>
    <nav aria-label="Primary">
      <button class="menu-toggle" type="button" aria-label="메뉴 열기" aria-expanded="false" aria-controls="menu">☰</button>
      <div id="menu" class="menu">${links}</div>
    </nav>
  </div>
</header>`;

    const btn = document.querySelector(".menu-toggle");
    const menu = document.getElementById("menu");
    btn.addEventListener("click", () => {
      const open = menu.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".site-header")) {
        menu.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- 푸터 ---------- */
  function renderFooter() {
    const el = document.getElementById("site-footer");
    if (!el) return;
    const links = SITE.nav.map((n) => `<li><a href="${n.href}">${esc(n.label)}</a></li>`).join("");
    const navBottom = SITE.nav.map((n) => `<a href="${n.href}">${esc(n.label)}</a>`).join("");
    const year = new Date().getFullYear();

    el.outerHTML = `
<footer class="site-footer" role="contentinfo">
  <div class="container">
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="mark"><img src="${SITE.logo}" alt="${esc(SITE.labEn)} mark"></div>
        <div class="txt">
          <b>${esc(SITE.univEn)}</b>
          ${esc(SITE.collegeEn)}<br>
          <b>${esc(SITE.labEnFull)}</b>
        </div>
      </div>
      <div class="footer-col">
        <h4>Quick Links</h4>
        <ul class="footer-links">${links}</ul>
      </div>
      <div class="footer-col">
        <h4>Contact</h4>
        <div class="footer-meta">
          <div><b>대표자명</b> : ${esc(SITE.representative)}</div>
          <div>${esc(SITE.address)}</div>
          <div>Email : <a href="mailto:${SITE.email}">${SITE.email}</a></div>
        </div>
      </div>
    </div>
    <div class="f-bottom">
      <div class="footer-nav">${navBottom}</div>
      <div>© ${year} ${esc(SITE.labEn)}. All rights reserved. · Designed by <b>${esc(SITE.designer)}</b></div>
    </div>
  </div>
</footer>
<button class="to-top" id="toTop" type="button" aria-label="맨 위로">↑</button>`;
  }

  /* ---------- 맨 위로 버튼 ---------- */
  function backToTop() {
    const btn = document.getElementById("toTop");
    if (!btn) return;
    const toggle = () => btn.classList.toggle("show", (window.scrollY || document.documentElement.scrollTop) > 300);
    window.addEventListener("scroll", toggle, { passive: true });
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    toggle();
  }

  /* ---------- 페이지 공통 데이터 헬퍼 ---------- */
  window.LAB = {
    // 논문 4개 카테고리 전체를 최신순 하나의 배열로
    allPublications() {
      const P = (window.LAB_DATA && window.LAB_DATA.publications) || {};
      const out = [];
      Object.keys(P).forEach((k) => (P[k] || []).forEach((it) => out.push(Object.assign({ type: k }, it))));
      return out.sort((a, b) => (b.year || 0) - (a.year || 0));
    },
    // 링크가 없으면 Google Scholar 검색으로 대체
    pubLink(item) {
      if (item.link && item.link !== "#") return { href: item.link, label: "Link" };
      return { href: "https://scholar.google.com/scholar?q=" + encodeURIComponent(item.title || ""), label: "Search" };
    },
    fmtDate(s) {
      if (!s) return "";
      const d = new Date(s);
      if (isNaN(d)) return s;
      return d.toISOString().slice(0, 10);
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    renderHeader();
    renderFooter();
    backToTop();
  });
})();
