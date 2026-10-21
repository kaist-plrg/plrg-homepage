# PLRG @ KAIST homepage

정적 사이트. 빌드 도구·라이브러리 없음. `site.js` 가 `data/*.yml` 을 읽어 렌더링하고, `main` push 시 GitHub Actions 가 검사 → 푸터 날짜 스탬프 → Pages 배포.
콘텐츠 수정은 **`data/*.yml`, `photos/main/`, `photos/gallery/`** 만. 각 yml 맨 위에 복사용 예시가 주석으로 있음.

```
data/
  publications.yml              논문 2026~ (새 논문은 여기)
  publications-until-2025.yml   논문 ~2025 (형식 동일, 사이트에서 병합)
  members.yml                   카테고리별 멤버 + Alumni
  profile.yml                   교수 페이지 (상단 프로필, Overview, Biography)
  settings.yml                  Home 문구, 최신 논문 개수, 연구 분야, Publications 묶음
photos/
  main/                         Home 상단 사진 — 1장만
  gallery/                      교수 페이지 Photos 탭
  ryu.png                       교수 프로필 사진 (profile.yml → photo)
favicon.svg favicon.png apple-touch-icon.png   브라우저 탭 아이콘
index.html members.html research.html publications.html ryu.html   페이지 틀
site.js        yml 파서 + 정렬 + 렌더링
style.css      디자인 (:root 변수에 글자 크기·줄간격·간격)
.github/workflows/deploy.yml   검사 → list.json 생성 → 날짜 스탬프 → 배포
```

## 화면 → 파일

| 화면 | 내용 | 위치 |
|---|---|---|
| Home | 상단 사진 | `photos/main/` |
| | 제목 / 소개 문단 | `settings.yml` → `home.headline` / `home.intro` |
| | Research 목록 | `settings.yml` → `research.areas` (클릭 시 Research 페이지 해당 분야로 이동) |
| | Recent Publications | 논문 파일에서 자동. 개수 `settings.yml` → `home.recent_publications` |
| Members | 멤버 · Alumni | `members.yml` |
| Research | 소개 문단 | `settings.yml` → `research.intro` |
| | 분야 제목 · 설명 | `settings.yml` → `research.areas` |
| | 분야별 논문 | 논문의 `research:` |
| Publications | 연도별 목록 | 논문 파일 |
| | 하단 묶음 (Technical Reports 등) | `settings.yml` → `publications.sections` + 논문의 `section:` |
| | "N Papers" | 자동 (두 논문 파일의 블록 수) |
| 교수 페이지 | 이름 · 직함 · 사진 · 링크 | `profile.yml` → `name` `position` `photo` `links` |
| | Overview / Biography 탭 | `profile.yml` → `overview` / `biography` |
| | Photos 탭 | `photos/gallery/` |
| 전체 | 탭 아이콘 | `favicon.svg` 등 |

## 데이터 형식

YAML 서브셋 (`site.js` 내장 파서). 맵 / 리스트 / 스칼라, 스페이스 들여쓰기.
따옴표 선택, `#` 주석 (줄 전체 또는 값 뒤 `" # "`), `yes`/`no` → bool, 정수 → number.
미지원: flow 문법 (`[a, b]`, `{k: v}`), 멀티라인 스칼라 (`|`, `>`), 앵커.

인라인 마크업 (`settings.yml` 의 `intro`, `profile.yml` 전반): `[text](url)` 링크 (한 줄에 여러 개 가능), `**text**` 주황색 강조.

## publications*.yml

```yaml
- title: Paper Title
  authors: First Author, Second Author, and Sukyoung Ryu
  venue: PACMPL OOPSLA 2027
  date: October 2027
  link: https://doi.org/10.1145/...
  award: ACM SIGSOFT Distinguished Paper Award
  research: rust
  short: OOPSLA 2027
```

