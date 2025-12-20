# 초호펜션 방문통계 기능 PRD

## 1. 개요

### 1.1 목적
초호펜션 관리자 페이지에 Google Analytics 4 기반의 상세 방문통계 기능을 추가하여, 유입 분석 및 마케팅 인사이트를 제공합니다.

### 1.2 참고 구현
초호쉼터(admin-chohopark) 프로젝트에 구현된 방문통계 기능을 기반으로 합니다.

---

## 2. 기능 요구사항

### 2.1 기존 기능 (개요 탭)
- [x] 현재 접속자 (실시간)
- [x] 총 방문자, 신규 방문자, 세션 수, 페이지뷰
- [x] 평균 체류시간, 이탈률
- [x] 일별 방문자 추이 차트
- [x] 트래픽 소스 (소스만)
- [x] 인기 페이지

### 2.2 신규 기능 (유입 분석 탭)
- [ ] **트래픽 채널** - Organic Search, Direct, Referral, Social 등
- [ ] **유입 소스/매체** - google/organic, naver/referral 등
- [ ] **랜딩 페이지** - 첫 진입 페이지별 세션 수
- [ ] **기기별 통계** - desktop, mobile, tablet
- [ ] **지역/도시별 통계** - 방문자 지역 분포
- [ ] **브라우저별 통계** - Chrome, Safari, Edge 등

### 2.3 누적 데이터 (개요 탭 내)
- [x] 전체 누적 통계 (총 방문자, 총 세션, 총 페이지뷰)
- [x] 일별 / 주별 / 월별 토글 뷰

### 2.4 검색어 탭 (신규)
- [ ] **유입 검색어** - Google Search Console 연동
  - 검색어별 클릭수, 노출수, CTR, 평균 순위
- [ ] **검색 유입 페이지** - 페이지별 검색 성과
- [ ] 검색어 분석 가이드

### 2.5 기간 선택 기능 개선 (신규) ⭐
- [ ] **달력 날짜 선택기** - 시작일/종료일 직접 선택
- [ ] **날짜 직접 입력** - YYYY-MM-DD 형식 입력
- [ ] **기간 프리셋 확장**
  - 7일, 30일, 90일 (기존)
  - 이번 주, 지난 주
  - 이번 달, 지난 달
  - 최근 3개월, 최근 6개월, 최근 1년
- [ ] **주간/월간 단위 필터**
  - 주간 단위로 데이터 그룹핑
  - 월간 단위로 데이터 그룹핑

### 2.6 방문분석 탭 (신규) ⭐⭐
비교 분석을 통한 성과 인사이트 제공

#### 2.6.1 비교 기간 옵션
- [ ] **지난 주 대비** - 이번 주 vs 지난 주
- [ ] **지난 달 대비** - 이번 달 vs 지난 달
- [ ] **전년 동기 대비** - 올해 vs 작년 같은 기간
- [ ] **사용자 지정 비교** - 임의의 두 기간 비교

#### 2.6.2 비교 지표
| 지표 | 설명 | 표시 형식 |
|------|------|----------|
| 방문자 수 | 기간별 총 방문자 | 숫자 + 증감률 |
| 세션 수 | 기간별 총 세션 | 숫자 + 증감률 |
| 페이지뷰 | 기간별 총 페이지뷰 | 숫자 + 증감률 |
| 평균 체류시간 | 기간별 평균 | 시간 + 증감률 |
| 이탈률 | 기간별 이탈률 | % + 증감 |
| 신규 방문자 비율 | 신규 vs 재방문 | % + 증감 |

#### 2.6.3 시각화 컴포넌트
- [ ] **비교 카드** - 이전 기간 대비 증감 표시 (▲▼)
- [ ] **트렌드 비교 차트** - 두 기간 라인 차트 오버레이
- [ ] **채널별 비교 테이블** - 채널별 증감 분석
- [ ] **요일별 패턴 비교** - 요일별 트래픽 패턴 차이
- [ ] **시간대별 비교** - 피크 시간대 변화 분석

