# PLRG @ KAIST homepage

정적 사이트. 빌드 도구·라이브러리 없음. `site.js` 가 `data/*.yml` 을 읽어 렌더링하고, `main` push 시 GitHub Actions 가 검사 → 푸터 날짜 스탬프 → Pages 배포.
콘텐츠 유지보수는 **`data/*.yml` 과 `photos/gallery/`** 만 수정합니다. 각 yml 맨 위에 복사용 예시가 주석으로 있습니다.

```
data/
  publications.yml              논문 2026~ (새 논문은 여기)
  publications-until-2025.yml   논문 ~2025 (형식 동일, 사이트에서 병합)
  members.yml                   카테고리별 멤버 + Alumni
  profile.yml                   교수 페이지 (상단 프로필, Overview, Biography)
  settings.yml                  Home 문구, 최신 논문 개수, 연구 분야, Publications 묶음 연도
photos/
  ryu.png                       교수님 프로필 사진 (profile.yml → photo)
  gallery/                      Photos 탭 — 이미지 파일만
index.html members.html research.html publications.html ryu.html   페이지 틀
site.js        yml 파서 + 정렬 + 렌더링
style.css      디자인
.github/workflows/deploy.yml   검사 → list.json 생성 → 날짜 스탬프 → 배포
```

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
| `research` | | Research 페이지 노출 분야 id (`settings.yml` → `research.areas[].id`). 쉼표로 복수 지정. 비우면 미노출 |
| `short` | | Research 페이지 괄호 안 학회명. 없으면 `venue` |
| `section` | | `Technical Reports` / `Refereed Articles` / `Refereed Chapters in Books` — 연도 목록 대신 하단 섹션 |

- 정렬: `date` 의 연도 → 월 내림차순 (`To appear` 최상단), 동률은 파일 순서. 파일 내 위치 무관.
- Publications: 연도별 섹션 자동 생성, `settings.yml` → `publications.group_before` 이전은 "Before N" 으로 묶음.
- Home Recent Publications: `section` 없는 논문 중 최신 N편 (`research` 무관). N = `settings.yml` → `home.recent_publications`.
- 배포 검사: 필수 필드 누락, `date` 에 연도 없음, 존재하지 않는 `research` id → 실패 (파일:줄 표시).

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
- `website` 있으면 이름 링크 + `[🔗]`. **Alumni 는 `website` 무시** (링크 없음).
- 정렬: 카테고리 내 family name → given name. Alumni 는 `year` desc → PhD, MS 순 → family name.

## profile.yml

```yaml
name: Sukyoung Ryu
photo: ryu.png
position: Professor · [School of Computing](https://cs.kaist.ac.kr), [KAIST](https://www.kaist.ac.kr/en/)
links:
  - [sryu.cs [at] kaist.ac.kr](mailto:sryu.cs@kaist.ac.kr)
overview:
  - heading: Selected Talks
    items:
      - PLRG@KAIST Research Stories: Interviews (Korean) [44Bits](https://...) · [곽곽](https://...)
biography:
  - heading: About
    text: ...
```

- `overview` / `biography` = 탭별 섹션 리스트. 섹션은 `heading` + `text` (문단) 및/또는 `items` (목록). 순서 = 화면 순서.
- 리스트 항목이 `word: ...` 처럼 공백 없는 식별자 + 콜론으로 시작하면 필드로 해석되므로 따옴표로 감쌀 것 (`Programming Languages: ...` 처럼 공백이 있으면 무관).

## settings.yml

| 키 | |
|---|---|
| `home.headline` | 리스트, 항목 하나 = 한 줄 (`<br>`) |
| `home.intro` | Home 소개 문단 (인라인 마크업) |
| `home.recent_publications` | Home 최신 논문 개수 |
| `research.intro` | Research 페이지 소개 문단 |
| `research.areas[]` | `id` / `title` / `keywords` / `description`. 순서 = Home·Research 표시 순서. `id` 는 논문 `research` 에서 참조 |
| `publications.group_before` | 이 연도 미만은 "Before N" 섹션 |

## photos/gallery/

- 디렉터리의 이미지 (`png jpg jpeg gif webp avif`) 전부를 Photos 탭에 표시. 데이터 파일 없음.
- 파일명 = `<번호> <캡션>.<ext>` — 번호 기준 natural sort (`2` < `10`), 캡션은 앞 번호와 확장자를 뗀 나머지.
  예: `5 Graduation, 2027.jpg` → 5번째, "Graduation, 2027".
- 배포 시 `photos/gallery/list.json` 생성. 로컬 프리뷰에서는 서버 디렉터리 리스팅으로 대체.
- 이미지 외 파일은 두지 말 것. 가로 1600px 이하 권장.

## 배포 / 로컬

- `deploy.yml`: yml 파싱 + publications 검사 → `_site/` 복사 → `photos/gallery/list.json` 생성 → 모든 페이지 `Last updated <Mon YYYY>` 를 마지막 커밋 월 (KST) 로 치환 → Pages 배포. 검사 실패 시 배포 안 됨 (기존 사이트 유지).
- 로컬: `python3 -m http.server` (`file://` 은 fetch 불가). 푸터 날짜는 배포 시에만 갱신.
- 논문 파일을 더 나누려면 `site.js` 의 `PUB_FILES` 와 `deploy.yml` 검사 루프의 파일 목록을 함께 수정.
