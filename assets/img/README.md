# 이미지 넣는 방법

이 폴더에 아래 이름으로 파일을 올리면 사이트에 자동으로 표시됩니다.
파일이 없으면 남색 그라데이션(placeholder)이 대신 보이므로 사이트가 깨지지 않습니다.

| 파일 | 위치 | 권장 크기 |
|---|---|---|
| `knu-signature.png` / `knu-signature-white.png` / `knu-emblem.png` / `favicon.png` | 헤더·푸터·파비콘 (경북대학교 공식 UI, knu.ac.kr 대학상징 페이지 배포본) | 교체 불필요 |
| `hero.jpg` | 메인 페이지 상단 배경 | 1920×1080 |
| `about.jpg` | 메인 About 단체 사진 / About 페이지 | 1600×900 |
| `research/r1.jpg` ~ `research/r5.jpg` | Research 페이지 대표 이미지 | 1600×900 |
| `research/tile1.jpg` ~ `tile4.jpg` | 메인 Research 타일 배경 | 800×800 |
| `members/kim-byunghyun.jpg`, `members/han-kunyeon.jpg` | 교수/명예교수 사진 | 3:4 비율 (600×800) |
| `members/<이름>.jpg` | 학생 사진 (`data/members.js`의 `photo` 경로와 일치) | 정사각형 (600×600) |
| `gallery/<파일명>.jpg` | 갤러리 (`data/gallery.js`의 `image` 경로와 일치) | 1600×1200 |

* 파일명은 영문 소문자와 하이픈(-)만 사용하세요. (예: `2025-09-24-istp.jpg`)
* 용량은 1장당 500KB 이하를 권장합니다. (https://squoosh.app 에서 압축)
