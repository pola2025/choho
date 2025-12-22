/**
 * AI 인사이트 자동 생성 로직
 * 캠페인별 실적 데이터를 분석하여 유의미한 인사이트 생성
 */

// 기간별 통계
export interface PeriodStats {
  startDate: string;
  endDate: string;
  impressions: number;
  clicks: number;
  cost: number;
  ctr: number;
  cpc: number;
  conversions: number;
}

// 변화율
export interface ChangeRates {
  impressions: number; // 퍼센트
  clicks: number;
  cost: number;
  ctr: number; // 포인트 차이
  cpc: number;
}

// 키워드 분석
export interface KeywordAnalysis {
  keyword: string;
  thisWeekClicks: number;
  lastWeekClicks: number;
  changeRate: number;
  impressions: number;
  ctr: number;
  trend: 'up' | 'down' | 'stable';
}

// 리포트 데이터
export interface AIReportData {
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
}

// 인사이트 타입
export type InsightType = 'positive' | 'negative' | 'neutral' | 'warning';

export interface Insight {
  type: InsightType;
  message: string;
  metric?: string;
  value?: number;
}

/**
 * 변화율 계산
 */
export function calculateChangeRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * 포인트 차이 계산 (CTR 등 퍼센트 값용)
 */
export function calculatePointDiff(current: number, previous: number): number {
  return current - previous;
}

/**
 * 주간 인사이트 생성
 */
