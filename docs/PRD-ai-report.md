# PRD: AI 검색분석 리포트 기능

**문서 버전**: 1.0
**작성일**: 2024-12-22
**상태**: 기획 완료, 구현 대기

---

## 1. 개요

### 1.1 목적
캠페인별 실적 데이터를 기반으로 주간/월간 리포팅 기능을 제공하여 유의미한 변화와 추이를 분석할 수 있도록 한다.

### 1.2 핵심 원칙
- **자기 비교**: 두 캠페인 간 비교가 아닌, 각 캠페인의 과거 vs 현재 비교
- **시간 기반**: 지난주 vs 이번주, 지난달 vs 이번달
- **키워드 중심**: 각 캠페인별 키워드의 클릭/노출량 분석

---

## 2. 캠페인 그룹 구조

### 2.1 플레이스 광고
| 구분 | 캠페인명 | 대상 고객 | 설명 |
|------|----------|----------|------|
| 개인 | 초호펜션 | 개인/가족 | 펜션 예약 광고 |
| 단체 | 초호쉼터 | 단체/기업 | 단체 예약 광고 |

### 2.2 파워컨텐츠 광고
| 구분 | 캠페인명 | 대상 | 설명 |
|------|----------|------|------|
| 단체 | 파워컨텐츠 | 전체 | 네이버 블로그/컨텐츠 광고 |

### 2.3 비교 구조
```
초호펜션
├── 지난주 vs 이번주
└── 지난달 vs 이번달

초호쉼터
├── 지난주 vs 이번주
└── 지난달 vs 이번달

파워컨텐츠
├── 지난주 vs 이번주
└── 지난달 vs 이번달
```

---

## 3. 페이지 구조

### 3.1 URL
```
/admin/ai-report
```

### 3.2 사이드메뉴 위치
```
- 대시보드
- 방문통계
- 네이버 광고
- 키워드 효율분석
- ✨ AI 검색분석  ← 신규
- 이미지 관리
- 카페 메뉴
- 팝업 아카이브
- 설정
```

### 3.3 탭 구성
```
[플레이스-개인] [플레이스-단체] [파워컨텐츠]
   초호펜션        초호쉼터       블로그
```

---

## 4. 주간 리포트

### 4.1 비교 카드
| 지표 | 설명 | 변화율 표시 |
|------|------|------------|
| 노출수 | 이번주 총 노출 | ↑/↓ 퍼센트 |
| 클릭수 | 이번주 총 클릭 | ↑/↓ 퍼센트 |
| 광고비 | 이번주 총 비용 | ↑/↓ 퍼센트 |
| CTR | 클릭률 | ↑/↓ 포인트 |
| CPC | 클릭당 비용 | ↑/↓ 퍼센트 |

### 4.2 AI 인사이트
- 주요 변화 자동 감지 및 텍스트 생성
- 키워드 성과 급등/급락 알림
- 요일별 패턴 분석

### 4.3 키워드 TOP 5
| 항목 | 설명 |
|------|------|
| 키워드명 | 등록된 키워드 |
| 이번주 클릭 | 이번주 클릭수 |
| 지난주 클릭 | 지난주 클릭수 |
| 변화율 | 증감 퍼센트 |
| 노출수 | 이번주 노출 |
| CTR | 클릭률 |

---

## 5. 월간 리포트

### 5.1 비교 카드
- 이번달(진행중) vs 지난달(완료) 비교
- 동일 지표 (노출, 클릭, 비용, CTR, CPC)

### 5.2 월간 추이 그래프
- 일별 클릭/노출 추이 라인 차트
- 지난달 vs 이번달 오버레이

### 5.3 핵심 분석
- 월간 트렌드 분석
- 시즌 영향 분석
- 키워드 포트폴리오 변화

---

## 6. 키워드 상세 분석

### 6.1 성과 변화 분류
```
🔥 성과 급상승 키워드
- 클릭 +20% 이상 키워드 목록
- 원인 분석 (시즌, 트렌드 등)

⚠️ 주의 필요 키워드
- 클릭 -20% 이상 하락 키워드
- 개선 권장 사항
```

