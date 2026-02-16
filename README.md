# 날씨 앱

## 프로젝트 실행 방법

### 사전 요구사항

- Node.js 18 이상
- npm 9 이상

### 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 아래 키를 설정합니다.

```
VITE_OPENWEATHER_API_KEY=<OpenWeatherMap API 키>
VITE_KAKAO_REST_KEY=<Kakao REST API 키>
```

- OpenWeatherMap API 키: [https://openweathermap.org/api](https://openweathermap.org/api) 에서 무료 플랜으로 발급
- Kakao REST API 키: [https://developers.kakao.com](https://developers.kakao.com) 에서 애플리케이션 등록 후 발급

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과물 미리보기
npm run preview
```

### 테스트 및 기타 명령어

```bash
# 단위 테스트 실행
npm test

# 테스트 워치 모드
npm run test:watch

# 린트 검사
npm run lint

# Storybook 실행
npm run storybook
```

### 스토리북 배포

[https://main--6992c4d87c028f4f6525fef2.chromatic.com](https://main--6992c4d87c028f4f6525fef2.chromatic.com)

### 번들 분석

`rollup-plugin-visualizer`를 통해 번들 사이즈를 시각적으로 분석할 수 있습니다.

```bash
# 분석 결과 보기
npm run preview-bundle
```

---

## 구현한 기능에 대한 설명

### 1. 현재 위치 기반 날씨

- 브라우저 **Geolocation API**로 사용자 위치를 감지하여 현재 날씨 자동 표시
- 위치 권한 거부 또는 API 실패 시 **3단계 Fallback Chain** 적용
  1. Geolocation API
  2. Kakao 지오코딩 ("서울" → 좌표)
  3. 하드코딩 서울 좌표

- 기본 위치로 전환된 경우 UI에 **"(기본: 서울)"** 안내 노출

어떤 환경에서도 빈 화면이 발생하지 않도록 설계했습니다.

### 2. 한글 특화 지역 검색

약 2만 개 행정구역(시/도, 구/군, 동/읍/면, 리)을 대상으로
한글 입력 특성을 고려한 검색을 지원합니다.

| 입력 방식   | 예시           | 설명                       |
| ----------- | -------------- | -------------------------- |
| 일반 텍스트 | 서울, 강남구   | 문자열 포함 검색           |
| 초성        | ㅅㅇ → 서울    | 자음만으로 검색            |
| 혼합        | 광ㅈ → 광주    | 완성형 + 초성 조합         |
| 부분 음절   | 부사 → 부산    | 마지막 글자 초성+중성 매칭 |
| 복합 쿼리   | 경기도 군포시  | 공백 기반 다중 토큰 검색   |
| 연속 입력   | 경상북도의성군 | 공백 없이도 매칭           |

- 4단계 정렬 전략 적용
  (매칭 위치 → 행정 계층 → 정확 매칭 → 가나다순)
- 매칭 구간 하이라이팅 처리

### 3. 날씨 상세 페이지

- `/weather/:districtName` 경로 기반 라우팅
- Kakao 역지오코딩으로 **공식 행정구역명과 URL 파라미터 비교**
- 불일치 시 자동 URL 보정
  예: `/weather/경기도-의왕시-내손` → `내손동`

표시 정보:

- 현재 온도 / 체감 온도 / 습도 / 풍속
- 날씨 상태에 따른 동적 그라데이션 배경
- 3시간 간격 시간별 예보 (가로 스크롤 UI)

### 4. 즐겨찾기

- 최대 6개 지역 등록 가능
- 지역별 사용자 지정 별명 설정 가능
- 메인 페이지에서 카드 그리드 형태로 일괄 확인
- Zustand `persist` 미들웨어로 localStorage 자동 동기화

브라우저를 종료해도 즐겨찾기 상태가 유지됩니다.

### 5. 에러 처리 및 UX

#### 에러 처리

- HTTP 상태 코드별 메시지 매핑
  - 401: API 키 오류
  - 404: 지역 미존재
  - 429: 요청 한도 초과

- 재시도 버튼 제공
- `GlobalErrorBoundary + QueryErrorResetBoundary` 조합으로 복구 UI 제공

#### 사용자 경험 개선

- 로딩 중 영역별 스켈레톤 UI 표시
- Toast 알림으로 사용자 액션 피드백 제공
- 즐겨찾기 추가/삭제/한도 초과 즉시 반영

## 기술적 의사결정 및 이유

### 1. 번들 최적화

#### 문제

프로덕션 빌드 결과: 단일 JS 청크 1,270KB
`korea_districts.json`이 977KB로 번들의 약 75% 차지

#### 해결

정적 import 제거 → fetch 기반 동적 로딩 전환

```
Before: import districts from "./korea_districts.json"
After:  fetch("/data/korea_districts.json")
```

- 최초 검색 시 1회 로드 후 메모리 캐싱
- 검색 전까지 JSON 다운로드 지연
- 동기 검색 → 비동기 패턴으로 전환

#### Trade-off

최초 검색 시 지연이 발생하지만,
초기 번들 크기 감소로 First Paint 개선 효과가 더 크다고 판단했습니다.

### 2. es-hangul 기반 한글 검색 엔진 구현

#### 문제

행정구역 검색에서 다음 입력을 모두 지원해야 했습니다.

- 초성: "ㅅㅇ"
- 혼합: "광ㅈ"
- 부분 음절: "부사" → 부산
- 연속 입력: "경상북도의성군"

범용 검색 라이브러리(MiniSearch, Fuse.js)는
초성 매칭을 지원하지 않거나 정렬 커스터마이징에 제약이 있었습니다.

#### 판단

es-hangul은 검색 엔진이 아닌 **한글 분해/조합 유틸리티**이므로,
이를 기반으로 검색 로직을 직접 설계하기로 결정했습니다.

#### 해결

- `koreanIncludes` 함수에서
  `getChoseong`, `canBeChoseong`, `disassembleCompleteCharacter` 등을 조합
- 초성·혼합·부분 음절 매칭을 **단일 순회 로직**으로 처리
- 4단계 정렬 전략 적용
  (매칭 위치 → 행정 계층 → 정확 매칭 → 가나다순)
- 하이라이트 범위 병합(merge intervals) 알고리즘 적용
- 36개 테스트 케이스로 경계 조건 검증

### 3. Kakao + OpenWeatherMap 이중 API 전략

#### 문제

OpenWeatherMap의 `name` 필드는 간혹 로마자 표기로 뜨거나, 동 단위 정밀도가 부족했습니다.
정확한 한국 행정구역명을 UI와 URL에 반영하기 어려웠습니다.

#### 해결

- 날씨 데이터: OpenWeatherMap
- 지명 처리: Kakao Local API

역지오코딩 결과를 URL 파라미터와 비교하여
불일치 시 `replace` 옵션으로 자동 보정합니다.

```
사용자 입력
  → Kakao 주소 검색 (주소 → 좌표)
  → OpenWeatherMap (좌표 → 날씨)
  → Kakao 역지오코딩 (좌표 → 공식 행정구역명)
  → URL 보정
```

#### Trade-off

API 의존점이 2개로 증가했지만,
지명 정확도와 URL 정합성을 우선했습니다.

### 4. 서버 상태와 클라이언트 상태 분리

#### 역할 분리

- 서버 상태: 날씨, 예보, 지오코딩 (TanStack Query)
- 클라이언트 상태: 즐겨찾기 (Zustand)

즐겨찾기는 사용자 조작 기반 로컬 데이터이므로
Query의 캐시 무효화 모델과 맞지 않는다고 판단했습니다.

#### 캐싱 전략

| 데이터      | staleTime | gcTime | 근거                |
| ----------- | --------- | ------ | ------------------- |
| 현재 날씨   | 5분       | 10분   | 무료 플랜 갱신 주기 |
| 시간별 예보 | 10분      | 15분   | 변화 속도 느림      |
| 지오코딩    | 30분      | 60분   | 좌표는 고정 데이터  |

#### 성능 개선

즐겨찾기 날씨를 `useQueries`로 병렬 처리하여
6개 지역 순차 요청(약 6초)을 단일 요청 수준(약 1초)으로 단축했습니다.

### 5. Geolocation 3단계 Fallback 설계

어떤 환경에서도 빈 화면이 발생하지 않도록 설계했습니다.

| 단계 | 방법               | 조건               |
| ---- | ------------------ | ------------------ |
| 1    | Geolocation API    | 권한 허용          |
| 2    | Kakao 지오코딩     | 권한 거부 / 미지원 |
| 3    | 하드코딩 서울 좌표 | API 실패           |

- `useGeolocation`: 브라우저 API 래핑
- `useAppLocation`: 폴백 로직 분리
- `isDefaultLocation` 플래그로 UI 상태 명확화

관심사를 분리해 재사용성과 테스트 용이성을 확보했습니다.

### 6. API 응답 타입과 내부 모델 분리 (Mapper 패턴)

외부 API 스키마와 앱 내부 모델을 분리했습니다.

```
WeatherResponse  → mapWeatherResponseToData → WeatherData
ForecastResponse → mapForecastToHourly      → HourlyWeather[]
```

API 구조 변경 시 mapper 레이어만 수정하면 되도록 설계하여
컴포넌트 레이어를 보호했습니다.

### 7. 접근성 구현

단순 ARIA 추가가 아닌, 실제 사용 가능한 접근성을 목표로 했습니다.

| 문제                 | 해결                   |
| -------------------- | ---------------------- |
| 모달 포커스 이탈     | 포커스 트랩 + 복원     |
| 레이아웃 시프트      | body 스크롤 잠금 보정  |
| 드롭다운 키보드 접근 | WAI-ARIA Combobox 패턴 |
| IME 입력 충돌        | `isComposing` 처리     |
| 토스트 인식 불가     | `aria-live="polite"`   |
| 에러 인식 불가       | `role="alert"`         |
| 장식 요소 노출       | `aria-hidden` 처리     |

---

## 사용한 기술 스택

| 분류                 | 기술                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------- |
| 프레임워크           | React 19, TypeScript 5.9                                                                 |
| 빌드 도구            | Vite 6                                                                                   |
| 라우팅               | React Router 7                                                                           |
| 서버 상태 관리       | TanStack Query 5                                                                         |
| 클라이언트 상태 관리 | Zustand 5 (persist + devtools)                                                           |
| HTTP 클라이언트      | Axios                                                                                    |
| 스타일링             | Tailwind CSS 3                                                                           |
| 한글 처리            | es-hangul                                                                                |
| 테스트               | Vitest, jsdom, Playwright                                                                |
| 컴포넌트 문서화      | Storybook 10                                                                             |
| 코드 품질            | ESLint, Prettier, Husky, lint-staged                                                     |
| 외부 API             | OpenWeatherMap (Current Weather, 5 Day Forecast), Kakao Local (주소 검색, 좌표→행정구역) |
