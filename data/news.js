/* =====================================================================
   소식(News) 데이터 — 메인 페이지 News 영역에 최신순으로 표시됩니다.
   - date: "YYYY-MM-DD"
   - tag: "Paper" | "Conference" | "Award" | "Notice" | "Welcome"
   - link: 관련 링크 (없으면 "" )
   - body: 상세 내용 (선택, News 페이지에서 펼쳐서 보여줌)
   ===================================================================== */
window.LAB_DATA = window.LAB_DATA || {};

window.LAB_DATA.news = [
  {
    date: "2026-05-22",
    tag: "Conference",
    title: "한국수자원학회 2026 학술발표회(부산) 5편 발표",
    desc: "해안 도시 월파량 산정(경험식·3차원 수치해석 비교), 격자기반 분포형 강우 2차원 도시침수해석, KlimaX 기반 강우 예측 모델, 1-2차원 완전 결합 복합 도시침수 모형, EFDC 3차원 수질예측 대리모델",
    body: "2026년 5월 20일~22일 부산항국제전시컨벤션센터에서 열린 한국수자원학회 학술발표회에서 연구실 구성원이 구두발표 5편을 발표했습니다.\n· O2-1 극한 해상 조건에서의 해안 도시 월파량 산정을 위한 경험식 및 3차원 수치해석 비교 연구 (유재환·전지윤·김병현)\n· S4-3 격자기반 분포형 강우를 활용한 2차원 도시침수해석 (전지윤·정귀운·김병현)\n· S6-2 고해상도 격자 강우자료를 활용한 KlimaX 기반 강우 예측 모델 개발 (장혜리·조현탁·김병현)\n· S9-3 복합 도시침수 해석을 위한 1-2차원 완전 결합 수치모형 개발 (김호연·유재환·김병현)\n· O16-6 EFDC 기반 3차원 수질예측 대리모델 구축 연구 (휴먼플래닛·한국수자원공사 공동)",
    link: "publication.html#domConf"
  },
  {
    date: "2025-10-31",
    tag: "Conference",
    title: "한국원자력학회 2025 추계학술발표회(창원) 발표",
    desc: "3D Flood Analysis of Coastal Nuclear Power Plant Sites under Extreme Wave Overtopping Scenarios (유재환·정귀운·김병현)",
    link: "https://www.kns.org/files/pre_paper/54/25A-322-%EC%9C%A0%EC%9E%AC%ED%99%98.pdf"
  },
  {
    date: "2025-08-29",
    tag: "Paper",
    title: "Scientific Reports 논문 게재",
    desc: "Rapid simulation for real-time flood depth prediction using support vector machine (Kim, B.J.; Kim, M.; Yoo, J.; Kim, B.H.) — 1D–2D 침수 시뮬레이션과 SVM을 결합해 수 초 내 침수심 예측",
    link: "https://doi.org/10.1038/s41598-025-17090-2"
  },
  {
    date: "2025-09-24",
    tag: "Conference",
    title: "2025 ISTP에서 연구 성과 발표",
    desc: "연구실 구성원이 2025 ISTP에 참가하여 도시·연안 홍수 해석 연구를 발표했습니다.",
    link: ""
  },
  {
    date: "2025-09-12",
    tag: "Conference",
    title: "2025 ACFM 참가",
    desc: "Asian Congress on Fluid Mechanics 2025에 참가했습니다.",
    link: ""
  },
  {
    date: "2025-06-01",
    tag: "Paper",
    title: "Progress in Disaster Science 논문 게재",
    desc: "Flood prediction in urban areas based on machine learning considering the statistical characteristics of rainfall (Jang, Yoo, Lee, Kim)",
    link: "https://doi.org/10.1016/j.pdisas.2025.100415"
  },
  {
    date: "2025-05-22",
    tag: "Conference",
    title: "한국수자원학회 2025 학술발표회 4편 발표",
    desc: "HEC-RAS 2D·FVM 복합 홍수 모델링, XAI 홍수 취약성 매핑, Rain-on-Mesh 도시침수해석, System Dynamics 피해 영향 분석",
    link: "publication.html"
  },
  {
    date: "2023-02-02",
    tag: "Press",
    title: "[언론 보도] 김병현 교수, 행정안전부 장관 표창 수상",
    desc: "2022년도 국가재난안전관리 유공으로 행정안전부 장관 표창을 받았습니다. 중앙재난평가위원회·재난대비훈련 중앙평가위원회·위기관리매뉴얼 협의회 위원으로 활동. (한국강사신문)",
    link: "https://www.lecturernews.com/news/articleView.html?idxno=118150"
  },
  {
    date: "2025-02-20",
    tag: "Conference",
    title: "한국방재학회 2025 학술대회 6편 발표",
    desc: "KlimaX 강우 예측 모형, LSTM 실시간 홍수위 예측, 3차원 연안 침수 해석, 원전 부지 홍수량 비교, XAI 위험등급 예측, 태풍 힌남노 침수 해석",
    link: "publication.html"
  }
];