export function generateWeeklyInsights(data: AIReportData): Insight[] {
  const insights: Insight[] = [];
  const { weeklyComparison, keywords } = data;
  const { changes } = weeklyComparison;

  // 1. 노출 변화 분석
  if (changes.impressions > 15) {
    insights.push({
      type: 'positive',
      message: `노출수가 ${changes.impressions.toFixed(1)}% 크게 증가했습니다. 광고 도달 범위가 확대되고 있습니다.`,
      metric: 'impressions',
      value: changes.impressions,
    });
  } else if (changes.impressions > 5) {
    insights.push({
      type: 'positive',
      message: `노출수가 ${changes.impressions.toFixed(1)}% 증가했습니다.`,
      metric: 'impressions',
      value: changes.impressions,
    });
  } else if (changes.impressions < -15) {
    insights.push({
      type: 'warning',
      message: `노출수가 ${Math.abs(changes.impressions).toFixed(1)}% 크게 감소했습니다. 예산이나 입찰가 검토가 필요합니다.`,
      metric: 'impressions',
      value: changes.impressions,
    });
  } else if (changes.impressions < -5) {
    insights.push({
      type: 'negative',
      message: `노출수가 ${Math.abs(changes.impressions).toFixed(1)}% 감소했습니다.`,
      metric: 'impressions',
      value: changes.impressions,
    });
  }

  // 2. 클릭 변화 분석
  if (changes.clicks > 20) {
    insights.push({
      type: 'positive',
      message: `클릭수가 ${changes.clicks.toFixed(1)}% 급증했습니다! 광고 효과가 크게 개선되었습니다.`,
      metric: 'clicks',
      value: changes.clicks,
    });
  } else if (changes.clicks > 10) {
    insights.push({
      type: 'positive',
      message: `클릭수가 ${changes.clicks.toFixed(1)}% 증가했습니다.`,
      metric: 'clicks',
      value: changes.clicks,
    });
  } else if (changes.clicks < -20) {
    insights.push({
      type: 'warning',
      message: `클릭수가 ${Math.abs(changes.clicks).toFixed(1)}% 급감했습니다. 광고 문구나 키워드 검토가 필요합니다.`,
      metric: 'clicks',
      value: changes.clicks,
    });
  } else if (changes.clicks < -10) {
    insights.push({
      type: 'negative',
      message: `클릭수가 ${Math.abs(changes.clicks).toFixed(1)}% 감소했습니다.`,
      metric: 'clicks',
      value: changes.clicks,
    });
  }

  // 3. CTR 분석
  if (changes.ctr > 0.5) {
    insights.push({
      type: 'positive',
      message: `CTR이 ${changes.ctr.toFixed(2)}%p 개선되어 광고 효율이 높아졌습니다.`,
      metric: 'ctr',
      value: changes.ctr,
    });
  } else if (changes.ctr < -0.5) {
    insights.push({
      type: 'warning',
      message: `CTR이 ${Math.abs(changes.ctr).toFixed(2)}%p 하락했습니다. 광고 문구 개선을 권장합니다.`,
      metric: 'ctr',
      value: changes.ctr,
    });
  }

  // 4. CPC 분석 (낮을수록 좋음)
  if (changes.cpc < -15) {
    insights.push({
      type: 'positive',
      message: `CPC가 ${Math.abs(changes.cpc).toFixed(1)}% 감소하여 비용 효율이 크게 개선되었습니다.`,
      metric: 'cpc',
      value: changes.cpc,
    });
  } else if (changes.cpc < -5) {
    insights.push({
      type: 'positive',
      message: `CPC가 ${Math.abs(changes.cpc).toFixed(1)}% 감소하여 비용 효율이 개선되었습니다.`,
      metric: 'cpc',
      value: changes.cpc,
    });
  } else if (changes.cpc > 20) {
    insights.push({
      type: 'warning',
      message: `CPC가 ${changes.cpc.toFixed(1)}% 급등했습니다. 입찰가 전략 재검토가 필요합니다.`,
      metric: 'cpc',
      value: changes.cpc,
    });
  } else if (changes.cpc > 10) {
    insights.push({
      type: 'negative',
      message: `CPC가 ${changes.cpc.toFixed(1)}% 상승했습니다. 입찰가 조정을 검토해보세요.`,
      metric: 'cpc',
      value: changes.cpc,
    });
  }

  // 5. 키워드 급등 분석
  const topGainer = keywords
    .filter((k) => k.changeRate > 0 && k.thisWeekClicks >= 5)
    .sort((a, b) => b.changeRate - a.changeRate)[0];

  if (topGainer && topGainer.changeRate > 50) {
    insights.push({
      type: 'positive',
      message: `"${topGainer.keyword}" 키워드 클릭이 ${topGainer.changeRate.toFixed(0)}% 급증했습니다.`,
      metric: 'keyword_gain',
      value: topGainer.changeRate,
    });
  } else if (topGainer && topGainer.changeRate > 20) {
    insights.push({
      type: 'positive',
      message: `"${topGainer.keyword}" 키워드 성과가 좋습니다 (+${topGainer.changeRate.toFixed(0)}%).`,
      metric: 'keyword_gain',
      value: topGainer.changeRate,
    });
  }

  // 6. 키워드 급락 분석
  const topLoser = keywords
    .filter((k) => k.changeRate < 0 && k.lastWeekClicks >= 5)
    .sort((a, b) => a.changeRate - b.changeRate)[0];

  if (topLoser && topLoser.changeRate < -50) {
    insights.push({
      type: 'warning',
      message: `"${topLoser.keyword}" 키워드 성과가 급락했습니다 (${topLoser.changeRate.toFixed(0)}%). 키워드 검토가 필요합니다.`,
      metric: 'keyword_loss',
      value: topLoser.changeRate,
    });
  } else if (topLoser && topLoser.changeRate < -30) {
    insights.push({
      type: 'negative',
      message: `"${topLoser.keyword}" 키워드 성과가 하락 중입니다 (${topLoser.changeRate.toFixed(0)}%).`,
      metric: 'keyword_loss',
      value: topLoser.changeRate,
    });
  }

  // 7. 광고비 효율 종합 분석
  if (changes.clicks > 10 && changes.cost < 5) {
    insights.push({
      type: 'positive',
      message: '클릭은 증가하면서 광고비 증가폭은 작아 효율적인 운영 중입니다.',
      metric: 'efficiency',
    });
  } else if (changes.clicks < -10 && changes.cost > 5) {
    insights.push({
      type: 'warning',
      message: '광고비는 늘었지만 클릭이 줄었습니다. 효율 개선이 필요합니다.',
      metric: 'efficiency',
    });
  }

  // 최대 5개 인사이트만 반환 (중요도 순)
  return insights.slice(0, 5);
}

/**
 * 월간 인사이트 생성
 */
