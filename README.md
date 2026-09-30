# STEPSYNC

**Music for your pace.**

STEPSYNC는 최근 3~5회 러닝 기록과 이번 목표 거리·목표 페이스로 추천 리듬을 계산하고, 실제 BPM 정보를 웹에서 검증해 러닝 리듬에 어울리는 음악 후보를 추천하는 반응형 웹서비스입니다. 음악은 직접 재생하지 않으며 Spotify, Apple Music, YouTube Music 검색 링크를 제공합니다.

## 기술 스택

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Deterministic TypeScript rhythm engine — cadence/BPM range, confidence, ranking, Match Score
- OpenAI JavaScript/TypeScript SDK — 스크린샷 전용 Responses API image input, Structured Outputs
- GetSongBPM REST API — 음악 후보와 BPM 직접 조회
- Zod
- Vitest

## 실행 방법

Node.js 20.9 이상과 pnpm이 필요합니다.

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Windows PowerShell에서는 환경 파일을 다음처럼 복사할 수 있습니다.

```powershell
Copy-Item .env.example .env.local
```

개발 서버가 시작되면 `http://localhost:3000`을 엽니다.

Windows에서는 프로젝트 루트의 `시작.bat`을 더블클릭해도 됩니다. 서버가 준비되면 기본 브라우저에서 STEPSYNC가 자동으로 열립니다. 열린 명령창을 닫거나 `Ctrl+C`를 누르면 개발 서버도 종료됩니다. 처음 실행할 때 `node_modules`가 없다면 의존성을 먼저 설치합니다.

## OpenAI 환경 변수

1. `.env.example`을 `.env.local`로 복사합니다.
2. `.env.local`의 `OPENAI_API_KEY=` 뒤에 사용자의 키를 입력합니다.
3. 필요하면 `OPENAI_MODEL` 값을 변경합니다.
4. 개발 서버를 재시작합니다.

```dotenv
OPENAI_API_KEY=내_API_KEY
OPENAI_MODEL=gpt-5.6
```

API 키는 서버 route에서만 읽으며 브라우저에 노출되는 `NEXT_PUBLIC_` 환경 변수로 사용하지 않습니다. OpenAI 키는 스크린샷 분석에만 필요합니다. 직접 입력과 음악 추천에는 OpenAI를 호출하지 않습니다.

## 음악 검색 설정

1. [GetSongBPM API](https://getsongbpm.com/api)에서 앱 등록 후 무료 API 키를 발급받습니다. 공개 사이트의 GetSongBPM 출처 링크가 필요하며, 이 앱의 footer에 해당 링크가 포함되어 있습니다.
2. `.env.local`에 아래 항목을 직접 추가합니다.
3. 개발 서버를 재시작합니다.

```dotenv
GETSONGBPM_API_KEY=내_GetSongBPM_API_KEY
```

이 값은 서버에서만 사용합니다. 키가 없으면 음악 추천 시 `GETSONGBPM_API_KEY가 설정되지 않았습니다` 안내를 반환합니다. 기존 환경 파일은 자동으로 수정하지 않습니다.

## 추천 처리 구조

- 코드 계산: 최근 러닝 정규화, 목표 예상 시간, Pace Stability 보조 통계, 케이던스/BPM 범위, 분석 신뢰도, 곡 정렬, 추천 이유, Match Score
- OpenAI 사용: 스크린샷 값 추출
- 음악 검색: GetSongBPM `/tempo/`에 추천 범위와 half-time 범위의 정수 BPM을 각각 조회합니다. 국가별 필터나 우선순위는 없습니다. 음악 취향과 제외 조건은 기존 코드에서 순위 계산 시 반영합니다.
- 검색 서비스에는 BPM과 결과 제한값만 전달하며 러닝 기록과 사용자 입력은 보내지 않습니다.

리듬 도출, 음악 검색, 후보 순위 계산은 OpenAI 토큰을 사용하지 않습니다. GetSongBPM 응답의 곡명·아티스트·BPM·출처 URL을 검증하고 기존 추천 구조로 변환합니다.

## 현재 지원하는 입력

- 직접 입력: 거리, 운동 시간/평균 페이스, 평균 케이던스
- 스크린샷: Samsung Health, Garmin, Strava 등의 대표 기록 화면 3~5장에서 거리, 시간, 평균 페이스, 평균 케이던스, 구간별 페이스 추출
- 러닝 앱 직접 연동: 첫 provider가 아직 결정되지 않아 준비 중

Samsung Health는 MVP에서 직접 연동하지 않으며 스크린샷 입력으로 지원합니다. FIT, TCX, GPX 파일은 지원하지 않습니다.

## 검증 명령

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

실제 외부 API를 호출하는 테스트는 기본 테스트에 포함하지 않습니다. 계산, 입력 validation, Structured Output validation, 음악 URL, GetSongBPM 응답 정규화 및 오류 처리를 검증합니다.

## 데이터와 제한

- 로그인, 데이터베이스, 영구 저장소가 없습니다.
- 입력과 결과는 현재 브라우저 세션에만 유지됩니다.
- 업로드 이미지는 OpenAI 분석 요청에만 사용하고 앱에서 저장하지 않습니다.
- Match Score는 코드로 계산한 MVP 내부 휴리스틱을 정규화한 UI 값이며 AI 예측 확률이나 과학적 성공 확률이 아닙니다.
- GetSongBPM 무료 API는 시간당 3,000회 제한이 있습니다. 동일 BPM 결과를 서버 메모리에 1시간 캐시합니다(서버 재시작 시 초기화, 서버 인스턴스별 캐시).
- BPM당 최대 250개 후보를 조회하고 기존 알고리즘으로 최대 10곡을 추천합니다. 전 세계 모든 곡을 조회하는 것은 아니며, 등록되지 않은 곡·최신곡은 누락될 수 있습니다.
- 단일 BPM 출처이므로 신뢰도는 `medium`으로 설정합니다. 다른 데이터베이스와 교차 검증하지 않습니다.
- API에 측정된 에너지 정보가 없어 `balanced` 중립값으로 기존 순위 계산에 전달합니다. 실제 음악의 에너지를 분석했다는 의미는 아닙니다.
- 앨범 이미지를 제공하지 않는 API이므로 기존 neutral fallback artwork를 사용합니다.