### 6.2 키워드 테이블
| 컬럼 | 설명 |
|------|------|
| 키워드 | 검색 키워드 |
| 이번주/이번달 클릭 | 현재 기간 클릭 |
| 지난주/지난달 클릭 | 이전 기간 클릭 |
| 변화율 | 증감 퍼센트 |
| 노출수 | 현재 기간 노출 |
| CTR | 클릭률 |
| 트렌드 | ↑/↓/→ 아이콘 |

---

## 7. 데이터 구조

### 7.1 타입 정의
```typescript
// 캠페인 그룹 타입
type CampaignGroup = 'place-personal' | 'place-group' | 'power-content';

// 캠페인 그룹 매핑 (캠페인 ID → 그룹)
const CAMPAIGN_GROUP_MAP: Record<string, CampaignGroup> = {
  // 실제 캠페인 ID로 매핑 필요
  'campaign_id_1': 'place-personal',  // 초호펜션
  'campaign_id_2': 'place-group',     // 초호쉼터
  'campaign_id_3': 'power-content',   // 파워컨텐츠
};

// 리포트 데이터 구조
interface AIReportData {
  group: CampaignGroup;
  campaignId: string;
  campaignName: string;

  weeklyComparison: {
    thisWeek: PeriodStats;
    lastWeek: PeriodStats;
    changes: ChangeRates;
  };

  monthlyComparison: {
    thisMonth: PeriodStats;
    lastMonth: PeriodStats;
    changes: ChangeRates;
  };

  keywords: KeywordAnalysis[];
  insights: string[];
}

interface PeriodStats {
  startDate: string;
  endDate: string;
  impressions: number;
  clicks: number;
  cost: number;
  ctr: number;
  cpc: number;
  conversions: number;
}

interface ChangeRates {
  impressions: number;  // 퍼센트
  clicks: number;
  cost: number;
  ctr: number;          // 포인트 차이
  cpc: number;
}

interface KeywordAnalysis {
  keyword: string;
  thisWeekClicks: number;
  lastWeekClicks: number;
  changeRate: number;
  impressions: number;
  ctr: number;
  trend: 'up' | 'down' | 'stable';
}
```

---

## 8. API 설계

### 8.1 리포트 조회
```
GET /api/analytics?type=ai-report&group=place-personal
GET /api/analytics?type=ai-report&group=place-group
GET /api/analytics?type=ai-report&group=power-content
```

### 8.2 응답 구조
```json
{
  "report": {
    "group": "place-personal",
    "campaignName": "초호펜션",
    "weeklyComparison": { ... },
    "monthlyComparison": { ... },
    "keywords": [ ... ],
    "insights": [ ... ]
  }
}
```

---

## 9. AI 인사이트 생성 로직

### 9.1 자동 생성 규칙
```typescript
function generateInsights(data: AIReportData): string[] {
  const insights: string[] = [];
  const { weeklyComparison, keywords } = data;

  // 1. 노출 변화
  if (weeklyComparison.changes.impressions > 10) {
    insights.push(`노출수가 ${weeklyComparison.changes.impressions.toFixed(1)}% 증가했습니다.`);
  } else if (weeklyComparison.changes.impressions < -10) {
    insights.push(`노출수가 ${Math.abs(weeklyComparison.changes.impressions).toFixed(1)}% 감소했습니다.`);
  }

  // 2. 클릭 변화
  if (weeklyComparison.changes.clicks > 15) {
    insights.push(`클릭수가 크게 증가했습니다 (+${weeklyComparison.changes.clicks.toFixed(1)}%).`);
  }

  // 3. 키워드 급등
  const topGainer = keywords
    .filter(k => k.changeRate > 0)
    .sort((a, b) => b.changeRate - a.changeRate)[0];
  if (topGainer && topGainer.changeRate > 30) {
    insights.push(`"${topGainer.keyword}" 키워드 클릭이 ${topGainer.changeRate.toFixed(0)}% 급증했습니다.`);
  }

  // 4. 키워드 급락
  const topLoser = keywords
    .filter(k => k.changeRate < 0)
    .sort((a, b) => a.changeRate - b.changeRate)[0];
  if (topLoser && topLoser.changeRate < -30) {
    insights.push(`"${topLoser.keyword}" 키워드 성과가 하락 중입니다 (${topLoser.changeRate.toFixed(0)}%).`);
  }

  // 5. CTR 분석
  if (weeklyComparison.changes.ctr < -0.5) {
    insights.push(`CTR이 하락 중입니다. 광고 문구 개선을 권장합니다.`);
  } else if (weeklyComparison.changes.ctr > 0.5) {
    insights.push(`CTR이 개선되어 광고 효율이 높아졌습니다.`);
  }

  // 6. 비용 효율
  if (weeklyComparison.changes.cpc < -10) {
    insights.push(`CPC가 ${Math.abs(weeklyComparison.changes.cpc).toFixed(1)}% 감소하여 비용 효율이 개선되었습니다.`);
  } else if (weeklyComparison.changes.cpc > 10) {
    insights.push(`CPC가 상승 중입니다. 입찰가 조정을 검토해보세요.`);
  }

  return insights.slice(0, 5); // 최대 5개
}
```

