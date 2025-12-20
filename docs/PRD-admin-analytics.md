# PRD: 관리자 대시보드 방문 분석 시스템

## 개요

초호펜션 관리자 대시보드의 방문 분석 시스템을 초호쉼터 관리자에 이식하기 위한 요구사항 문서입니다.

---

## 1. 시스템 아키텍처

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Google GA4    │     │ Search Console  │     │    Airtable     │
│   Analytics     │     │                 │     │   (캐시 저장)    │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────┬───────────┴───────────────────────┘
                     │
              ┌──────▼──────┐
              │  Next.js    │
              │  API Routes │
              └──────┬──────┘
                     │
              ┌──────▼──────┐
              │   관리자     │
              │  대시보드    │
              └─────────────┘
```

---

## 2. 필수 환경 변수

### Google Analytics 4
```env
GA4_PROPERTY_ID=517032710
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}
```

### Google Search Console
```env
SEARCH_CONSOLE_SITE_URL=sc-domain:chorigol.co.kr
```

### Airtable (선택사항 - 캐시용)
```env
AIRTABLE_API_KEY=pat...
AIRTABLE_ANALYTICS_BASE_ID=app...
AIRTABLE_ANALYTICS_SUMMARY_TABLE=tbl...
AIRTABLE_ANALYTICS_PAGES_TABLE=tbl...
AIRTABLE_ANALYTICS_SOURCES_TABLE=tbl...
AIRTABLE_ANALYTICS_DEVICES_TABLE=tbl...
AIRTABLE_ANALYTICS_KEYWORDS_TABLE=tbl...
```

---

## 3. 필요 패키지

```json
{
  "@google-analytics/data": "^4.x",
  "google-auth-library": "^9.x",
  "googleapis": "^144.x"
}
```

---

## 4. 핵심 파일 구조

```
src/
├── app/
│   ├── admin/
│   │   └── analytics/
│   │       └── page.tsx          # 방문 분석 페이지 (UI)
│   └── api/
│       └── analytics/
│           ├── route.ts          # API 엔드포인트
│           └── sync/
│               └── route.ts      # Airtable 동기화 (선택)
└── lib/
    ├── analytics.ts              # GA4/Search Console 라이브러리
    └── analytics-airtable.ts     # Airtable 캐시 라이브러리 (선택)
```

---

## 5. 주요 기능 및 API 엔드포인트

### 5.1 API 엔드포인트

| 엔드포인트 | 파라미터 | 설명 |
|-----------|---------|------|
| `/api/analytics?type=summary` | days, startDate, endDate | 요약 통계 |
| `/api/analytics?type=daily` | days, startDate, endDate | 일별 데이터 |
| `/api/analytics?type=pages` | days | 인기 페이지 |
| `/api/analytics?type=sources` | days | 트래픽 소스 |
| `/api/analytics?type=realtime` | - | 실시간 방문자 |
| `/api/analytics?type=traffic` | days | 유입 분석 전체 |
| `/api/analytics?type=keywords` | days | 검색어 분석 |
| `/api/analytics?type=period-keywords` | - | 기간별 검색어 Top5 |
| `/api/analytics?type=comparison` | currentStart, currentEnd, previousStart, previousEnd | 기간 비교 |

### 5.2 주요 데이터 타입

```typescript
// 요약 통계
interface AnalyticsSummary {
  totalUsers: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
}

// 일별 데이터
interface DailyData {
  date: string;
  users: number;
  sessions: number;
  pageViews: number;
}

// 검색어
interface SearchKeyword {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

// 기간별 검색어
interface PeriodKeywords {
  thisWeek: SearchKeyword[];
  lastWeek: SearchKeyword[];
  thisMonth: SearchKeyword[];
  lastMonth: SearchKeyword[];
}
```

---

## 6. UI 구성 (4개 탭)

### 6.1 개요 탭
- 실시간 방문자 수 (자동 새로고침)
- 핵심 지표 카드 (방문자, 신규, 세션, 페이지뷰, 체류시간, 이탈률)
- 일별 방문자 추이 차트
- 인기 페이지 Top 10
- 트래픽 소스

### 6.2 유입 분석 탭
- 채널 그룹별 유입
- 소스/매체 상세
- 랜딩 페이지
- 디바이스별 통계
- 지역별 통계 (도시)
- 브라우저별 통계

### 6.3 검색어 탭 (신규)
- **기간별 유입 검색어 Top 5**
  - 지난 주 / 이번 주 / 지난 달 / 이번 달
  - 4컬럼 그리드, 각 기간별 클릭수 표시
- 전체 유입 검색어 목록 (Search Console)
- 검색 유입 페이지

### 6.4 방문분석 탭
- 기간 비교 (지난 주 대비 / 지난 달 대비 / 전년 동기 대비)
- 지표별 증감률 표시
- 채널별 비교

---

## 7. 핵심 구현 사항

### 7.1 GA4 클라이언트 초기화
```typescript
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}');
const analyticsDataClient = new BetaAnalyticsDataClient({ credentials });
```

### 7.2 Search Console 클라이언트 초기화
```typescript
import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';

