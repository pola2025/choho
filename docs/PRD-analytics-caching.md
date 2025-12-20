# PRD: Analytics 데이터 캐싱 시스템

## 개요

Google Analytics API 호출을 최소화하고, Airtable에 통계 데이터를 저장하여 대시보드에서 빠르게 조회할 수 있도록 하는 시스템.

## 문제점

1. **서버 재시작 시 캐시 소멸**: 현재 메모리 캐시(5분)는 서버 재시작 시 사라짐
2. **API 할당량 낭비**: 같은 데이터를 반복 호출
3. **속도 저하**: 매번 Google API 호출로 인한 지연

## 해결책

### 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                        Flow                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────────┐    동기화     ┌──────────────┐           │
│   │ Google       │  ─────────▶  │  Airtable    │           │
│   │ Analytics    │  (1시간마다)  │  (영구저장)   │           │
│   │ API          │               │              │           │
│   └──────────────┘               └──────┬───────┘           │
│                                         │                    │
│                                         │ 조회               │
│                                         ▼                    │
│                                  ┌──────────────┐           │
│                                  │  Dashboard   │           │
│                                  │  (빠른 로딩)  │           │
│                                  └──────────────┘           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Airtable 테이블 구조

#### 1. `analytics_summary` (일별 요약)

| 필드명 | 타입 | 설명 |
|--------|------|------|
| date | Date | 날짜 (YYYY-MM-DD) |
| totalUsers | Number | 총 사용자 수 |
| newUsers | Number | 신규 사용자 수 |
| sessions | Number | 세션 수 |
| pageViews | Number | 페이지뷰 수 |
| avgSessionDuration | Number | 평균 세션 시간 (초) |
| bounceRate | Number | 이탈률 (%) |
| syncedAt | DateTime | 동기화 시간 |

#### 2. `analytics_pages` (인기 페이지)

| 필드명 | 타입 | 설명 |
|--------|------|------|
| date | Date | 날짜 |
| path | Text | 페이지 경로 |
| title | Text | 페이지 제목 |
| views | Number | 조회수 |
| syncedAt | DateTime | 동기화 시간 |

#### 3. `analytics_sources` (트래픽 소스)

| 필드명 | 타입 | 설명 |
|--------|------|------|
| date | Date | 날짜 |
| source | Text | 소스 |
| medium | Text | 매체 |
| users | Number | 사용자 수 |
| sessions | Number | 세션 수 |
| syncedAt | DateTime | 동기화 시간 |

#### 4. `analytics_devices` (기기별 통계)

| 필드명 | 타입 | 설명 |
|--------|------|------|
| date | Date | 날짜 |
| device | Text | 기기 종류 (desktop/mobile/tablet) |
| users | Number | 사용자 수 |
| sessions | Number | 세션 수 |
| pageViews | Number | 페이지뷰 |
| syncedAt | DateTime | 동기화 시간 |

#### 5. `analytics_search_keywords` (검색 키워드)

| 필드명 | 타입 | 설명 |
|--------|------|------|
| date | Date | 날짜 |
| query | Text | 검색어 |
| clicks | Number | 클릭 수 |
| impressions | Number | 노출 수 |
| ctr | Number | 클릭률 (%) |
| position | Number | 평균 순위 |
| syncedAt | DateTime | 동기화 시간 |

### API 엔드포인트

#### 동기화 API (Cron Job)

```
POST /api/analytics/sync
```

- 1시간마다 Vercel Cron으로 실행
- Google Analytics API → Airtable 동기화
- 응답: 동기화된 레코드 수

#### 조회 API (대시보드용)

```
GET /api/analytics?type=summary&days=30
```

- Airtable에서 캐시된 데이터 조회
- Google API 호출 없음
- 빠른 응답

### 동기화 전략

1. **일별 데이터 (1일 1회)**
   - 어제 날짜의 확정 데이터 저장
   - 매일 오전 6시 KST 동기화

2. **당일 데이터 (1시간마다)**
   - 오늘 날짜의 실시간 데이터 업데이트
   - upsert 방식 (있으면 업데이트, 없으면 생성)

3. **실시간 사용자 (기존 유지)**
   - 실시간 사용자 수만 Google API 직접 호출
   - 30초 메모리 캐시 유지

### 환경 변수

```env
# Airtable
AIRTABLE_API_KEY=patXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX

# 기존
GA4_PROPERTY_ID=XXXXXXXXX
GOOGLE_APPLICATION_CREDENTIALS_JSON={...}
```

### 구현 파일

```
src/
├── lib/
│   ├── analytics.ts          # 기존 (Google API 호출)
│   ├── analytics-airtable.ts # 신규 (Airtable CRUD)
│   └── analytics-sync.ts     # 신규 (동기화 로직)
├── app/
│   └── api/
│       └── analytics/
│           ├── route.ts      # 수정 (Airtable 우선 조회)
│           └── sync/
│               └── route.ts  # 신규 (동기화 엔드포인트)
```

### Vercel Cron 설정

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/analytics/sync",
      "schedule": "0 * * * *"
    }
  ]
}
```

### 예상 효과

| 항목 | 현재 | 개선 후 |
|------|------|---------|
| API 호출 횟수 (일) | 수백~수천 회 | 24회 |
| 대시보드 로딩 속도 | 2~5초 | 0.5초 이내 |
| 서버 재시작 영향 | 캐시 손실 | 영향 없음 |
| API 할당량 위험 | 높음 | 거의 없음 |

### 구현 우선순위

1. **Phase 1**: Airtable 연동 및 기본 동기화
   - Airtable 테이블 생성
   - 동기화 API 구현
   - 요약/일별 데이터 저장

2. **Phase 2**: 대시보드 연동
   - 조회 API Airtable 우선 조회로 변경
   - 실시간 데이터만 Google API 사용

3. **Phase 3**: 고급 기능
   - 검색 키워드 동기화
   - 비교 분석 데이터 캐싱
   - 데이터 정리 자동화 (30일 이상 오래된 상세 데이터 삭제)

---

## 다음 단계

1. Airtable Base 생성 및 테이블 구조 설정
2. 환경 변수 설정
3. 동기화 API 구현
4. 테스트 및 배포
