import { NextResponse } from 'next/server';
import {
  getAnalyticsSummary,
  getDailyAnalytics,
  getTopPages,
  getTrafficSources,
  getRealtimeUsers,
  getTrafficSourceMedium,
  getChannelGroups,
  getLandingPages,
  getDeviceStats,
  getCityStats,
  getBrowserStats,
  getCountryStats,
  getOSStats,
  getUserTypeStats,
  getHourlyStats,
  getDayOfWeekStats,
  getReferrerStats,
  getSearchKeywords,
  getSearchPages,
  getComparisonData,
} from '@/lib/analytics';
import {
  getLatestSummary,
  getLatestPages,
  getLatestSources,
  getLatestDevices,
  getLatestKeywords,
  saveNaverKeywords,
  getNaverKeywordsByMonth,
  getNaverKeywordsTrend,
  getNaverKeywordsRange,
} from '@/lib/analytics-airtable';
import {
  getAllKeywordStats,
  testConnection as testNaverConnection,
  getAdSummary,
  getDailyStats,
  getMultipleDaysStats,
  getCampaigns,
  getCampaignsWithStats,
  getMonthComparison,
  getKeywordSearchVolume,
  getRegisteredKeywordsSearchVolume,
  getBizmoney,
  type DailyStatRecord,
} from '@/lib/naver-searchad';
import {
  saveNaverAdDaily,
  getNaverAdDaily,
  getMissingNaverAdDates,
  saveNaverAdCampaigns,
  getNaverAdCampaigns,
  type NaverAdDailyRecord,
} from '@/lib/analytics-airtable';

// Airtable 데이터 유효성 확인 (데이터가 있고 최근 데이터인지)
function isValidAirtableData(data: unknown[]): boolean {
  return Array.isArray(data) && data.length > 0;
}

// Summary 데이터 변환 (Airtable -> API 응답 형식)
interface SummaryTotals {
  totalUsers: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
}

function transformSummaryFromAirtable(records: Record<string, unknown>[]) {
  if (records.length === 0) return null;

  // 날짜별로 그룹화하고 각 날짜의 최신 레코드(가장 큰 값)만 사용
  // Airtable에 시간별 누적 스냅샷이 저장되어 있으므로, 같은 날짜의 최신 데이터만 사용
  const dateMap = new Map<string, Record<string, unknown>>();

  for (const r of records) {
    const date = String(r.date || '');
    const existing = dateMap.get(date);

    if (!existing) {
      dateMap.set(date, r);
    } else {
      // 같은 날짜에 여러 레코드가 있으면 syncedAt이 더 최신인 것 사용
      const existingSyncedAt = String(existing.syncedAt || '');
      const currentSyncedAt = String(r.syncedAt || '');
      if (currentSyncedAt > existingSyncedAt) {
        dateMap.set(date, r);
      }
    }
  }

  // 날짜별 최신 레코드들의 합계 계산
  const dailyRecords = Array.from(dateMap.values());
  const totals = dailyRecords.reduce<SummaryTotals>(
    (acc, r) => ({
      totalUsers: acc.totalUsers + (Number(r.totalUsers) || 0),
      newUsers: acc.newUsers + (Number(r.newUsers) || 0),
      sessions: acc.sessions + (Number(r.sessions) || 0),
      pageViews: acc.pageViews + (Number(r.pageViews) || 0),
      avgSessionDuration: acc.avgSessionDuration + (Number(r.avgSessionDuration) || 0),
      bounceRate: acc.bounceRate + (Number(r.bounceRate) || 0),
    }),
    { totalUsers: 0, newUsers: 0, sessions: 0, pageViews: 0, avgSessionDuration: 0, bounceRate: 0 }
  );

  // 평균값 계산
  const count = dailyRecords.length;
  return {
    totalUsers: totals.totalUsers,
    newUsers: totals.newUsers,
    sessions: totals.sessions,
    pageViews: totals.pageViews,
    avgSessionDuration: count > 0 ? totals.avgSessionDuration / count : 0,
    bounceRate: count > 0 ? totals.bounceRate / count : 0,
  };
}

