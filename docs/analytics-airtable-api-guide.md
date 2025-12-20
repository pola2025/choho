# Analytics API - Airtable 연동 가이드

## 개요

웹페이지에서 Google Analytics API를 직접 호출하면 리밋 제한에 걸릴 수 있음.
이를 해결하기 위해 **Airtable을 캐시 레이어로 사용**하여 API 호출을 최소화.

```
[웹페이지] → [API Route] → [Airtable 조회] → 데이터 있음 → 반환
                              ↓ 데이터 없음
                         [GA API 조회] → 반환
```

---

## 파일 구조

```
src/
├── app/api/analytics/
│   ├── route.ts          # 메인 API (Airtable 우선 조회)
│   └── sync/route.ts     # GA → Airtable 동기화 API
├── lib/
│   ├── analytics.ts      # Google Analytics 함수들
│   └── analytics-airtable.ts  # Airtable CRUD 함수들
```

---

## 환경변수 (.env.local)

```bash
# Google Analytics
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}
GA_PROPERTY_ID=properties/123456789

# Airtable
AIRTABLE_API_KEY=pat...
AIRTABLE_ANALYTICS_BASE_ID=app...
AIRTABLE_ANALYTICS_SUMMARY_TABLE=tbl...
AIRTABLE_ANALYTICS_PAGES_TABLE=tbl...
AIRTABLE_ANALYTICS_SOURCES_TABLE=tbl...
AIRTABLE_ANALYTICS_DEVICES_TABLE=tbl...
AIRTABLE_ANALYTICS_KEYWORDS_TABLE=tbl...
```

---

## API 엔드포인트

### GET /api/analytics

| 파라미터 | 설명 | 기본값 |
|---------|------|--------|
| `type` | 데이터 타입 | `all` |
| `days` | 조회 기간 (일) | `30` |
| `source` | 데이터 소스 | `auto` |
| `startDate` | 시작일 (YYYY-MM-DD) | - |
| `endDate` | 종료일 (YYYY-MM-DD) | - |

#### type 옵션

| type | 설명 | Airtable 지원 |
|------|------|---------------|
| `summary` | 요약 (총 사용자, 세션 등) | ✅ |
| `daily` | 일별 데이터 | ✅ |
| `pages` | 인기 페이지 | ✅ |
| `sources` | 트래픽 소스 | ✅ |
| `devices` | 기기별 통계 | ✅ |
| `keywords` | 검색 키워드 | ✅ |
| `realtime` | 실시간 사용자 | ❌ (GA only) |
| `source-medium` | 소스/매체 | ❌ (GA only) |
| `channels` | 채널 그룹 | ❌ (GA only) |
| `landing` | 랜딩 페이지 | ❌ (GA only) |
| `cities` | 도시별 | ❌ (GA only) |
| `browsers` | 브라우저별 | ❌ (GA only) |
| `comparison` | 기간 비교 | ❌ (GA only) |
| `traffic` | 유입 분석 전체 | 일부 |
| `all` | 모든 데이터 | 일부 |

#### source 옵션

| source | 설명 |
|--------|------|
| `auto` | Airtable 우선 → GA 폴백 (기본값) |
| `airtable` | Airtable만 조회 |
| `ga` | GA만 조회 |

#### 응답 예시

```json
{
  "summary": {
    "totalUsers": 1234,
    "newUsers": 567,
    "sessions": 2345,
    "pageViews": 5678,
    "avgSessionDuration": 120.5,
    "bounceRate": 45.2
  },
  "source": "airtable"  // 또는 "ga", "mixed"
}
```

---

## Airtable 테이블 스키마

### Summary 테이블

| 필드명 | 타입 | 설명 |
|--------|------|------|
| date | Text | 날짜 (YYYY-MM-DD) |
| totalUsers | Number | 총 사용자 |
| newUsers | Number | 신규 사용자 |
| sessions | Number | 세션 수 |
| pageViews | Number | 페이지뷰 |
| avgSessionDuration | Number | 평균 세션 시간 (초) |
| bounceRate | Number | 이탈률 (%) |
| syncedAt | Text | 동기화 시간 (ISO) |

### Pages 테이블

| 필드명 | 타입 | 설명 |
|--------|------|------|
| date | Text | 날짜 |
| path | Text | 페이지 경로 |
| title | Text | 페이지 제목 |
| views | Number | 조회수 |
| syncedAt | Text | 동기화 시간 |

### Sources 테이블

| 필드명 | 타입 | 설명 |
|--------|------|------|
| date | Text | 날짜 |
| source | Text | 트래픽 소스 |
| medium | Text | 매체 |
| users | Number | 사용자 수 |
| sessions | Number | 세션 수 |
| syncedAt | Text | 동기화 시간 |

### Devices 테이블

| 필드명 | 타입 | 설명 |
|--------|------|------|
| date | Text | 날짜 |
| device | Text | 기기 타입 (desktop/mobile/tablet) |
| users | Number | 사용자 수 |
| sessions | Number | 세션 수 |
| pageViews | Number | 페이지뷰 |
| syncedAt | Text | 동기화 시간 |

### Keywords 테이블

| 필드명 | 타입 | 설명 |
|--------|------|------|
| date | Text | 날짜 |
| query | Text | 검색어 |
| clicks | Number | 클릭 수 |
| impressions | Number | 노출 수 |
| ctr | Number | 클릭률 (%) |
| position | Number | 평균 순위 |
| syncedAt | Text | 동기화 시간 |

---

## 사용 예시

### 프론트엔드에서 호출

```typescript
// Airtable 우선 조회 (기본)
const res = await fetch('/api/analytics?type=summary&days=30');
const data = await res.json();
console.log(data.source); // 'airtable' 또는 'ga'

// GA 강제 조회 (Airtable 무시)
const res2 = await fetch('/api/analytics?type=summary&days=30&source=ga');
```

### 데이터 동기화 (Cron Job)

```bash
# 매일 자정에 실행 (GitHub Actions, Vercel Cron 등)
curl -X POST https://your-domain.com/api/analytics/sync
```

---

## 주의사항

1. **Airtable API 제한**: 분당 5회 요청 제한 있음. 동기화 시 배치 처리 필요.

2. **실시간 데이터**: `realtime` 타입은 항상 GA에서 조회 (캐시 불가).

3. **데이터 신선도**: Airtable 데이터는 마지막 동기화 시점 기준. 최신 데이터가 필요하면 `source=ga` 사용.

4. **GA API 할당량**: 일일 200,000회 토큰 제한. Airtable 캐시로 대부분 해결.

---

## 관련 문서

- [Airtable Analytics 설정 가이드](./airtable-analytics-guide.html)
- [PRD - Analytics Caching](./PRD-analytics-caching.md)