| 필드 | 필수 | |
|---|---|---|
| `title` `authors` `venue` | ✓ | |
| `date` | ✓ | `Month YYYY`. 미정은 `To appear YYYY` (표시 "To appear", 해당 연도 최상단) |
| `link` | | 비우면 제목 링크 없음 |
| `award` | | venue 뒤에 표시 |
| `research` | | Research 페이지 노출 분야 id. 쉼표로 복수 지정. 비우면 미노출 |
| `short` | | Research 페이지 괄호 안 학회명. 없으면 `venue` |
| `section` | | 연도 목록 대신 하단 묶음. 이름은 `settings.yml` → `publications.sections` 중 하나 |

`research` id (`settings.yml` → `research.areas[].id`)

| id | 분야 |
|---|---|
| `spec` | Mechanized Specifications and Language Testing |
| `rust` | Automatic C-to-Rust Translation |
| `analysis` | Program Analysis and Type Systems |
| `quantum` | Quantum and Probabilistic Programming |

`section` 이름 (`settings.yml` → `publications.sections`, 순서 = 표시 순서)

| 이름 | 용도 |
|---|---|
| `Refereed Chapters in Books` | 심사를 거친 책 챕터 |
| `Refereed Articles` | 학회·저널 논문이 아닌 기고 (매거진, 행사 발표문 등) |
| `Technical Reports` | 기술 보고서 |

- 정렬: `date` 의 연도 → 월 내림차순 (`To appear` 최상단), 동률은 파일 순서. 파일 내 위치 무관.
- Publications: 연도별 섹션 자동 생성. `publications.group_before` 이전은 "Before N" 으로 묶음.
- Home Recent Publications: `section` 없는 논문 중 최신 N편 (`research` 무관).
- "N Papers": `section` 포함 전체 블록 수.
- section 추가·이름 변경·삭제: `publications.sections` 수정. 이름을 바꾸면 그 이름을 쓰는 논문의 `section:` 도 같이 변경.
- 배포 검사: 필수 필드 누락, `date` 에 연도 없음, 없는 `research` id, 없는 `section` 이름 → 실패 (파일:줄 표시).

## members.yml

```yaml
Ph.D. Students:
  - name: Gildong Hong
    website: https://gildong.github.io
    email: gildong [at] kaist.ac.kr

Alumni:
  - name: Jihee Park
    email: jiheepark [at] alumni.kaist.ac.kr
    degree: PhD
    year: 2026
    affiliation: Furiosa AI
```

- 최상위 키 = 카테고리, 키 순서 = 화면 순서. 빈 카테고리는 렌더링 생략. `Alumni` (대소문자 무관) 는 하단 alumni 그리드로.
- 진급/졸업은 블록을 다른 카테고리로 이동. Alumni 는 `degree` / `year` / `affiliation` 추가.
- `website` 있으면 이름 링크 + `[🔗]`. Alumni 는 `website` 무시 (링크 없음).
- 정렬: 카테고리 내 family name → given name. Alumni 는 `year` desc → PhD, MS 순 → family name.

## profile.yml

```yaml
name: Sukyoung Ryu                  # 상단 이름
photo: ryu.png                      # photos/ 안의 파일
position: Professor · [School of Computing](https://cs.kaist.ac.kr), [KAIST](https://www.kaist.ac.kr/en/)
links:                              # 이름 아래 링크, 한 줄 = 링크 하나
  - [sryu.cs [at] kaist.ac.kr](mailto:sryu.cs@kaist.ac.kr)
  - [GitHub](https://github.com/sukyoung)

overview:                           # Overview 탭
  - heading: Research
    text: Programming languages, ...
  - heading: Selected Talks
    items:
      - PLRG@KAIST Research Stories: Interviews (Korean) [44Bits](https://...) · [곽곽](https://...)

biography:                          # Biography 탭
  - heading: About
    text: Sukyoung Ryu is ...
  - heading: Selected Honors
    items:
      - MSIT Leader Research Grant (...), 2026
```

| 화면 | 키 |
|---|---|
| 이름 / 직함 / 사진 / 링크 | `name` / `position` / `photo` / `links` |
| Overview 탭 | `overview` — 현재 Research, Selected Activities, Selected Talks, Selected Teaching, Summer Schools |
| Biography 탭 | `biography` — 현재 About, Selected Honors |
| Photos 탭 | `photos/gallery/` (yml 아님) |