#### 2.6.4 인사이트 자동 생성
- [ ] 가장 큰 성장 채널 하이라이트
- [ ] 급감한 지표 경고 표시
- [ ] 주요 변화 요약 텍스트

---

## 3. 기술 구현 가이드

### 3.1 필요 패키지
```bash
pnpm add @google-analytics/data
```

### 3.2 GA4 설정
- **Property ID**: 517032710
- **Measurement ID**: G-7NC4PTL4D2
- **서비스 계정**: choho2025@choho2025.iam.gserviceaccount.com

### 3.3 환경변수 (.env.local)
```env
GA4_PROPERTY_ID=517032710
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account","project_id":"choho2025",...}
```

---

## 4. 파일 구조

```
src/
├── app/
│   ├── api/
│   │   └── analytics/
│   │       ├── route.ts          # API 엔드포인트
│   │       └── stats/
│   │           └── route.ts      # 누적 통계 API
│   └── admin/
│       └── analytics/
│           └── page.tsx          # 방문통계 페이지
└── lib/
    └── analytics.ts              # GA4 API 래퍼 함수들
```

---

## 5. API 엔드포인트

### 5.1 GET /api/analytics
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| days | number | 조회 기간 (기본: 30) |
| type | string | 조회 타입 |

**type 옵션:**
- `all` - 모든 데이터 (기본)
- `summary` - 요약 통계만
- `daily` - 일별 데이터만
- `pages` - 인기 페이지만
- `sources` - 트래픽 소스만
- `source-medium` - 소스/매체 데이터
- `channels` - 채널 그룹
- `landing` - 랜딩 페이지
- `devices` - 기기별
- `cities` - 도시별
- `browsers` - 브라우저별
- `traffic` - 유입 분석 데이터 전체
- `realtime` - 실시간 사용자만

### 5.2 응답 스키마
```typescript
interface AnalyticsResponse {
  summary: AnalyticsSummary | null;
  daily: DailyData[];
  pages: PageData[];
  sources: TrafficSource[];
  realtimeUsers: number;
  sourceMedium: SourceMedium[];
  channels: ChannelGroup[];
  landingPages: LandingPage[];
  devices: DeviceData[];
  cities: CityData[];
  browsers: BrowserData[];
}
```

---

## 6. 타입 정의

```typescript
interface SourceMedium {
  source: string;      // 예: google, naver, (direct)
  medium: string;      // 예: organic, referral, (none)
  users: number;
  sessions: number;
  bounceRate: number;  // 퍼센트
}

interface ChannelGroup {
  channel: string;     // 예: Organic Search, Direct, Referral
  users: number;
  sessions: number;
  pageViews: number;
}

interface LandingPage {
  page: string;        // 예: /, /rooms, /booking
  sessions: number;
  users: number;
  bounceRate: number;
}

interface DeviceData {
  device: string;      // desktop, mobile, tablet
  users: number;
  sessions: number;
  pageViews: number;
}

interface CityData {
  city: string;        // 예: Seoul, Busan, (not set)
  users: number;
  sessions: number;
}

interface BrowserData {
  browser: string;     // 예: Chrome, Safari, Edge
  users: number;
  sessions: number;
}
```

---

## 7. UI/UX 설계

### 7.1 탭 구성
1. **개요** - 기본 통계, 트래픽 소스, 누적 데이터 (일별/주별/월별)
2. **유입 분석** - 채널, 소스/매체, 랜딩페이지, 기기, 지역, 브라우저
3. **검색어** - Search Console 기반 유입 검색어 분석
4. **방문분석** - 지난 주/지난 달 대비 성과 비교

### 7.2 기간 선택 UI
```
┌─────────────────────────────────────────────────────────────┐
│  [7일] [30일] [90일] [이번주] [지난달] │ 📅 시작일 ~ 종료일 │
└─────────────────────────────────────────────────────────────┘
```
- 프리셋 버튼: 빠른 기간 선택
- 달력 아이콘: 클릭 시 날짜 선택 팝업
- 날짜 입력 필드: 직접 입력 가능