---

## 10. UI 와이어프레임

### 10.1 주간 리포트 카드
```
┌─────────────────────────────────────────────────────────┐
│  📅 주간 리포트 - 초호펜션                              │
├─────────────────────────────────────────────────────────┤
│  이번주 (12/16 ~ 12/22)  vs  지난주 (12/9 ~ 12/15)     │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ 노출수   │  │ 클릭수   │  │ 광고비   │  │  CTR    │ │
│  │ 12,450   │  │   234    │  │ 45,200원 │  │ 1.88%  │ │
│  │ ↑ +15.2% │  │ ↑ +8.3%  │  │ ↑ +5.1%  │  │ ↓ -0.2%│ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
│                                                         │
│  💡 AI 인사이트                                         │
│  • 노출수가 15.2% 증가했으나 CTR은 소폭 하락           │
│  • "파주 펜션" 키워드 클릭 급증 (+45%)                 │
│  • 주말 트래픽이 평일 대비 2.3배 높음                  │
└─────────────────────────────────────────────────────────┘
```

### 10.2 키워드 성과 분류
```
┌─────────────────────────────────────────────────────────┐
│  🔥 성과 급상승 키워드                                  │
│  • 겨울 펜션        클릭 +120%  │  노출 +85%           │
│  • 파주 빙벽        클릭 +95%   │  노출 +150%          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  ⚠️ 주의 필요 키워드                                    │
│  • 가을 펜션        클릭 -45%   │  시즌 종료 영향      │
│  • 단풍 여행        클릭 -62%   │  시즌 종료 영향      │
└─────────────────────────────────────────────────────────┘
```

---

## 11. 구현 계획

### 11.1 우선순위
| 단계 | 작업 | 예상 작업량 |
|------|------|------------|
| 1 | 캠페인 그룹 매핑 설정 | 캠페인 ID 확인 후 매핑 |
| 2 | API 확장 (주간/월간 비교) | analytics route 확장 |
| 3 | 사이드메뉴 추가 | layout.tsx 수정 |
| 4 | 리포트 페이지 UI | 새 페이지 생성 |
| 5 | 키워드 분석 로직 | 캠페인별 키워드 필터링 |
| 6 | AI 인사이트 생성 | 자동 분석 텍스트 |

### 11.2 파일 구조
```
src/
├── app/admin/ai-report/
│   └── page.tsx              # AI 리포트 페이지
├── lib/
│   ├── campaign-groups.ts    # 캠페인 그룹 매핑
│   └── ai-insights.ts        # 인사이트 생성 로직
└── app/api/analytics/
    └── route.ts              # API 확장 (type=ai-report)
```

---

## 12. 참고 사항

### 12.1 기존 데이터 소스
- 네이버 광고 API: `src/lib/naver-searchad.ts`
- Airtable 캐시: `src/lib/analytics-airtable.ts`
- 기존 대시보드: `src/app/admin/naver-ads/page.tsx`

### 12.2 주의 사항
- 캠페인 ID는 네이버 광고 계정에서 확인 필요
- API 호출 제한 고려 (Rate Limit)
- 데이터 캐싱 전략 필요

---

## 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|----------|
| 2024-12-22 | 1.0 | 초안 작성 |
