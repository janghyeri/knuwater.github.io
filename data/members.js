/* =====================================================================
   구성원 데이터 — 이 파일만 수정하면 Members 페이지와 메인 페이지에 반영됩니다.
   - 사진: assets/img/members/ 폴더에 올리고 photo 경로를 맞추세요. 없으면 이니셜 아바타가 표시됩니다.
   - level: "phd" (박사) | "ms" (석사) | "ug" (학부연구생)
   - 졸업생은 alumni 배열에 추가하세요.
   ===================================================================== */
window.LAB_DATA = window.LAB_DATA || {};

window.LAB_DATA.members = {

  /* ---------------- 교수 ---------------- */
  professor: {
    nameEn: "Byunghyun Kim",
    nameKo: "김병현",
    role: "Professor",
    dept: "Department of Civil Engineering, Kyungpook National University",
    email: "bhkim@knu.ac.kr",
    office: "공과대학 2호관 111호",
    photo: "assets/img/members/kim-byunghyun.jpg",
    interests: [
      "Urban flood modeling (1D–2D coupled hydrodynamics)",
      "Finite-volume shallow-water models (Godunov / FVM)",
      "AI & machine-learning based flood prediction",
      "Coastal & compound flooding (storm surge, CFD/SPH)",
      "Probabilistic flood hazard assessment",
      "Dam-break flood analysis"
    ],
    education: [
      "Ph.D., Civil Engineering, Kyungpook National University",
      "M.S., Civil Engineering, Kyungpook National University",
      "B.S., Civil Engineering, Kyungpook National University"
    ],
    career: [
      "Professor, Department of Civil Engineering, Kyungpook National University (현재)",
      "Postdoctoral Researcher, Dept. of Civil & Environmental Engineering, University of California, Irvine"  // TODO: 재직 연도 확인 후 추가
    ],
    activities: [
      "행정안전부 중앙재난평가위원회 위원",
      "행정안전부 재난대비훈련 중앙평가위원회 위원",
      "행정안전부 위기관리매뉴얼 협의회 위원"
    ],
    awards: [
      "2022 국가재난안전관리 유공 행정안전부 장관 표창"
    ],
    courses: {
      ug: ["수리학 및 실험 1·2", "수공설계", "선형대수학"],
      grad: ["계산수리학", "도시수공학", "수리수치해석", "개수로 및 유사이동론", "신뢰성해석", "수공학특수문제", "하천공학특론"]
    }
  },

  /* ---------------- 명예교수 ---------------- */
  emeritus: {
    nameEn: "Kunyeon Han",
    nameKo: "한건연",
    role: "Emeritus Professor",
    dept: "Department of Civil Engineering, Kyungpook National University",
    email: "kyhan@knu.ac.kr",
    office: "",
    photo: "assets/img/members/han-kunyeon.jpg",
    interests: [
      "River hydraulics & flood inundation analysis",
      "Dam-break flood modeling",
      "Flood risk assessment & hazard mapping",
      "Hydrologic / hydraulic modeling",
      "National water resources policy"
    ],
    education: [],   // TODO: 학력 입력
    career: [
      "Emeritus Professor, Department of Civil Engineering, Kyungpook National University",
      "Research Professor, Research Institute for Disaster Prevention, Kyungpook National University (경북대학교 방재연구소 연구교수)",
      "President, Korea Federation of Water-Related Academic Societies (한국물학술단체연합회 제16대 회장, 2024–2026)",
      "President, Korea Water Resources Association (한국수자원학회 제24대 회장)",
      "Director, Research Institute for Disaster Prevention, Kyungpook National University (경북대학교 방재연구소 소장)",
      "Director, Next-Generation Flood Defense Technology Research Center (국토해양부 차세대홍수방어기술개발연구단 단장)"
    ],
    activities: [
      "국가물관리위원회 정책분과위원장",
      "국가수자원관리위원회 위원",
      "Hydrological Sciences Section President, Asia Oceania Geosciences Society (AOGS)",
      "Director, International Water Resources Association (IWRA)",
      "Member, World Water Council (WWC)"
    ],
    awards: [],
    courses: null
  },

  /* ---------------- 학생 ---------------- */
  students: [
    {
      nameEn: "Jaehwan Yoo", nameKo: "유재환", level: "phd",
      status: "Ph.D. Candidate",
      email: "woghks629@naver.com",
      photo: "assets/img/members/yoo-jaehwan.jpg",
      interests: ["Coastal overtopping", "Urban flooding", "3D CFD / SPH"]
    },
    {
      nameEn: "Gwiun Jeong", nameKo: "정귀운", level: "ms",
      status: "M.S. Student",
      email: "ryryanan1999@gmail.com",
      photo: "assets/img/members/jeong-gwiun.jpg",
      interests: ["Coastal flood", "Tide / Surge", "Rain-on-Mesh (InfoWorks ICM)"]
    },
    {
      nameEn: "Hyeontak Jo", nameKo: "조현탁", level: "ms",
      status: "M.S. Student",
      email: "hogata0922@icloud.com",
      photo: "assets/img/members/jo-hyeontak.jpg",
      interests: ["Explainable AI (XAI)", "ClimaX / ViT rainfall prediction", "Flood vulnerability mapping"]
    },
    {
      nameEn: "Hoyeon Kim", nameKo: "김호연", level: "ms",
      status: "M.S. Student",
      email: "hoy8977@naver.com",
      photo: "assets/img/members/kim-hoyeon.jpg",
      interests: ["System dynamics", "Flood damage analysis", "Scenario rainfall"]
    },
    {
      nameEn: "Hyeri Jang", nameKo: "장혜리", level: "ms",
      status: "M.S. Student",
      email: "hyeri4540@knu.ac.kr",
      photo: "assets/img/members/jang-hyeri.jpg",
      interests: ["HEC-RAS 2D", "FVM", "Compound flooding"]
    },
    {
      nameEn: "Jiyun Jeon", nameKo: "전지윤", level: "ms",
      status: "M.S. Student",
      email: "wendyjjy215@naver.com",
      photo: "assets/img/members/jeon-jiyun.jpg",
      interests: ["XAI maps", "Machine learning", "Urban flood"]
    }
    // 학부연구생 예시:
    // { nameEn: "Gildong Hong", nameKo: "홍길동", level: "ug", status: "Undergraduate Researcher", email: "", photo: "", interests: ["SWMM"] }
  ],

  /* ---------------- 졸업생 ---------------- */
  alumni: [
    // 예시:
    // { nameEn: "Sedong Jang", nameKo: "장세동", degree: "M.S. 2025", thesis: "기계학습 기반 도시침수 예측", current: "○○연구원", email: "" }
  ]
};