### 7.3 방문분석 탭 UI 구성
```
┌─────────────────────────────────────────────────────────────┐
│ 비교 기간: [지난 주 대비 ▼]                                    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ 방문자    │  │ 세션     │  │ 페이지뷰  │  │ 체류시간  │    │
│  │ 1,234    │  │ 1,567    │  │ 4,521    │  │ 2:34     │    │
│  │ ▲ 12.5%  │  │ ▲ 8.3%  │  │ ▼ 2.1%  │  │ ▲ 15.2% │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
├─────────────────────────────────────────────────────────────┤
│ [트렌드 비교 차트 - 이번 기간 vs 이전 기간 라인 오버레이]       │
├─────────────────────────────────────────────────────────────┤
│ 채널별 변화                                                   │
│ ├─ 자연 검색: 523 → 612 (▲ 17.0%)                           │
│ ├─ 직접 방문: 234 → 198 (▼ 15.4%)                           │
│ └─ 외부 링크: 89 → 102 (▲ 14.6%)                            │
└─────────────────────────────────────────────────────────────┘
```

### 7.2 채널 색상 코드
```typescript
const channelColors = {
  'Organic Search': 'bg-green-500',
  'Direct': 'bg-blue-500',
  'Referral': 'bg-purple-500',
  'Organic Social': 'bg-pink-500',
  'Paid Search': 'bg-orange-500',
  'Display': 'bg-yellow-500',
  'Email': 'bg-teal-500',
  'Affiliates': 'bg-indigo-500',
};
```

### 7.3 채널 한글명
```typescript
const channelKorean = {
  'Organic Search': '자연 검색',
  'Direct': '직접 방문',
  'Referral': '외부 링크',
  'Organic Social': '소셜 미디어',
  'Paid Search': '유료 검색',
  'Display': '디스플레이 광고',
  'Email': '이메일',
  'Affiliates': '제휴',
};
```

---

## 8. 구현 체크리스트

### Phase 1: 백엔드 API ✅ 완료
- [x] `@google-analytics/data` 패키지 설치
- [x] `googleapis` 패키지 설치 (Search Console용)
- [x] `src/lib/analytics.ts` 생성
  - [x] getTrafficSourceMedium() - 소스/매체 조회
  - [x] getChannelGroups() - 채널 그룹 조회
  - [x] getLandingPages() - 랜딩 페이지 조회
  - [x] getDeviceStats() - 기기별 조회
  - [x] getCityStats() - 도시별 조회
  - [x] getBrowserStats() - 브라우저별 조회
  - [x] getSearchKeywords() - Search Console 검색어
  - [x] getSearchPages() - Search Console 페이지별
- [x] `src/app/api/analytics/route.ts` 업데이트

### Phase 2: 프론트엔드 UI - 기본 ✅ 완료
- [x] `src/app/admin/analytics/page.tsx` 생성
  - [x] 탭 구성 (개요 / 유입 분석 / 검색어)
  - [x] 개요 탭 - 기본 통계, 차트, 누적 데이터
  - [x] 유입 분석 탭 - 채널, 소스/매체, 기기, 지역 등
  - [x] 검색어 탭 - Search Console 데이터

### Phase 3: 기간 선택 기능 🔄 진행 예정
- [ ] 날짜 선택 컴포넌트 추가
  - [ ] 달력(DatePicker) UI
  - [ ] 시작일/종료일 직접 입력
- [ ] 기간 프리셋 확장
  - [ ] 이번 주, 지난 주
  - [ ] 이번 달, 지난 달
  - [ ] 최근 3개월, 6개월, 1년
- [ ] 주간/월간 단위 필터
  - [ ] 데이터 그룹핑 로직

### Phase 4: 방문분석 탭 🔄 진행 예정
- [ ] 비교 기간 선택 UI
  - [ ] 지난 주 대비
  - [ ] 지난 달 대비
  - [ ] 전년 동기 대비
  - [ ] 사용자 지정 비교
