# PLRG @ KAIST homepage

`data/` 의 yml 파일과 `photos/` 폴더만 고치면 사이트 내용이 바뀝니다. HTML·CSS·JS 는 건드릴 필요가 없습니다.
`main` 에 커밋하면 GitHub Actions 가 검사 → 배포하고, 푸터의 "Last updated" 도 자동으로 갱신됩니다.

---

## 1. 한눈에 보기 — 화면의 어떤 내용이 어디에 있나

| 화면 | 바꾸고 싶은 내용 | 파일 | 위치 |
|---|---|---|---|
| **Home** | 맨 위 큰 사진 | `photos/main/` | 폴더 안 사진 1장 |
| | 큰 제목 / 소개 문단 | `data/settings.yml` | `home.headline` / `home.intro` |
| | Research 목록 | `data/settings.yml` | `research.areas` (Research 페이지와 공유). 클릭하면 Research 페이지의 해당 분야가 화면 중앙으로 |
| | Recent Publications | `data/publications.yml` | 자동 — 최신 N편. N 은 `settings.yml` → `home.recent_publications` |
| **Members** | 현재 멤버 · Alumni | `data/members.yml` | 카테고리별 목록 |
| **Research** | 맨 위 소개 문단 | `data/settings.yml` | `research.intro` |
| | 분야 제목 · 설명 | `data/settings.yml` | `research.areas` |
| | 분야 아래 논문 목록 | `data/publications.yml` | 논문의 `research:` 칸 |
| **Publications** | 논문 전체 (연도별 목록) | `data/publications.yml` (2026~) · `data/publications-until-2025.yml` | 논문 블록 |
| | 맨 아래 별도 묶음 (Technical Reports 등) | `data/settings.yml` + 논문 | 묶음 목록: `publications.sections` / 논문 쪽: `section:` 칸 |
| | 상단 "N Papers" | — | 자동 (두 논문 파일의 블록 수) |
| | "Before 2020" 묶음 기준 연도 | `data/settings.yml` | `publications.group_before` |
| **모든 페이지** | 브라우저 탭 아이콘 | `favicon.svg` · `favicon.png` · `apple-touch-icon.png` | 같은 이름으로 파일 교체 ([8](#8-브라우저-탭-아이콘-favicon)) |
| **교수님 페이지** | 이름 · 직함 · 사진 · 연락처 링크 | `data/profile.yml` | `name` `position` `photo` `links` |
| | Overview 탭 | `data/profile.yml` | `overview:` |
| | Biography 탭 | `data/profile.yml` | `biography:` |
| | Photos 탭 | `photos/gallery/` | 폴더 안 사진들 |

---

## 2. 공통 작성법

```yaml
- title: Paper Title          # "- " = 항목 하나의 시작
  venue: PLDI 2027            # 같은 항목의 다른 칸은 들여쓰기를 맞춤
  link:                       # 값이 없으면 비워둠
```

- `이름: 값` 형식. 따옴표·쉼표 필요 없음. `#` 뒤는 메모.
- 글 안에 **링크**: `[보이는 글자](https://주소)` — 한 줄에 여러 개 가능.
- 글 안에 **주황색 강조**: `**글자**`
- **순서**: 논문·멤버·Alumni 는 사이트가 자동 정렬. 나머지(연구 분야, 교수님 페이지 섹션·목록, 멤버 카테고리)는 **파일에 적힌 순서 = 화면 순서**.
- 형식이 틀리면 배포가 멈추고 Actions 로그에 `파일 line N: 무엇이 틀렸는지` 가 표시됩니다. 기존 사이트는 그대로 유지됩니다.

---

## 3. 교수님 페이지 — `data/profile.yml`

### 화면과 파일의 대응

```
 ← Members
 (photo)  Sukyoung Ryu                                       ← name   (사진은 photo)
          Professor · School of Computing, KAIST             ← position
          sryu.cs [at] kaist.ac.kr   GitHub   YouTube        ← links

 Overview | Biography | Photos                              ← 탭 3개 (고정)
 ────────────────────────────────────────────

 ▸ Overview 탭 = overview: 아래의 섹션들
     Research                     ← 섹션 (heading + text)
     Programming languages, software engineering, ...
     Selected Activities          ← 섹션 (heading + items)
       ACM Conferences
       ACM SIGPLAN CARES
     Selected Talks · Selected Teaching · Summer Schools  (모두 heading + items)

 ▸ Biography 탭 = biography: 아래의 섹션들
     About                        ← 섹션 (heading + text)
     Selected Honors              ← 섹션 (heading + items)

 ▸ Photos 탭 = photos/gallery/ 폴더 (yml 아님)
```

### 파일 구조

```yaml
# ── 상단 프로필 ──────────────────────
name: Sukyoung Ryu
photo: ryu.png                       # photos/ 폴더 안의 파일 이름
position: Professor · [School of Computing](https://cs.kaist.ac.kr), [KAIST](https://www.kaist.ac.kr/en/)
links:                               # 이름 아래 주황색 링크. 한 줄 = 링크 하나
  - [sryu.cs [at] kaist.ac.kr](mailto:sryu.cs@kaist.ac.kr)
  - [GitHub](https://github.com/sukyoung)
  - [YouTube](https://www.youtube.com/@SukyoungRyu)

# ── Overview 탭 ──────────────────────
overview:
  - heading: Research                # 섹션 제목
    text: Programming languages, ... # 문단 하나

  - heading: Selected Talks          # 섹션 제목
    items:                           # 목록. 한 줄 = 화면의 한 줄
      - How to Design, Document, and Implement Programming Languages [APLAS Keynote 2024](https://...)
      - PLRG@KAIST Research Stories: Interviews (Korean) [44Bits](https://...) · [곽곽](https://...)

# ── Biography 탭 ─────────────────────
biography:
  - heading: About
    text: Sukyoung Ryu is a Professor ...
  - heading: Selected Honors
    items:
      - MSIT Leader Research Grant (...), 2026
```

**섹션** 은 탭 안의 제목 하나와 그 아래 내용 묶음입니다. 내용은 둘 중 하나입니다.

| 섹션 내용 | 쓰는 칸 | 화면 | 예 |
|---|---|---|---|
| 문단 | `text:` | 한 덩어리 글 | Research, About |
| 목록 | `items:` + `- ...` 줄들 | 줄마다 한 항목 | Activities, Talks, Teaching, Summer Schools, Honors |

### 자주 하는 수정

| 하고 싶은 것 | 방법 |
|---|---|
| 수상 추가 | `biography` → `Selected Honors` 의 `items:` 맨 위에 `- 상 이름, 2027` |
| 강연 추가 | `overview` → `Selected Talks` 의 `items:` 에 `- 강연 제목 [행사명](영상 링크)` |
| 한 줄에 링크 여러 개 | `- 제목 [링크1](주소1) · [링크2](주소2)` — 구분자(` · `)는 자유 |
| 소개 글 수정 | `biography` → `About` 의 `text:` |
| 새 섹션 (예: Awards) | `- heading: …` 블록을 복사해서 `overview:` 또는 `biography:` 안 원하는 위치에 붙이기 |
| 섹션 순서 변경 | 블록(`- heading:` 부터 다음 `- heading:` 전까지)을 통째로 위/아래로 이동 |
| 섹션 삭제 | 블록 통째로 삭제 |
| 다른 탭으로 옮기기 | 블록을 `overview:` ↔ `biography:` 사이로 이동 |
| 연락처 링크 추가 | `links:` 에 `- [표시 이름](https://...)` |
| 프로필 사진 교체 | `photos/` 에 새 사진 업로드 후 `photo:` 에 파일 이름 |

> 목록 한 줄이 `Word: ...` 처럼 **공백 없는 단어 + 콜론** 으로 시작하면 칸 이름으로 읽힙니다. 그럴 땐 줄 전체를 `"…"` 로 감싸세요. `Programming Languages: …` 처럼 공백이 있으면 괜찮습니다.

---

## 4. 논문 — `data/publications.yml`

새 논문은 **`publications.yml`(2026년~)** 에, 과거 논문 수정은 **`publications-until-2025.yml`** 에서 합니다. 두 파일은 형식이 같고 사이트가 합쳐서 보여줍니다.

```yaml
- title: Paper Title
  authors: First Author, Second Author, and Sukyoung Ryu
  venue: PACMPL OOPSLA 2027
  date: October 2027
  link: https://doi.org/10.1145/...
  award:
  research: rust
  short: OOPSLA 2027
```

| 칸 | 필수 | 화면에서 | 설명 |
|---|---|---|---|
| `title` `authors` `venue` | ✓ | 제목 / 저자 / 학회 | |
| `date` | ✓ | 날짜 + 정렬 기준 | `October 2027`. 미정이면 `To appear 2027` (그 해 맨 위) |
| `link` | | 제목 링크 | 비우면 링크 없음 |
| `award` | | venue 뒤 | 수상 이름 |
| `research` | | Research 페이지 | 띄울 분야 id. 비우면 Research 에 안 나옴. 여러 개: `rust, analysis` |
| `short` | | Research 페이지 괄호 | 짧은 학회명. 없으면 `venue` |
| `section` | | Publications 맨 아래 | 연도별 목록 대신 별도 묶음으로 (아래 표). 비우면 연도별 목록 |

**`research` 에 쓸 수 있는 분야 id** (`settings.yml` → `research.areas` 의 `id`)

| id | 분야 |
|---|---|
| `spec` | Mechanized Specifications and Language Testing |
| `rust` | Automatic C-to-Rust Translation |
| `analysis` | Program Analysis and Type Systems |
| `quantum` | Quantum and Probabilistic Programming |

**`section` 에 쓸 수 있는 이름** (`settings.yml` → `publications.sections`, 순서 = 화면 순서)

| 이름 | 용도 |
|---|---|
| `Refereed Chapters in Books` | 심사를 거친 책의 챕터 |
| `Refereed Articles` | 학회·저널 논문이 아닌 기고 (매거진, 행사 발표문 등) |
| `Technical Reports` | 기술 보고서 |

- `section` 이 붙은 논문은 Home 의 Recent Publications 에서 제외되고, 상단 "N Papers" 에는 포함됩니다.
- 묶음 관리는 `settings.yml` → `publications.sections` 에서 합니다. 목록에 없는 이름을 쓴 논문은 배포 검사에서 걸러집니다.

| 하고 싶은 것 | 방법 |
|---|---|
| 논문을 묶음에 넣기 | 논문 블록에 `section: Technical Reports` (목록의 이름 그대로) |
| 묶음에서 빼기 (연도별 목록으로) | 그 논문의 `section:` 줄 삭제 |
| 새 묶음 만들기 | `sections:` 에 `- Invited Talks` 한 줄 추가 → 논문에 `section: Invited Talks` |
| 묶음 순서 바꾸기 | `sections:` 의 줄 순서 변경 |
| 묶음 이름 바꾸기 | `sections:` 의 이름과, 그 이름을 쓰는 논문들의 `section:` 을 함께 변경 |
| 묶음 없애기 | 그 이름을 쓰는 논문의 `section:` 을 지우거나 바꾼 뒤 `sections:` 에서 삭제 |

**자동 처리**
- 파일 안 위치와 상관없이 `date` 기준 최신순으로 정렬됩니다.
- 2027, 2028년 논문이 생기면 Publications 에 그 연도 섹션이 자동으로 생깁니다.
- Home 의 Recent Publications 는 `research` 와 상관없이 가장 최신 논문을 보여줍니다.
- 없는 `research` id 나 빈 필수 칸은 배포 전에 걸러집니다.

---

## 5. 멤버 · Alumni — `data/members.yml`

```yaml
Ph.D. Students:                  # 카테고리 (화면 순서 = 파일 순서)
  - name: Gildong Hong
    website: https://gildong.github.io
    email: gildong [at] kaist.ac.kr

Alumni:                          # 이 이름의 카테고리는 아래 Alumni 그리드로 표시
  - name: Jihee Park
    email: jiheepark [at] alumni.kaist.ac.kr
    degree: PhD
    year: 2026
    affiliation: Furiosa AI      # 현재 소속
```

| 하고 싶은 것 | 방법 |
|---|---|
| 새 멤버 | 해당 카테고리에 `name` / `website` / `email` 블록 추가 |
| 진급 (B.S. → M.S. → Ph.D.) | 블록을 잘라 다른 카테고리에 붙이기 |
| 졸업 | 블록을 `Alumni:` 로 옮기고 `degree` / `year` / `affiliation` 추가 |
| 카테고리 추가 · 순서 변경 | `카테고리 이름:` 줄과 그 아래 블록들을 추가 / 이동 |

- `website` 가 있으면 이름이 링크가 되고 [🔗] 가 붙습니다. **Alumni 는 `website` 가 있어도 링크가 붙지 않습니다.**
- 정렬은 자동입니다. 카테고리 안은 성(family name) 순, Alumni 는 졸업연도 최신순 → PhD 먼저 → 성 순입니다.
- 사람이 없는 카테고리는 화면에서 숨겨집니다.

---

## 6. 사이트 설정 — `data/settings.yml`

```yaml
home:
  headline:                      # Home 큰 제목. 한 줄 = 화면의 한 줄
    - Designing, specifying, and analyzing
    - real-world programming languages.
  intro: PLRG is the **Programming Language Research Group** at ...   # 소개 문단
  recent_publications: 5         # Home 최신 논문 개수

research:
  intro: We develop ...          # Research 페이지 소개 문단
  areas:                         # 연구 분야 (Home 목록 + Research 페이지)
    - id: spec                   # 논문 research: 칸에서 쓰는 이름
      title: Mechanized Specifications and Language Testing
      keywords: JavaScript, WebAssembly, P4     # Home 에서 제목 옆 회색 글자
      description: We mechanize ...             # Research 페이지 설명

publications:
  group_before: 2020             # 이 연도 이전은 "Before 2020" 한 섹션으로
  sections:                      # Publications 맨 아래 별도 묶음 (논문 section: 칸에서 사용)
    - Refereed Chapters in Books
    - Refereed Articles
    - Technical Reports
```

- 연구 분야 추가: `areas` 의 블록 하나를 복사하고 `id` 를 새로 정합니다. 그 id 를 논문의 `research:` 에 쓰면 됩니다.

---

## 7. 사진

| 폴더 | 화면 | 규칙 |
|---|---|---|
| `photos/main/` | Home 맨 위 큰 사진 | **사진 1장만.** 교체 = 기존 삭제 후 새로 업로드. 파일 이름 무관. 2장 이상이면 배포 실패 |
| `photos/gallery/` | 교수님 페이지 Photos 탭 | 파일 이름 = `번호 캡션.jpg` → 번호 순 정렬, 캡션 자동. 예: `5 Graduation, 2027.jpg` |
| `photos/ryu.png` | 교수님 프로필 사진 | `profile.yml` 의 `photo:` 가 가리키는 파일 |

- 사진은 JPG, 가로 1600~2400px, 1MB 내외를 권장합니다.
- HEIC 는 대부분의 브라우저에서 보이지 않으므로 JPG 로 변환해서 올리세요.

---

## 8. 브라우저 탭 아이콘 (favicon)

로고의 전구(λ) 마크를 쓰고 있습니다. 파일을 같은 이름으로 교체하면 바뀝니다.

| 파일 | 용도 |
|---|---|
| `favicon.svg` | 기본 탭 아이콘 (대부분의 브라우저) |
| `favicon.png` | 32×32 — SVG 를 지원하지 않는 브라우저용 |
| `apple-touch-icon.png` | 180×180, 흰 배경 — iPhone/iPad 홈 화면에 추가할 때 |

- 정사각형 이미지를 쓰세요. 브라우저가 캐시하므로 교체 후에는 강력 새로고침(Cmd/Ctrl+Shift+R)으로 확인합니다.
- 연결 태그는 각 HTML `<head>` 에 있습니다 (`<link rel="icon" …>`).

## 9. 코드 구조 (수정할 일이 거의 없는 부분)

```
index.html members.html research.html publications.html ryu.html   페이지 틀 (내용은 비어 있고 site.js 가 채움)
site.js        data/*.yml 읽기(내장 YAML 파서) · 정렬 · 렌더링
style.css      디자인. 맨 위 :root 변수에 글자 크기·줄간격·간격이 모여 있음
.github/workflows/deploy.yml   yml 검사 → photos 목록(list.json) 생성 → 푸터 날짜 → Pages 배포
```

- **로컬 미리보기**: 저장소 폴더에서 `python3 -m http.server` → `http://localhost:8000`. `file://` 로 열면 데이터를 못 읽습니다.
- **yml 문법 범위**: 내장 파서가 지원하는 것은 맵 / 리스트 / 스칼라, `#` 주석, `yes`/`no` 입니다. flow 문법(`[a, b]`, `{k: v}`)과 멀티라인(`|`, `>`)은 지원하지 않습니다.
- **논문 파일을 더 나눌 때**: `site.js` 의 `PUB_FILES` 와 `deploy.yml` 검사 루프의 파일 목록을 함께 수정해야 합니다.
