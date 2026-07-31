# 전시·작품 콘텐츠 등록·수정 (Update Exhibition)

전시 또는 작품 정보를 홈페이지 콘텐츠(`content/`)에 등록하거나 수정합니다.

## 입력
- 등록/수정할 내용: $ARGUMENTS
- 형식 예시: `/update-exhibition 전시 등록: "가을빛" 2026-09-01~2026-09-30 작가 홍길동`
- 형식 예시: `/update-exhibition 작품 수정: id=AW003 status=판매완료`

## 절차

### 1단계: 대상 식별
- $ARGUMENTS에서 대상이 "전시"인지 "작품"인지, 신규 등록인지 기존 수정인지 판단합니다
- 구분이나 필요한 필드가 불명확하면 추측하지 말고 사용자에게 되묻습니다

### 2단계: 기존 데이터 확인
- `content/exhibitions.json` 또는 `content/artworks.json`을 읽어 현재 상태를 파악합니다
- 파일이 없으면 빈 배열 `[]`로 새로 생성합니다
- 수정 요청인 경우 대상 id가 실제로 존재하는지 확인하고, 없으면 오류로 안내한 뒤 중단합니다

### 3단계: 데이터 검증
등록·수정 전에 아래 필수 필드와 규칙을 확인합니다:
- **전시(exhibitions.json)**: `id`, `title`, `start_date`, `end_date`, `artists`(배열), `description`, `status`(예정/진행중/종료)
- **작품(artworks.json)**: `id`, `title`, `artist`, `category`, `price_krw`, `exhibition_id`, `status`(전시중/판매완료/보관중)
- 날짜는 `YYYY-MM-DD` 형식, `status`는 허용값 중 하나, `price_krw`는 0 이상인지 검사합니다
- `exhibition_id`가 있는 작품은 `exhibitions.json`에 실제 존재하는 전시인지 교차 검증합니다
- 검증 실패 시 어떤 필드가 왜 잘못됐는지 구체적으로 안내하고 반영을 중단합니다

### 4단계: 반영
- 검증을 통과하면 해당 JSON 파일에 항목을 추가하거나 기존 항목을 갱신합니다
- 변경 전/후 값을 비교해 사용자에게 보여줍니다

### 5단계: 결과 보고

아래 형식으로 보고합니다:

---
## 콘텐츠 반영 결과
**구분**: 전시 등록 / 전시 수정 / 작품 등록 / 작품 수정
**대상**: [id / 제목]

### 변경 내용
| 필드 | 이전 값 | 변경 값 |
|------|--------|--------|

### 검증 결과
- ✅ 통과 항목 / ⚠️ 경고 사항 (있는 경우)

### 반영 파일
- `content/exhibitions.json` 또는 `content/artworks.json`
---
