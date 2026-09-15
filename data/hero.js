/* =====================================================================
   메인 페이지 상단 슬라이드 — 관리자 페이지(admin/)에서도 편집할 수 있습니다.
   - image: assets/img/ 에 올린 배경 사진 경로 (없으면 남색 배경)
   - title: 줄바꿈은 <br> 사용
   - btn1/btn2: 버튼 문구와 링크 (비우면 표시 안 함)
   ===================================================================== */
window.LAB_DATA = window.LAB_DATA || {};

window.LAB_DATA.hero = [
  {
    badge: "KNU Water Resources Lab · 경북대학교 토목공학과 수자원 연구실",
    title: "Computational Hydraulics<br>for Flood-Resilient Cities",
    lead: "도시·연안 홍수의 물리 기반 수치모델링과 AI 예측, 그리고 재난 의사결정 지원까지. 수자원 연구실은 물의 흐름을 계산하여 더 안전한 도시를 설계합니다.",
    image: "assets/img/hero.jpg",
    btn1Label: "View Research", btn1Href: "research.html",
    btn2Label: "Publications", btn2Href: "publication.html"
  },
  {
    badge: "Research",
    title: "도시·연안 복합 홍수를<br>물리 기반으로 재현합니다",
    lead: "1D–2D–3D 수리동역학 해석 · 자체 개발 유한체적모형(FVM) · HEC-RAS · SWMM · InfoWorks ICM · CFD/SPH",
    image: "assets/img/hero2.jpg",
    btn1Label: "연구 분야 보기", btn1Href: "research.html",
    btn2Label: "연구과제", btn2Href: "projects.html"
  },
  {
    badge: "Join us",
    title: "함께 연구할<br>대학원생을 기다립니다",
    lead: "수리학·수문학·수치해석·기계학습에 관심 있는 학생이라면 전공 배경과 관계없이 환영합니다.",
    image: "assets/img/hero3.jpg",
    btn1Label: "모집 안내", btn1Href: "contact.html",
    btn2Label: "구성원 보기", btn2Href: "members.html"
  }
];
