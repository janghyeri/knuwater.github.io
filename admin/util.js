/* =====================================================================
   admin/util.js — 구성원 관련 순수 함수 (브라우저 / Node 공용)
   - toAlumni(student, extra): 학생 항목을 졸업생 항목으로 변환
   - sortAlumni(list): 졸업연월(graduated, YYYY-MM) 내림차순 → 최근 졸업생이 먼저
   ===================================================================== */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.AdminUtil = factory();
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // 학생 과정 코드 → 표시 이름
  const LEVELS = [
    ["phd", "박사과정",   "Ph.D. Student"],
    ["ms",  "석사과정",   "M.S. Student"],
    ["ug",  "학부연구생 (학석연계 포함)", "Undergraduate Researcher"]
  ];
  // 졸업 처리 시 기본 학위
  const DEGREE_BY_LEVEL = { phd: "Ph.D.", msphd: "Ph.D.", ms: "M.S.", bsms: "M.S.", ug: "B.S." };

  function toAlumni(student, extra) {
    extra = extra || {};
    return {
      nameEn: student.nameEn || "",
      nameKo: student.nameKo || "",
      degree: extra.degree || DEGREE_BY_LEVEL[student.level] || "",
      graduated: extra.graduated || "",
      thesis: extra.thesis || "",
      current: extra.current || "",
      email: student.email || "",
      photo: student.photo || ""
    };
  }
  function sortAlumni(list) {
    return (list || []).slice().sort((a, b) =>
      String(b.graduated || "").localeCompare(String(a.graduated || "")) ||
      String(a.nameEn || "").localeCompare(String(b.nameEn || "")));
  }
  function thisMonth() {
    const d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
  }
  return { LEVELS, DEGREE_BY_LEVEL, toAlumni, sortAlumni, thisMonth };
});
