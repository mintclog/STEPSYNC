# STEPSYNC

**Music for your pace.**

STEPSYNC는 최근 3~5회 러닝 기록과 이번 목표 거리·목표 페이스로 추천 리듬을 계산하고, 실제 BPM 정보를 웹에서 검증해 러닝 리듬에 어울리는 음악 후보를 추천하는 반응형 웹서비스입니다. 음악은 직접 재생하지 않으며 Spotify, Apple Music, YouTube Music 검색 링크를 제공합니다.

## 기술 스택

- Next.js App Router
- React + TypeScript
- Tailwind CSS
- Deterministic TypeScript rhythm engine — cadence/BPM range, confidence, ranking, Match Score
- OpenAI JavaScript/TypeScript SDK — Responses API image input, Hosted Web Search, Structured Outputs
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

API 키는 서버 route에서만 읽으며 브라우저에 노출되는 `NEXT_PUBLIC_` 환경 변수로 사용하지 않습니다. 키가 없어도 랜딩, 직접 입력, validation, 단계 이동, 예상 시간 계산은 동작합니다. 이미지 분석이나 음악 추천을 요청하면 `.env.local` 설정이 필요하다는 명확한 오류를 표시합니다.

## 추천 처리 구조

- 코드 계산: 최근 러닝 정규화, 목표 예상 시간, Pace Stability 보조 통계, 케이던스/BPM 범위, 분석 신뢰도, 곡 정렬, 추천 이유, Match Score
- OpenAI 사용: 스크린샷 값 추출, Web Search를 통한 실제 곡 후보 탐색과 BPM 출처 검증
- 음악 검색 시 OpenAI에는 계산된 BPM 범위와 목표·취향만 전달하며 최근 러닝 원본 기록은 전달하지 않습니다.

따라서 리듬 도출과 후보 순위 계산 자체는 토큰을 사용하지 않습니다. 다만 로컬 음악 카탈로그를 포함하지 않는 현재 MVP에서 실제 곡을 찾고 BPM을 검증하려면 OpenAI API 호출이 필요합니다.

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

실제 OpenAI API를 호출하는 테스트는 기본 테스트에 포함하지 않습니다. API 경계 밖의 계산, 입력 validation, Structured Output 응답 validation, 외부 음악 검색 URL 생성을 검증합니다.

## 데이터와 제한

- 로그인, 데이터베이스, 영구 저장소가 없습니다.
- 입력과 결과는 현재 브라우저 세션에만 유지됩니다.
- 업로드 이미지는 OpenAI 분석 요청에만 사용하고 앱에서 저장하지 않습니다.
- Match Score는 코드로 계산한 MVP 내부 휴리스틱을 정규화한 UI 값이며 AI 예측 확률이나 과학적 성공 확률이 아닙니다.
- Web Search는 곡 후보와 BPM 검증 정보만 반환하며 케이던스/BPM 범위와 순위는 변경할 수 없습니다.
- Web Search에서 BPM을 신뢰성 있게 검증하지 못한 곡은 후보에서 제외하도록 지시합니다.
