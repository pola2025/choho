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

  // 전체 합계 계산
  const totals = records.reduce<SummaryTotals>(
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
  const count = records.length;
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

    // 모든 데이터 조회 (기본) - Airtable 우선
    let airtableSummary = null;
    let airtableDaily = null;
    let airtablePages = null;
    let airtableSources = null;
    let airtableDevices = null;

    if (source !== 'ga') {
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
