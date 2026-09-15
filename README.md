# KNU Water Resources Lab — 홈페이지

경북대학교 토목공학과 수자원 연구실 홈페이지 (GitHub Pages, 정적 HTML).

## 폴더 구조

```
index.html          메인
about.html          연구실 소개 · 연혁
research.html       연구 분야
members.html        구성원 (교수 / 명예교수 / 학생 / 졸업생)
publication.html    논문 · 학술발표 (검색, 연도별 정렬)
gallery.html        갤러리 (카테고리 필터, 라이트박스)
contact.html        연락처 · 지도 · 모집 안내
404.html            없는 주소 안내

assets/css/site.css 공통 스타일 (색상은 :root 변수)
assets/js/site.js   공통 헤더/푸터/맨위로 버튼 + 연구실 기본정보(SITE)
assets/img/         로고, 사진 (넣는 방법: assets/img/README.md)

data/members.js       구성원 데이터
data/publications.js  논문 데이터
data/gallery.js       갤러리 데이터
data/news.js          소식 데이터
```

헤더·푸터는 `assets/js/site.js`가 모든 페이지에 자동으로 넣습니다.
연구실 이름, 주소, 이메일, 메뉴 순서는 그 파일의 `SITE` 객체 한 곳에서만 바꾸면 됩니다.

## 내용 수정하는 법 (GitHub 웹에서)

1. 수정할 파일을 연다 → 연필(✏) 아이콘 → 내용 편집 → **Commit changes**.
2. 1~2분 뒤 사이트에 반영됩니다.

| 하고 싶은 일 | 수정할 파일 |
|---|---|
| 논문 추가 | `data/publications.js` — 해당 카테고리 배열에 `{year:2025, title:"…", authors:"…", venue:"…", link:"https://doi.org/…"}` 한 줄 추가 |
| 학생 추가/졸업 처리 | `data/members.js` — `students` 배열에 추가, 졸업 시 `alumni` 배열로 이동 |
| 교수님 이력 수정 | `data/members.js` — `professor` / `emeritus` 의 `education`, `career`, `activities`, `awards` |
| 사진 추가 | `assets/img/gallery/`에 업로드 후 `data/gallery.js`에 한 줄 추가 |
| 소식 추가 | `data/news.js` |
| 연구 분야 글 수정 | `research.html` 의 각 `<article class="block">` |
| 연혁 수정 | `about.html` 의 `<ul class="timeline">` |
| 주소/이메일/로고 | `assets/js/site.js` 의 `SITE` |

> 주의: `data/*.js` 는 자바스크립트 문법입니다. 항목 사이의 쉼표(`,`)와 따옴표(`"`)가 빠지면 해당 페이지가 비어 보입니다.
> 저장 전에 한 번 확인하세요. 제목에 따옴표가 들어가면 `\"` 로 씁니다.

## 사진 넣기

`assets/img/README.md` 에 파일 이름과 권장 크기가 정리되어 있습니다.
사진이 없어도 자리에 남색 배경이 표시되므로 사이트가 깨지지 않습니다.

## GitHub Pages 켜기 (최초 1회)

1. 저장소 → **Settings** → **Pages**
2. Source: **Deploy from a branch**, Branch: **main** / **(root)** → Save
3. 몇 분 뒤 상단에 주소가 표시됩니다.

### 주소 안내

* 이 저장소(`janghyeri/knuwater.github.io`)는 `janghyeri` 계정의 프로젝트 사이트이므로 주소는
  **https://janghyeri.github.io/knuwater.github.io/** 가 됩니다.
* **https://knuwater.github.io** 주소를 쓰려면 `knuwater` 라는 GitHub 계정(또는 Organization)을 만들고
  그 계정에 `knuwater.github.io` 저장소를 만들어 이 파일들을 올려야 합니다. (Settings → General → Transfer 로 옮길 수 있습니다.)
* 모든 링크는 상대 경로라서 어느 주소에서도 그대로 동작합니다.
* 주소가 정해지면 `sitemap.xml` 과 `robots.txt` 의 주소를 맞춰 주세요.

## 로컬에서 미리보기

파일을 더블클릭해서 열어도 동작합니다. 서버로 보려면:

```bash
python -m http.server 8000
```

후 http://localhost:8000 접속.

## admin/ (Decap CMS) 에 대하여

`admin/` 폴더는 Decap CMS 설정입니다. GitHub Pages 만으로는 로그인(OAuth) 서버가 없어 동작하지 않으며,
Netlify 또는 별도의 OAuth 프록시가 필요합니다. 현재 페이지들은 `data/*.js` 를 직접 읽으므로
CMS 없이도 GitHub 웹 편집만으로 운영할 수 있습니다. 필요 없으면 `admin/` 폴더는 삭제해도 됩니다.