- 탭 = 섹션 리스트. 섹션 = `heading` + `text` (문단) 및/또는 `items` (목록, 한 줄 = 한 항목). 순서 = 화면 순서.
- 항목 추가: 해당 `items` 에 `- …` 한 줄. 섹션 추가·이동·삭제: `- heading:` 블록 단위로. 탭 간 이동도 블록 이동.
- 탭 이름(Overview / Biography / Photos)은 `ryu.html` 에 고정.
- 리스트 항목이 `word: ...` 처럼 공백 없는 식별자 + 콜론으로 시작하면 필드로 해석되므로 따옴표로 감쌀 것 (`Programming Languages: ...` 처럼 공백이 있으면 무관).

## settings.yml

| 키 | |
|---|---|
| `home.headline` | 리스트, 항목 하나 = 한 줄 (모바일에서는 이어서 표시) |
| `home.intro` | Home 소개 문단 (인라인 마크업) |
| `home.recent_publications` | Home 최신 논문 개수 |
| `research.intro` | Research 페이지 소개 문단 |
| `research.areas[]` | `id` / `title` / `keywords` / `description`. 순서 = Home·Research 표시 순서. `id` 는 논문 `research` 와 Home → Research 링크 앵커(`#area-<id>`)에 사용 |
| `publications.group_before` | 이 연도 미만은 "Before N" 섹션 |
| `publications.sections` | 하단 묶음 이름 목록 (논문 `section` 에서 참조) |

## photos/

| 폴더 | 규칙 |
|---|---|
| `photos/main/` | Home 상단에 콘텐츠 폭으로 전체 표시. **이미지 1장만**, 파일명 무관. 2장 이상이면 배포 검사 실패. 비어 있으면 사진 영역 생략 |
| `photos/gallery/` | Photos 탭. 폴더 내 이미지 전부. 파일명 = `<번호> <캡션>.<ext>` — 번호 기준 natural sort (`2` < `10`), 캡션은 번호·확장자를 뗀 나머지. 예: `5 Graduation, 2027.jpg` |
| `photos/ryu.png` | 교수 프로필 사진 (`profile.yml` → `photo`) |

- 이미지: `png jpg jpeg gif webp avif`. HEIC 는 대부분 브라우저에서 미표시 → JPG 변환. 가로 1600–2400px, 1MB 내외, EXIF(GPS) 제거 권장.
- 배포 시 `photos/main/list.json`, `photos/gallery/list.json` 생성. 로컬 프리뷰에서는 서버 디렉터리 리스팅으로 대체.
- 이미지 외 파일은 두지 말 것.

## favicon

| 파일 | |
|---|---|
| `favicon.svg` | 기본 (로고의 전구 마크) |
| `favicon.png` | 32×32, SVG 미지원 브라우저용 |
| `apple-touch-icon.png` | 180×180, iOS 홈 화면 |

같은 이름의 정사각형 이미지로 교체. 연결 태그는 각 HTML `<head>`. 브라우저 캐시 때문에 확인은 강력 새로고침으로.

## 배포 / 로컬

- `deploy.yml`: yml 파싱 + publications·`photos/main` 검사 → `_site/` 복사 → `list.json` 생성 → 모든 페이지 `Last updated <Mon YYYY>` 를 마지막 커밋 월 (KST) 로 치환 → Pages 배포. 검사 실패 시 배포 안 됨 (기존 사이트 유지).
- 로컬: `python3 -m http.server` (`file://` 은 fetch 불가). 푸터 날짜는 배포 시에만 갱신.
- 논문 파일을 더 나누려면 `site.js` 의 `PUB_FILES` 와 `deploy.yml` 검사 루프의 파일 목록을 함께 수정.
- 루트에 파일을 추가해 배포에 포함하려면 `deploy.yml` 의 `cp` 줄에 추가.
