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
assets/img/         경북대 공식 로고(knu-signature.png 등), 사진 (넣는 방법: assets/img/README.md)

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
| 주소/전화/이메일/로고 경로 | `assets/js/site.js` 의 `SITE` |

> 주의: `data/*.js` 는 자바스크립트 문법입니다. 항목 사이의 쉼표(`,`)와 따옴표(`"`)가 빠지면 해당 페이지가 비어 보입니다.
> 저장 전에 한 번 확인하세요. 제목에 따옴표가 들어가면 `\"` 로 씁니다.

## 디자인 기준

경북대학교 홈페이지(knu.ac.kr)의 UI 규정을 따릅니다: KNU Red `#DA2127`, 푸터 `#2E3240`, 포인트 골드 `#C48B3A`,
서체 Roboto + Noto Sans KR. 색상은 `assets/css/site.css` 맨 위 `:root` 변수에서 관리합니다.
로고는 대학 UI 페이지에서 배포하는 파일을 사용했으며, 교육·행정 목적(연구실 홈페이지)에 한해 사용합니다.

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

## 관리자 페이지 (admin/)

주소창에 `사이트주소/admin/` 을 입력하거나, 홈페이지 맨 아래 **Designed by** 이름을 3초 안에 5번 클릭하면 관리자 로그인 화면이 열립니다.
등록된 **관리자 ID + 비밀번호**로만 들어갈 수 있고, 소식·논문·구성원·갤러리·연구과제·메인 슬라이드를 화면에서 편집해 저장하면 GitHub에 자동으로 커밋됩니다 (1~2분 후 반영).

### 처음 한 번만 하는 설정

GitHub Pages에는 서버가 없어서, 저장할 때 쓸 GitHub 토큰을 관리자 비밀번호로 암호화해 `admin/vault.json`에 보관하는 방식입니다.

1. GitHub → Settings → Developer settings → **Personal access tokens → Fine-grained tokens → Generate new token**
   * Repository access: *Only select repositories* → `knuwater.github.io`
   * Permissions → Repository permissions → **Contents: Read and write**
2. 사이트의 `/admin/` 에 접속하면 "관리자 초기 설정" 화면이 나옵니다. 토큰과 첫 관리자 ID·비밀번호(10자 이상)를 입력하면 금고가 만들어집니다.
3. 이후에는 ID·비밀번호만으로 로그인합니다. 관리자 추가/삭제, 비밀번호 변경, 토큰 교체는 관리자 페이지의 **관리자 계정** 메뉴에서 합니다.

### 보안 메모

* 금고 파일은 공개 저장소에 올라가므로 비밀번호는 길게(문장형) 정하세요. PBKDF2 30만 회 + AES-GCM으로 암호화됩니다.
* 토큰은 이 저장소의 Contents 권한만 가진 것을 쓰고, 유출이 의심되면 GitHub에서 폐기(Revoke)한 뒤 관리자 페이지에서 교체하세요.
* 저장소를 직접 수정할 권한(Collaborator)은 여전히 GitHub 계정 기준으로 관리됩니다. 관리자 페이지는 그 위에 얹힌 편집 도구입니다.