- [ ] 비교 API 구현
  - [ ] `getComparisonData()` 함수 추가
  - [ ] 두 기간 데이터 동시 조회
- [ ] 비교 UI 컴포넌트
  - [ ] 비교 카드 (증감률 표시)
  - [ ] 트렌드 비교 차트
  - [ ] 채널별 변화 테이블
- [ ] 인사이트 자동 생성
  - [ ] 주요 변화 하이라이트

### Phase 5: 환경 설정 ✅ 완료
- [x] .env.local 환경변수 설정
  - [x] GA4_PROPERTY_ID
  - [x] GOOGLE_APPLICATION_CREDENTIALS_JSON
  - [x] SEARCH_CONSOLE_SITE_URL
- [ ] Vercel 환경변수 설정 (배포 시)
- [x] Search Console 서비스 계정 권한 추가

---

## 9. 참고 코드 위치

초호쉼터(admin-chohopark) 구현 코드:
- API 함수: `F:\admin-chohopark\src\lib\analytics.ts`
- API 라우트: `F:\admin-chohopark\src\app\api\analytics\route.ts`
- 페이지 UI: `F:\admin-chohopark\src\app\dashboard\analytics\page.tsx`

---

## 10. 예상 일정

| 단계 | 작업 내용 | 예상 소요 |
|------|----------|----------|
| Phase 1 | 백엔드 API 구현 | - |
| Phase 2 | 프론트엔드 UI 구현 | - |
| Phase 3 | 환경 설정 및 테스트 | - |

---

## 11. 참고 사항

### 검색어 데이터 제한
GA4에서 오가닉 검색어(사용자가 검색한 키워드)는 기본적으로 제공되지 않습니다.
- Google Ads 검색어: `sessionGoogleAdsQuery` (광고 캠페인 키워드)
- 오가닉 검색어: Google Search Console 연동 필요

### 데이터 지연
GA4 API 데이터는 실시간이 아닌 처리 후 제공됩니다.
- 일반 데이터: 24-48시간 지연 가능
- 실시간 데이터: runRealtimeReport() 사용

---

---

## 12. 알려진 이슈 및 주의사항

### 12.1 API 요청 제한 (429 에러)
- Google Analytics API는 요청 횟수 제한이 있음
- 단시간에 많은 요청 시 `429 Too Many Requests` 발생
- **해결**: 1-2분 대기 후 재시도

### 12.2 기간 필터 버그 ⚠️ 주의
**증상**: 기간(7일/30일/90일)만 변경되고 실제 데이터는 필터링되지 않는 현상

**점검 항목**:
1. API 호출 시 `days` 파라미터가 정확히 전달되는지 확인
2. `useEffect` 의존성 배열에 `days` 포함 여부 확인
3. API 응답에서 `dateRanges` 설정이 올바른지 확인
4. 캐시 문제로 이전 데이터가 표시되는지 확인

**구현 시 체크**:
```typescript
// ✅ 올바른 패턴
useEffect(() => {
  fetchAnalytics();
}, [days]); // days 변경 시 재조회

// ❌ 잘못된 패턴
useEffect(() => {
  fetchAnalytics();
}, []); // days 변경 감지 안됨
```

### 12.3 날짜 처리 주의사항
- `new Date(dateString)`은 타임존 문제 발생 가능
- 명시적으로 년/월/일 파싱 권장: `new Date(year, month - 1, day)`
- `toISOString()` 사용 시 UTC 변환 주의

### 12.4 Search Console 권한
- 서비스 계정 이메일을 Search Console에 사용자로 추가 필요
- 도메인 속성은 `sc-domain:example.com` 형식 사용
- 권한 반영에 몇 분 소요될 수 있음

---

**문서 버전**: 1.1
**작성일**: 2025-12-20
**최종 수정**: 2025-12-20
**작성자**: Claude
