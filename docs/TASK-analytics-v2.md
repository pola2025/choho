# 초호펜션 방문통계 개선 작업 요청

## 📋 작업 시작 전 필독
**PRD 문서**: `docs/PRD-visit-stats.md` 참조

---

## 🎯 이번 작업 목표

### 1. 기간 선택 기능 개선
현재 7일/30일/90일 버튼만 있음 → 확장 필요

**구현 항목:**
- [ ] 달력(DatePicker) UI 추가 - 시작일/종료일 선택
- [ ] 날짜 직접 입력 필드
- [ ] 기간 프리셋 추가:
  - 이번 주, 지난 주
  - 이번 달, 지난 달
  - 최근 3개월, 6개월, 1년
- [ ] 주간/월간 단위 데이터 그룹핑 필터

### 2. 방문분석 탭 신규 추가
지난 주/지난 달과 비교하는 성과 분석 페이지

**구현 항목:**
- [ ] 비교 기간 선택 드롭다운
  - 지난 주 대비
  - 지난 달 대비
  - 전년 동기 대비
  - 사용자 지정 비교
- [ ] 비교 카드 UI (증감률 ▲▼ 표시)
- [ ] 트렌드 비교 차트 (두 기간 오버레이)
- [ ] 채널별 변화 분석 테이블
- [ ] 인사이트 자동 생성 (주요 변화 하이라이트)

---

## ⚠️ 주의사항

### 기간 필터 버그 방지
기간만 변경되고 데이터가 필터링 안되는 버그 주의!

```typescript
// ✅ 올바른 패턴 - days 변경 시 재조회
useEffect(() => {
  fetchAnalytics();
}, [days, startDate, endDate]);

// ❌ 잘못된 패턴 - 의존성 누락
useEffect(() => {
  fetchAnalytics();
}, []);
```

### 날짜 처리
```typescript
// ✅ 안전한 날짜 파싱
const [year, month, day] = dateString.split('-').map(Number);
const date = new Date(year, month - 1, day);

// ❌ 타임존 문제 발생 가능
const date = new Date(dateString);
```

### API 요청 제한
- Google Analytics API 429 에러 발생 가능
- 과도한 요청 시 1-2분 대기 필요

---

## 📁 관련 파일

### 수정 대상
- `src/app/admin/analytics/page.tsx` - 메인 페이지
- `src/lib/analytics.ts` - GA4 API 함수
- `src/app/api/analytics/route.ts` - API 라우트

### 참고
- `docs/PRD-visit-stats.md` - 상세 PRD 문서
- `F:\polarad-meta\dashboard\src\components\naver\NaverPeriodTable.tsx` - 일별/주별/월별 UI 참고

---

## 🔧 현재 상태

### 완료된 기능
- [x] 개요 탭 - 기본 통계, 일별 차트, 누적 데이터
- [x] 유입 분석 탭 - 채널, 소스/매체, 기기, 지역, 브라우저
- [x] 검색어 탭 - Search Console 연동 (권한 설정 완료)
- [x] 누적 데이터 섹션 - 일별/주별/월별 토글

### 환경변수 (설정 완료)
```env
GA4_PROPERTY_ID=517032710
GOOGLE_APPLICATION_CREDENTIALS_JSON={서비스 계정 JSON}
SEARCH_CONSOLE_SITE_URL=sc-domain:chorigol.co.kr
```

---

## 🚀 시작하기

```bash
# 프로젝트 폴더 이동
cd F:\choho_2025

# 개발 서버 실행
pnpm dev --port 3001

# 방문통계 페이지 확인
# http://localhost:3001/admin/analytics
```

---

**작성일**: 2025-12-20