export function generateMonthlyInsights(data: AIReportData): Insight[] {
  const insights: Insight[] = [];
  const { monthlyComparison, keywords } = data;
  const { changes, thisMonth, lastMonth } = monthlyComparison;

  // 1. 월간 트렌드 분석
  if (changes.impressions > 20 && changes.clicks > 20) {
    insights.push({
      type: 'positive',
      message: '이번 달 전체적인 광고 성과가 크게 개선되었습니다.',
      metric: 'overall',
    });
  } else if (changes.impressions < -20 && changes.clicks < -20) {
    insights.push({
      type: 'warning',
      message: '이번 달 광고 성과가 전반적으로 하락했습니다. 전략 재검토가 필요합니다.',
      metric: 'overall',
    });
  }

  // 2. 비용 효율 분석
  const thisMonthCpc = thisMonth.clicks > 0 ? thisMonth.cost / thisMonth.clicks : 0;
  const lastMonthCpc = lastMonth.clicks > 0 ? lastMonth.cost / lastMonth.clicks : 0;
  const cpcChange = calculateChangeRate(thisMonthCpc, lastMonthCpc);

  if (cpcChange < -10) {
    insights.push({
      type: 'positive',
      message: `평균 CPC가 ${Math.abs(cpcChange).toFixed(1)}% 개선되어 광고 효율이 높아졌습니다.`,
      metric: 'cpc',
      value: cpcChange,
    });
  } else if (cpcChange > 15) {
    insights.push({
      type: 'warning',
      message: `평균 CPC가 ${cpcChange.toFixed(1)}% 상승했습니다. 입찰 전략 조정을 권장합니다.`,
      metric: 'cpc',
      value: cpcChange,
    });
  }

  // 3. 시즌 영향 분석 (12월~2월: 겨울 시즌)
  const thisMonthNum = parseInt(thisMonth.startDate.slice(5, 7));
  if ([12, 1, 2].includes(thisMonthNum)) {
    if (changes.clicks > 15) {
      insights.push({
        type: 'positive',
        message: '겨울 시즌 효과로 클릭이 증가하고 있습니다.',
        metric: 'season',
      });
    } else if (changes.clicks < -15) {
      insights.push({
        type: 'neutral',
        message: '겨울 시즌임에도 클릭이 감소했습니다. 시즌 키워드 추가를 검토해보세요.',
        metric: 'season',
      });
    }
  }

  // 4. 키워드 포트폴리오 분석
  const activeKeywords = keywords.filter((k) => k.thisWeekClicks > 0).length;
  const totalKeywords = keywords.length;
  const keywordUtilization = totalKeywords > 0 ? (activeKeywords / totalKeywords) * 100 : 0;

  if (keywordUtilization < 50) {
    insights.push({
      type: 'warning',
      message: `등록된 키워드 중 ${keywordUtilization.toFixed(0)}%만 클릭이 발생했습니다. 비효율 키워드 정리를 권장합니다.`,
      metric: 'keywords',
      value: keywordUtilization,
    });
  } else if (keywordUtilization > 80) {
    insights.push({
      type: 'positive',
      message: `등록된 키워드 ${keywordUtilization.toFixed(0)}%가 활발히 성과를 내고 있습니다.`,
      metric: 'keywords',
      value: keywordUtilization,
    });
  }

  // 5. 예산 소진율 분석
  if (changes.cost > 30 && changes.clicks < 10) {
    insights.push({
      type: 'warning',
      message: '광고비 증가 대비 클릭 증가폭이 적습니다. 예산 효율성 검토가 필요합니다.',
      metric: 'budget',
    });
  }

  return insights.slice(0, 5);
}

/**
 * 키워드 트렌드 결정
 */
export function determineKeywordTrend(changeRate: number): 'up' | 'down' | 'stable' {
  if (changeRate > 10) return 'up';
  if (changeRate < -10) return 'down';
  return 'stable';
}

/**
 * 키워드 분석 생성
 */
export function analyzeKeywords(
  thisWeekKeywords: Array<{ keyword: string; clicks: number; impressions: number; ctr: number }>,
  lastWeekKeywords: Array<{ keyword: string; clicks: number; impressions: number; ctr: number }>
): KeywordAnalysis[] {
  const lastWeekMap = new Map(lastWeekKeywords.map((k) => [k.keyword, k]));

  return thisWeekKeywords.map((kw) => {
    const lastWeek = lastWeekMap.get(kw.keyword);
    const lastWeekClicks = lastWeek?.clicks || 0;
    const changeRate = calculateChangeRate(kw.clicks, lastWeekClicks);

    return {
      keyword: kw.keyword,
      thisWeekClicks: kw.clicks,
      lastWeekClicks,
      changeRate,
      impressions: kw.impressions,
      ctr: kw.ctr,
      trend: determineKeywordTrend(changeRate),
    };
  });
}

/**
 * 성과 급상승 키워드 필터링
 */
export function getTopGainers(keywords: KeywordAnalysis[], limit: number = 5): KeywordAnalysis[] {
  return keywords
    .filter((k) => k.changeRate > 20 && k.thisWeekClicks >= 3)
    .sort((a, b) => b.changeRate - a.changeRate)
    .slice(0, limit);
}

/**
 * 주의 필요 키워드 필터링
 */
export function getTopLosers(keywords: KeywordAnalysis[], limit: number = 5): KeywordAnalysis[] {
  return keywords
    .filter((k) => k.changeRate < -20 && k.lastWeekClicks >= 3)
    .sort((a, b) => a.changeRate - b.changeRate)
    .slice(0, limit);
}