const auth = new GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}'),
  scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
});
const searchConsole = google.searchconsole({ version: 'v1', auth });
```

### 7.3 메모리 캐시 (Rate Limit 방지)
```typescript
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5분

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry || Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}
```

### 7.4 이전 기간 데이터 없을 때 처리
```typescript
// 이전 기간 데이터가 없으면 0으로 처리
const safePreviousSummary = previousSummary || {
  totalUsers: 0,
  newUsers: 0,
  sessions: 0,
  pageViews: 0,
  avgSessionDuration: 0,
  bounceRate: 0,
};
```

---

## 8. 기간별 검색어 Top5 구현

### API (route.ts)
```typescript
if (type === 'period-keywords') {
  const today = new Date();
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  // 이번 주 (일요일 ~ 오늘)
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay());

  // 지난 주
  const lastWeekEnd = new Date(thisWeekStart);
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
  const lastWeekStart = new Date(lastWeekEnd);
  lastWeekStart.setDate(lastWeekEnd.getDate() - 6);

  // 이번 달 / 지난 달 계산...

  const [thisWeek, lastWeek, thisMonth, lastMonth] = await Promise.all([
    getSearchKeywords(0, 5, formatDate(thisWeekStart), formatDate(today)),
    getSearchKeywords(0, 5, formatDate(lastWeekStart), formatDate(lastWeekEnd)),
    getSearchKeywords(0, 5, formatDate(thisMonthStart), formatDate(today)),
    getSearchKeywords(0, 5, formatDate(lastMonthStart), formatDate(lastMonthEnd)),
  ]);

  return NextResponse.json({ thisWeek, lastWeek, thisMonth, lastMonth });
}
```

### UI 컴포넌트
```tsx
function PeriodKeywordsSection() {
  const [data, setData] = useState<PeriodKeywords | null>(null);

  useEffect(() => {
    fetch('/api/analytics?type=period-keywords')
      .then(res => res.json())
      .then(setData);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>기간별 유입 검색어 Top 5</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {renderKeywordList(data?.lastWeek, '지난 주', 'bg-blue-50')}
          {renderKeywordList(data?.thisWeek, '이번 주', 'bg-emerald-50')}
          {renderKeywordList(data?.lastMonth, '지난 달', 'bg-purple-50')}
          {renderKeywordList(data?.thisMonth, '이번 달', 'bg-orange-50')}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 9. 스타일 가이드

### 색상 팔레트
- 주요 강조: `emerald-600` (#059669)
- 증가 표시: `emerald-500` (▲)
- 감소 표시: `red-500` (▼)
- 기간별 배경:
  - 지난 주: `bg-blue-50`
  - 이번 주: `bg-emerald-50`
  - 지난 달: `bg-purple-50`
  - 이번 달: `bg-orange-50`

### 순위 뱃지
- 1위: `bg-yellow-400 text-yellow-900`
- 2위: `bg-gray-300 text-gray-700`
- 3위: `bg-amber-600 text-white`
- 4위 이하: `bg-gray-200 text-gray-600`

---

## 10. Google Cloud 설정 가이드

### 10.1 서비스 계정 생성
1. Google Cloud Console 접속
2. IAM & Admin > Service Accounts
3. Create Service Account
4. JSON 키 다운로드

### 10.2 GA4 권한 부여
1. Google Analytics 관리자 접속
2. 속성 > 속성 액세스 관리
3. 서비스 계정 이메일 추가 (뷰어 권한)

### 10.3 Search Console 권한 부여
1. Search Console 접속
2. 설정 > 사용자 및 권한
3. 서비스 계정 이메일 추가 (전체 권한)

---

## 11. 체크리스트

### 환경 설정
- [ ] Google Cloud 서비스 계정 생성
- [ ] GA4 속성에 서비스 계정 권한 부여
- [ ] Search Console에 서비스 계정 권한 부여
- [ ] 환경 변수 설정 (Vercel)

### 파일 이식
- [ ] `src/lib/analytics.ts` 복사
- [ ] `src/lib/analytics-airtable.ts` 복사 (선택)
- [ ] `src/app/api/analytics/route.ts` 복사
- [ ] `src/app/admin/analytics/page.tsx` 복사
- [ ] 필요 패키지 설치

### 테스트
- [ ] `/api/analytics?type=summary` 정상 응답 확인
- [ ] `/api/analytics?type=period-keywords` 정상 응답 확인
- [ ] 관리자 대시보드 UI 확인

---

## 12. 참고 파일 위치

```
초호펜션 프로젝트 (choho_2025):
├── src/lib/analytics.ts                    # 핵심 라이브러리 (1200+ lines)
├── src/lib/analytics-airtable.ts           # Airtable 캐시 (346 lines)
├── src/app/api/analytics/route.ts          # API 엔드포인트 (600+ lines)
├── src/app/admin/analytics/page.tsx        # UI 컴포넌트 (2500+ lines)
└── docs/PRD-admin-analytics.md             # 본 문서
```

---

**문서 버전**: 1.0.0
**작성일**: 2025-12-20
**참조 프로젝트**: 초호펜션 관리자 대시보드