// Pages 데이터 변환
function transformPagesFromAirtable(records: Record<string, unknown>[], limit: number = 10) {
  // path별로 집계
  const pageMap = new Map<string, { path: string; title: string; views: number }>();

  for (const r of records) {
    const path = String(r.path || '');
    const existing = pageMap.get(path);
    if (existing) {
      existing.views += Number(r.views) || 0;
    } else {
      pageMap.set(path, {
        path,
        title: String(r.title || ''),
        views: Number(r.views) || 0,
      });
    }
  }

  return Array.from(pageMap.values())
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

// Sources 데이터 변환
function transformSourcesFromAirtable(records: Record<string, unknown>[]) {
  // source별로 집계
  const sourceMap = new Map<string, { source: string; users: number; sessions: number }>();

  for (const r of records) {
    const source = String(r.source || 'direct');
    const existing = sourceMap.get(source);
    if (existing) {
      existing.users += Number(r.users) || 0;
      existing.sessions += Number(r.sessions) || 0;
    } else {
      sourceMap.set(source, {
        source,
        users: Number(r.users) || 0,
        sessions: Number(r.sessions) || 0,
      });
    }
  }

  return Array.from(sourceMap.values()).sort((a, b) => b.users - a.users);
}

// Devices 데이터 변환
function transformDevicesFromAirtable(records: Record<string, unknown>[]) {
  // device별로 집계
  const deviceMap = new Map<string, { device: string; users: number; sessions: number; pageViews: number }>();

  for (const r of records) {
    const device = String(r.device || 'unknown');
    const existing = deviceMap.get(device);
    if (existing) {
      existing.users += Number(r.users) || 0;
      existing.sessions += Number(r.sessions) || 0;
      existing.pageViews += Number(r.pageViews) || 0;
    } else {
      deviceMap.set(device, {
        device,
        users: Number(r.users) || 0,
        sessions: Number(r.sessions) || 0,
        pageViews: Number(r.pageViews) || 0,
      });
    }
  }

  return Array.from(deviceMap.values()).sort((a, b) => b.users - a.users);
}

// Keywords 데이터 변환
function transformKeywordsFromAirtable(records: Record<string, unknown>[]) {
  // query별로 집계
  const keywordMap = new Map<string, { query: string; clicks: number; impressions: number; ctr: number; position: number; count: number }>();

  for (const r of records) {
    const query = String(r.query || '');
    const existing = keywordMap.get(query);
    if (existing) {
      existing.clicks += Number(r.clicks) || 0;
      existing.impressions += Number(r.impressions) || 0;
      existing.ctr += Number(r.ctr) || 0;
      existing.position += Number(r.position) || 0;
      existing.count += 1;
    } else {
      keywordMap.set(query, {
        query,
        clicks: Number(r.clicks) || 0,
        impressions: Number(r.impressions) || 0,
        ctr: Number(r.ctr) || 0,
        position: Number(r.position) || 0,
        count: 1,
      });
    }
  }

  return Array.from(keywordMap.values())
    .map((kw) => ({
      query: kw.query,
      clicks: kw.clicks,
      impressions: kw.impressions,
      ctr: kw.count > 0 ? kw.ctr / kw.count : 0,
      position: kw.count > 0 ? kw.position / kw.count : 0,
    }))
    .sort((a, b) => b.clicks - a.clicks);
}

// Daily 데이터 변환 (Airtable summary -> daily 형식)
function transformDailyFromAirtable(records: Record<string, unknown>[]) {
  return records
    .map((r) => ({
      date: String(r.date || ''),
      users: Number(r.totalUsers) || 0,
      newUsers: Number(r.newUsers) || 0,
      sessions: Number(r.sessions) || 0,
      pageViews: Number(r.pageViews) || 0,
      avgSessionDuration: Number(r.avgSessionDuration) || 0,
      bounceRate: Number(r.bounceRate) || 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '30');
  const startDate = searchParams.get('startDate') || undefined;
  const endDate = searchParams.get('endDate') || undefined;
  const type = searchParams.get('type') || 'all';
  const source = searchParams.get('source') || 'auto'; // 'auto' | 'airtable' | 'ga'

  try {
    // 실시간 데이터는 항상 GA에서 조회
    if (type === 'realtime') {
      const realtimeUsers = await getRealtimeUsers();
      return NextResponse.json({ realtimeUsers, source: 'ga' });
    }

    // Summary 조회
    if (type === 'summary') {
      // Airtable 우선 조회 (source가 'ga'가 아닌 경우)
      if (source !== 'ga') {
        try {
          const airtableData = await getLatestSummary(days);
          if (isValidAirtableData(airtableData)) {
            const summary = transformSummaryFromAirtable(airtableData);
            return NextResponse.json({ summary, source: 'airtable' });
          }
        } catch (e) {
          console.log('Airtable summary fetch failed, falling back to GA:', e);
        }
      }

      // GA에서 조회
      const summary = await getAnalyticsSummary(days, startDate, endDate);
      return NextResponse.json({ summary, source: 'ga' });
    }

    // Daily 조회
    if (type === 'daily') {
      if (source !== 'ga') {
        try {
          const airtableData = await getLatestSummary(days);
          if (isValidAirtableData(airtableData)) {
            const daily = transformDailyFromAirtable(airtableData);
            return NextResponse.json({ daily, source: 'airtable' });
          }
        } catch (e) {
          console.log('Airtable daily fetch failed, falling back to GA:', e);
        }
      }

      const daily = await getDailyAnalytics(days, startDate, endDate);
      return NextResponse.json({ daily, source: 'ga' });
    }

    // Pages 조회
    if (type === 'pages') {
      if (source !== 'ga') {
        try {
          const airtableData = await getLatestPages(days);
          if (isValidAirtableData(airtableData)) {
            const pages = transformPagesFromAirtable(airtableData, 10);
            return NextResponse.json({ pages, source: 'airtable' });
          }
        } catch (e) {
          console.log('Airtable pages fetch failed, falling back to GA:', e);
        }
      }

      const pages = await getTopPages(days, 10, startDate, endDate);
      return NextResponse.json({ pages, source: 'ga' });
    }

    // Sources 조회
    if (type === 'sources') {
      if (source !== 'ga') {
        try {
          const airtableData = await getLatestSources(days);
          if (isValidAirtableData(airtableData)) {
            const sources = transformSourcesFromAirtable(airtableData);
            return NextResponse.json({ sources, source: 'airtable' });
          }
        } catch (e) {
          console.log('Airtable sources fetch failed, falling back to GA:', e);
        }
      }

      const sources = await getTrafficSources(days, startDate, endDate);
      return NextResponse.json({ sources, source: 'ga' });
    }

    // 유입 분석 엔드포인트들 (GA only - Airtable에 테이블 없음)
    if (type === 'source-medium') {
      const sourceMedium = await getTrafficSourceMedium(days, startDate, endDate);
      return NextResponse.json({ sourceMedium, source: 'ga' });
    }

    if (type === 'channels') {
      const channels = await getChannelGroups(days, startDate, endDate);
      return NextResponse.json({ channels, source: 'ga' });
    }

    if (type === 'landing') {
      const landingPages = await getLandingPages(days, 10, startDate, endDate);
      return NextResponse.json({ landingPages, source: 'ga' });
    }

    // Devices 조회
    if (type === 'devices') {
      if (source !== 'ga') {
        try {
          const airtableData = await getLatestDevices(days);
          if (isValidAirtableData(airtableData)) {
            const devices = transformDevicesFromAirtable(airtableData);
            return NextResponse.json({ devices, source: 'airtable' });
          }
        } catch (e) {
          console.log('Airtable devices fetch failed, falling back to GA:', e);
        }
      }

      const devices = await getDeviceStats(days, startDate, endDate);
      return NextResponse.json({ devices, source: 'ga' });
    }

    if (type === 'cities') {
      const cities = await getCityStats(days, 15, startDate, endDate);
      return NextResponse.json({ cities, source: 'ga' });
    }

    if (type === 'browsers') {
      const browsers = await getBrowserStats(days, 10, startDate, endDate);
      return NextResponse.json({ browsers, source: 'ga' });
    }

    // Keywords 조회
    if (type === 'keywords') {
      if (source !== 'ga') {
        try {
          const airtableData = await getLatestKeywords(days);
          if (isValidAirtableData(airtableData)) {
            const searchKeywords = transformKeywordsFromAirtable(airtableData);
            return NextResponse.json({
              searchKeywords,
              searchPages: [], // Airtable에는 searchPages 없음
              source: 'airtable'
            });
          }
        } catch (e) {
          console.log('Airtable keywords fetch failed, falling back to GA:', e);
        }
      }

      const [searchKeywords, searchPages] = await Promise.all([
        getSearchKeywords(days),
        getSearchPages(days),
      ]);
      return NextResponse.json({ searchKeywords, searchPages, source: 'ga' });
    }

    // 기간별 검색어 Top5 조회
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

      // 이번 달 (1일 ~ 오늘)
      const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      // 지난 달
      const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);

      const [thisWeek, lastWeek, thisMonth, lastMonth] = await Promise.all([
        getSearchKeywords(0, 5, formatDate(thisWeekStart), formatDate(today)),
        getSearchKeywords(0, 5, formatDate(lastWeekStart), formatDate(lastWeekEnd)),
        getSearchKeywords(0, 5, formatDate(thisMonthStart), formatDate(today)),
        getSearchKeywords(0, 5, formatDate(lastMonthStart), formatDate(lastMonthEnd)),
      ]);

      return NextResponse.json({
        thisWeek,
        lastWeek,
        thisMonth,
        lastMonth,
        source: 'ga',
      });
    }

    // 비교 분석 데이터 조회 (GA only)
    if (type === 'comparison') {
      const currentStart = searchParams.get('currentStart');
      const currentEnd = searchParams.get('currentEnd');
      const previousStart = searchParams.get('previousStart');
      const previousEnd = searchParams.get('previousEnd');

      if (!currentStart || !currentEnd || !previousStart || !previousEnd) {
        return NextResponse.json(
          { error: 'Missing date parameters for comparison' },
          { status: 400 }
        );
      }

      const comparisonData = await getComparisonData(
        currentStart,
        currentEnd,
        previousStart,
        previousEnd
      );
      return NextResponse.json({ comparison: comparisonData, source: 'ga' });
    }

    // 네이버 검색광고 키워드 조회
    if (type === 'naver-keywords') {
      const yearMonth = searchParams.get('yearMonth');
      const months = parseInt(searchParams.get('months') || '6');

      try {
        if (yearMonth) {
          // 특정 월 데이터 조회
          const keywords = await getNaverKeywordsByMonth(yearMonth);
          return NextResponse.json({ keywords, source: 'airtable' });
        } else {
          // 최근 N개월 추이 조회
          const keywords = await getNaverKeywordsTrend(months);
          return NextResponse.json({ keywords, source: 'airtable' });
        }
      } catch (error) {
        console.error('Naver keywords fetch error:', error);
        return NextResponse.json({ keywords: [], source: 'airtable', error: 'Failed to fetch' });
      }
    }

    // 네이버 검색광고 키워드 조회 (Airtable 캐시 또는 실시간)
    if (type === 'naver-keywords-sync') {
      try {
        // startDate/endDate 파라미터가 있으면 Airtable에서 해당 기간 조회
        if (startDate && endDate) {
          const startYearMonth = startDate.slice(0, 7); // YYYY-MM
          const endYearMonth = endDate.slice(0, 7);

          const rawKeywords = await getNaverKeywordsRange(startYearMonth, endYearMonth);

          // 동일 키워드 합산
          const keywordMap = new Map<string, {
            keyword: string;
            impressions: number;
            clicks: number;
            cost: number;
            conversions: number;
          }>();

          for (const kw of rawKeywords) {
            const keyword = String(kw.keyword || '');
            const impressions = Number(kw.impressions) || 0;
            const clicks = Number(kw.clicks) || 0;
            const cost = Number(kw.cost) || 0;
            const conversions = Number(kw.conversions) || 0;

            const existing = keywordMap.get(keyword);
            if (existing) {
              existing.impressions += impressions;
              existing.clicks += clicks;
              existing.cost += cost;
              existing.conversions += conversions;
            } else {
              keywordMap.set(keyword, {
                keyword,
                impressions,
                clicks,
                cost,
                conversions,
              });
            }
          }

          // CTR, CPC 계산 및 정렬
          const stats = Array.from(keywordMap.values()).map(kw => ({
            ...kw,
            ctr: kw.impressions > 0 ? (kw.clicks / kw.impressions) * 100 : 0,
            avgPosition: 0,
          })).sort((a, b) => b.clicks - a.clicks);

          return NextResponse.json({
            keywords: stats,
            source: 'airtable',
            period: `${startYearMonth} ~ ${endYearMonth}`,
          });
        }

        // 기본: 현재 월 네이버 API 실시간 조회
        const yearMonth = searchParams.get('yearMonth') ||
          `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;

        const [year, month] = yearMonth.split('-').map(Number);
        const monthStartDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const monthEndDate = new Date().toISOString().split('T')[0];

        const stats = await getAllKeywordStats(monthStartDate, monthEndDate);

        if (stats.length > 0) {
          const saveResult = await saveNaverKeywords(yearMonth, stats);
          return NextResponse.json({
            keywords: stats,
            saved: saveResult,
            yearMonth,
            source: 'naver-api',
          });
        }

        return NextResponse.json({
          keywords: [],
          message: 'No keyword stats found',
          yearMonth,
          source: 'naver-api',
        });
      } catch (error) {
        console.error('Naver keywords sync error:', error);
        return NextResponse.json(
          { error: 'Failed to sync naver keywords', details: String(error) },
          { status: 500 }
        );
      }
    }

    // 네이버 API 연결 테스트
    if (type === 'naver-test') {
      try {
        const connected = await testNaverConnection();
        return NextResponse.json({ connected, source: 'naver-api' });
      } catch (error) {
        console.error('Naver API test error:', error);
        return NextResponse.json({ connected: false, error: String(error), source: 'naver-api' });
      }
    }

    // 네이버 광고 요약 통계 (캐시 기반)
    if (type === 'naver-summary') {
      try {
        const today = new Date();
        const thisMonthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
        const todayStr = today.toISOString().split('T')[0];

        const queryStartDate = startDate || thisMonthStart;
        const queryEndDate = endDate || todayStr;

        // 캐시된 일별 데이터에서 요약 계산
        const dailyData = await getNaverAdDaily(queryStartDate, queryEndDate);

        if (dailyData.length > 0) {
          const totals = dailyData.reduce((acc, d) => ({
            totalCost: acc.totalCost + d.salesAmt,
            totalClicks: acc.totalClicks + d.clkCnt,
            totalImpressions: acc.totalImpressions + d.impCnt,
            totalConversions: acc.totalConversions + d.ccnt,
          }), { totalCost: 0, totalClicks: 0, totalImpressions: 0, totalConversions: 0 });

          const summary = {
            ...totals,
            avgCtr: totals.totalImpressions > 0 ? (totals.totalClicks / totals.totalImpressions) * 100 : 0,
            avgCpc: totals.totalClicks > 0 ? totals.totalCost / totals.totalClicks : 0,
          };

          return NextResponse.json({ summary, source: 'cache', days: dailyData.length });
        }

        // 캐시 없으면 API 직접 호출
        const summary = await getAdSummary(queryStartDate, queryEndDate);
        return NextResponse.json({ summary, source: 'naver-api' });
      } catch (error) {
        console.error('Naver summary error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch naver summary', details: String(error) },
          { status: 500 }
        );
      }
    }

    // 네이버 광고 일별 통계 (캐시 전용 - API 호출 안함)
    if (type === 'naver-daily') {
      try {
        const today = new Date();
        const thisMonthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
        const todayStr = today.toISOString().split('T')[0];
        const queryStartDate = startDate || thisMonthStart;
        const queryEndDate = endDate || todayStr;
        const cachedDaily = await getNaverAdDaily(queryStartDate, queryEndDate);
        return NextResponse.json({
          daily: cachedDaily,
          source: 'cache',
          cached: cachedDaily.length,
        });
      } catch (error) {
        console.error('Naver daily error:', error);
        return NextResponse.json({ daily: [], source: 'cache', cached: 0 });
      }
    }

    // 네이버 광고 캠페인별 통계
    if (type === 'naver-campaigns') {
      try {
        const today = new Date();
        const thisMonthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
        const todayStr = today.toISOString().split('T')[0];

        const campaigns = await getCampaignsWithStats(
          startDate || thisMonthStart,
          endDate || todayStr
        );
        return NextResponse.json({ campaigns, source: 'naver-api' });
      } catch (error) {
        console.error('Naver campaigns error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch naver campaigns', details: String(error) },
          { status: 500 }
        );
      }
    }

    // 네이버 광고 잔여 예산 (비즈머니) 조회
    if (type === 'naver-bizmoney') {
      try {
        const bizmoney = await getBizmoney();
        return NextResponse.json({ bizmoney, source: 'naver-api' });
      } catch (error) {
        console.error('Naver bizmoney error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch bizmoney', details: String(error) },
          { status: 500 }
        );
      }
    }

    // 네이버 광고 주간별 통계 (일별 캐시 데이터 집계)
    if (type === 'naver-weekly') {
      try {
        const weeks = parseInt(searchParams.get('weeks') || '8');
        const today = new Date();

        // 이번 주 월요일 계산
        const dayOfWeek = today.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const thisMonday = new Date(today);
        thisMonday.setDate(today.getDate() + mondayOffset);

        // N주 전 월요일
        const startMonday = new Date(thisMonday);
        startMonday.setDate(thisMonday.getDate() - ((weeks - 1) * 7));

        const startDateStr = startMonday.toISOString().split('T')[0];
        const endDateStr = today.toISOString().split('T')[0];

        // 일별 캐시 데이터 조회
        const dailyData = await getNaverAdDaily(startDateStr, endDateStr);

        // 주별로 집계
        const weekly: Array<{
          weekStart: string;
          weekEnd: string;
          weekLabel: string;
          impCnt: number;
          clkCnt: number;
          salesAmt: number;
          ctr: number;
          cpc: number;
          ccnt: number;
        }> = [];

        for (let i = 0; i < weeks; i++) {
          const weekStart = new Date(thisMonday);
          weekStart.setDate(thisMonday.getDate() - (i * 7));
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);

          const weekStartStr = weekStart.toISOString().split('T')[0];
          const weekEndStr = (weekEnd > today ? today : weekEnd).toISOString().split('T')[0];

          // 해당 주의 데이터 필터링
          const weekData = dailyData.filter(d => d.date >= weekStartStr && d.date <= weekEndStr);

          const totals = weekData.reduce(
            (acc, d) => ({
              impCnt: acc.impCnt + (d.impCnt || 0),
              clkCnt: acc.clkCnt + (d.clkCnt || 0),
              salesAmt: acc.salesAmt + (d.salesAmt || 0),
              ccnt: acc.ccnt + (d.ccnt || 0),
            }),
            { impCnt: 0, clkCnt: 0, salesAmt: 0, ccnt: 0 }
          );

          const month = weekStart.getMonth() + 1;
          const weekOfMonth = Math.ceil(weekStart.getDate() / 7);

          weekly.push({
            weekStart: weekStartStr,
            weekEnd: weekEndStr,
            weekLabel: `${month}월 ${weekOfMonth}주`,
            ...totals,
            ctr: totals.impCnt > 0 ? (totals.clkCnt / totals.impCnt) * 100 : 0,
            cpc: totals.clkCnt > 0 ? totals.salesAmt / totals.clkCnt : 0,
          });
        }

        return NextResponse.json({ weekly: weekly.reverse(), source: 'cache' });
      } catch (error) {
        console.error('Naver weekly error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch naver weekly stats', details: String(error) },
          { status: 500 }
        );
      }
    }

    // 네이버 광고 월별 통계 (일별 캐시 데이터 집계)
    if (type === 'naver-monthly') {
      try {
        const months = parseInt(searchParams.get('months') || '12');
        const today = new Date();

        // N개월 전 1일
        const startDate = new Date(today.getFullYear(), today.getMonth() - months + 1, 1);
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = today.toISOString().split('T')[0];

        // 일별 캐시 데이터 조회
        const dailyData = await getNaverAdDaily(startDateStr, endDateStr);

        // 월별로 집계
        const monthly: Array<{
          month: string;
          monthLabel: string;
          impCnt: number;
          clkCnt: number;
          salesAmt: number;
          ctr: number;
          cpc: number;
          ccnt: number;
        }> = [];

        for (let i = 0; i < months; i++) {
          const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
          const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
          const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

          const monthStartStr = monthStart.toISOString().split('T')[0];
          const monthEndStr = (monthEnd > today ? today : monthEnd).toISOString().split('T')[0];

          // 해당 월의 데이터 필터링
          const monthData = dailyData.filter(d => d.date >= monthStartStr && d.date <= monthEndStr);

          const totals = monthData.reduce(
            (acc, d) => ({
              impCnt: acc.impCnt + (d.impCnt || 0),
              clkCnt: acc.clkCnt + (d.clkCnt || 0),
              salesAmt: acc.salesAmt + (d.salesAmt || 0),
              ccnt: acc.ccnt + (d.ccnt || 0),
            }),
            { impCnt: 0, clkCnt: 0, salesAmt: 0, ccnt: 0 }
          );

          const year = monthStart.getFullYear();
          const month = monthStart.getMonth() + 1;

          monthly.push({
            month: `${year}-${String(month).padStart(2, '0')}`,
            monthLabel: `${year}년 ${month}월`,
            ...totals,
            ctr: totals.impCnt > 0 ? (totals.clkCnt / totals.impCnt) * 100 : 0,
            cpc: totals.clkCnt > 0 ? totals.salesAmt / totals.clkCnt : 0,
          });
        }

        return NextResponse.json({ monthly: monthly.reverse(), source: 'cache' });
      } catch (error) {
        console.error('Naver monthly error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch naver monthly stats', details: String(error) },
          { status: 500 }
        );
      }
    }

    // 네이버 광고 연간 통계 (일별 캐시 데이터 집계)
    if (type === 'naver-yearly') {
      try {
        const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear();
        const today = new Date();

        // 올해와 작년 데이터 조회
        const currentYearStart = `${year}-01-01`;
        const previousYearStart = `${year - 1}-01-01`;
        const previousYearEnd = `${year - 1}-12-31`;

        const [currentYearDaily, previousYearDaily] = await Promise.all([
          getNaverAdDaily(currentYearStart, today.toISOString().split('T')[0]),
          getNaverAdDaily(previousYearStart, previousYearEnd),
        ]);

        const aggregateByMonth = (data: NaverAdDailyRecord[], targetYear: number) => {
          const result: Array<{
            year: number;
            month: number;
            monthLabel: string;
            impCnt: number;
            clkCnt: number;
            salesAmt: number;
            ctr: number;
            cpc: number;
            ccnt: number;
          }> = [];

          const maxMonth = targetYear === today.getFullYear() ? today.getMonth() + 1 : 12;

          for (let month = 1; month <= maxMonth; month++) {
            const monthStartStr = `${targetYear}-${String(month).padStart(2, '0')}-01`;
            const monthEnd = new Date(targetYear, month, 0);
            const monthEndStr = monthEnd.toISOString().split('T')[0];

            const monthData = data.filter(d => d.date >= monthStartStr && d.date <= monthEndStr);

            const totals = monthData.reduce(
              (acc, d) => ({
                impCnt: acc.impCnt + (d.impCnt || 0),
                clkCnt: acc.clkCnt + (d.clkCnt || 0),
                salesAmt: acc.salesAmt + (d.salesAmt || 0),
                ccnt: acc.ccnt + (d.ccnt || 0),
              }),
              { impCnt: 0, clkCnt: 0, salesAmt: 0, ccnt: 0 }
            );

            result.push({
              year: targetYear,
              month,
              monthLabel: `${month}월`,
              ...totals,
              ctr: totals.impCnt > 0 ? (totals.clkCnt / totals.impCnt) * 100 : 0,
              cpc: totals.clkCnt > 0 ? totals.salesAmt / totals.clkCnt : 0,
            });
          }

          return result;
        };

        const yearly = {
          currentYear: aggregateByMonth(currentYearDaily, year),
          previousYear: aggregateByMonth(previousYearDaily, year - 1),
        };

        return NextResponse.json({ yearly, source: 'cache' });
      } catch (error) {
        console.error('Naver yearly error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch naver yearly stats', details: String(error) },
          { status: 500 }
        );
      }
    }

    // 네이버 키워드 검색량 조회
    if (type === 'naver-keyword-volume') {
      try {
        const keywords = searchParams.get('keywords')?.split(',') || [];

        if (keywords.length === 0) {
          return NextResponse.json({ keywords: [], source: 'naver-api' });
        }

        const volumes = await getKeywordSearchVolume(keywords);
        return NextResponse.json({ keywords: volumes, source: 'naver-api' });
      } catch (error) {
        console.error('Naver keyword volume error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch keyword volume', details: String(error) },
          { status: 500 }
        );
      }
    }

    // 네이버 등록 키워드 + 검색량 조회
    if (type === 'naver-keywords-with-volume') {
      try {
        const today = new Date();
        const thisMonthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
        const todayStr = today.toISOString().split('T')[0];

        const keywordsWithVolume = await getRegisteredKeywordsSearchVolume(
          startDate || thisMonthStart,
          endDate || todayStr
        );
        return NextResponse.json({ keywords: keywordsWithVolume, source: 'naver-api' });
      } catch (error) {
        console.error('Naver keywords with volume error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch keywords with volume', details: String(error) },
          { status: 500 }
        );
      }
    }

    // 네이버 광고 전월 대비 분석
    if (type === 'naver-comparison') {
      try {
        const comparison = await getMonthComparison();
        return NextResponse.json({ comparison, source: 'naver-api' });
      } catch (error) {
        console.error('Naver comparison error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch naver comparison', details: String(error) },
          { status: 500 }
        );
      }
    }

    // Traffic 데이터 조회 (혼합)
    if (type === 'traffic') {
      // Airtable에서 가져올 수 있는 데이터
      let devicesFromAirtable = null;

      if (source !== 'ga') {
        try {
          const airtableDevices = await getLatestDevices(days);
          if (isValidAirtableData(airtableDevices)) {
            devicesFromAirtable = transformDevicesFromAirtable(airtableDevices);
          }
        } catch (e) {
          console.log('Airtable devices fetch failed:', e);
        }
      }

      // GA에서 나머지 데이터 조회
      const [
        sourceMedium,
        channels,
        landingPages,
        cities,
        browsers,
        countries,
        osList,
        userTypes,
        hourly,
        dayOfWeek,
        referrers,
        searchKeywords,
        searchPages,
      ] = await Promise.all([
        getTrafficSourceMedium(days, startDate, endDate),
        getChannelGroups(days, startDate, endDate),
        getLandingPages(days, 10, startDate, endDate),
        getCityStats(days, 15, startDate, endDate),
        getBrowserStats(days, 10, startDate, endDate),
        getCountryStats(days, 15, startDate, endDate),
        getOSStats(days, startDate, endDate),
        getUserTypeStats(days, startDate, endDate),
        getHourlyStats(days, startDate, endDate),
        getDayOfWeekStats(days, startDate, endDate),
        getReferrerStats(days, 15, startDate, endDate),
        getSearchKeywords(days),
        getSearchPages(days),
      ]);

      // devices는 Airtable 데이터가 있으면 사용
      const devices = devicesFromAirtable || await getDeviceStats(days, startDate, endDate);

      return NextResponse.json({
        sourceMedium,
        channels,
        landingPages,
        devices,
        cities,
        browsers,
        countries,
        osList,
        userTypes,
        hourly,
        dayOfWeek,
        referrers,
        searchKeywords,
        searchPages,
        source: devicesFromAirtable ? 'mixed' : 'ga',
      });
    }

    // 모든 데이터 조회
    // Airtable 캐시는 기본 30일 조회에만 사용 (API 호출 최소화)
    // 날짜 필터 변경 시 GA에서 직접 조회 (정확한 유니크 방문자 수 필요)
    let airtableSummary = null;
    let airtableDaily = null;
    let airtablePages = null;
    let airtableSources = null;
    let airtableDevices = null;

    // Airtable은 기본 30일 조회에만 사용 (날짜 필터 변경 시 GA에서 직접 조회)
    const useAirtable = source !== 'ga' && days === 30 && !startDate && !endDate;

    if (useAirtable) {
      try {
        const [summaryRecords, pagesRecords, sourcesRecords, devicesRecords] = await Promise.all([
          getLatestSummary(days),
          getLatestPages(days),
          getLatestSources(days),
          getLatestDevices(days),
        ]);

        if (isValidAirtableData(summaryRecords)) {
          airtableSummary = transformSummaryFromAirtable(summaryRecords);
          airtableDaily = transformDailyFromAirtable(summaryRecords);
        }
        if (isValidAirtableData(pagesRecords)) {
          airtablePages = transformPagesFromAirtable(pagesRecords, 10);
        }
        if (isValidAirtableData(sourcesRecords)) {
          airtableSources = transformSourcesFromAirtable(sourcesRecords);
        }
        if (isValidAirtableData(devicesRecords)) {
          airtableDevices = transformDevicesFromAirtable(devicesRecords);
        }
      } catch (e) {
        console.log('Airtable fetch failed, falling back to GA:', e);
      }
    }

    // Airtable에 없는 데이터는 GA에서 조회
    const [
      gaSummary,
      gaDaily,
      gaPages,
      gaSources,
      realtimeUsers,
      sourceMedium,
      channels,
      landingPages,
      gaDevices,
      cities,
      browsers,
      countries,
      osList,
      userTypes,
      hourly,
      dayOfWeek,
      referrers,
      searchKeywords,
      searchPages,
    ] = await Promise.all([
      airtableSummary ? Promise.resolve(null) : getAnalyticsSummary(days, startDate, endDate),
      airtableDaily ? Promise.resolve(null) : getDailyAnalytics(days, startDate, endDate),
      airtablePages ? Promise.resolve(null) : getTopPages(days, 10, startDate, endDate),
      airtableSources ? Promise.resolve(null) : getTrafficSources(days, startDate, endDate),
      getRealtimeUsers(),
      getTrafficSourceMedium(days, startDate, endDate),
      getChannelGroups(days, startDate, endDate),
      getLandingPages(days, 10, startDate, endDate),
      airtableDevices ? Promise.resolve(null) : getDeviceStats(days, startDate, endDate),
      getCityStats(days, 15, startDate, endDate),
      getBrowserStats(days, 10, startDate, endDate),
      getCountryStats(days, 15, startDate, endDate),
      getOSStats(days, startDate, endDate),
      getUserTypeStats(days, startDate, endDate),
      getHourlyStats(days, startDate, endDate),
      getDayOfWeekStats(days, startDate, endDate),
      getReferrerStats(days, 15, startDate, endDate),
      getSearchKeywords(days),
      getSearchPages(days),
    ]);

    const dataSource = (airtableSummary || airtablePages || airtableSources || airtableDevices) ? 'mixed' : 'ga';

    return NextResponse.json({
      summary: airtableSummary || gaSummary,
      daily: airtableDaily || gaDaily,
      pages: airtablePages || gaPages,
      sources: airtableSources || gaSources,
      realtimeUsers,
      sourceMedium,
      channels,
      landingPages,
      devices: airtableDevices || gaDevices,
      cities,
      browsers,
      countries,
      osList,
      userTypes,
      hourly,
      dayOfWeek,
      referrers,
      searchKeywords,
      searchPages,
      source: dataSource,
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
