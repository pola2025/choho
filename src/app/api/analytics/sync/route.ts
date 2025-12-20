import { NextResponse } from 'next/server';
import {
  getAnalyticsSummary,
  getTopPages,
  getTrafficSourceMedium,
  getDeviceStats,
  getSearchKeywords,
  getDailyAnalytics,
} from '@/lib/analytics';
import {
  saveSummary,
  savePages,
  saveSources,
  saveDevices,
  saveKeywords,
} from '@/lib/analytics-airtable';

// Vercel Cron을 위한 설정
export const maxDuration = 60; // 최대 60초

// 날짜 포맷 헬퍼
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// GA4 날짜 형식(YYYYMMDD)을 ISO 형식(YYYY-MM-DD)으로 변환
function convertGADateToISO(gaDate: string): string {
  if (gaDate.length === 8) {
    return `${gaDate.slice(0, 4)}-${gaDate.slice(4, 6)}-${gaDate.slice(6, 8)}`;
  }
  return gaDate;
}

export async function POST(request: Request) {
  try {
    // 인증 확인 (Vercel Cron 또는 수동 호출)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Cron 호출이 아닌 경우 (수동 호출), 간단한 인증 확인
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // 개발 환경에서는 허용
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'daily'; // daily, backfill, today

    const results: Record<string, unknown> = {
      mode,
      timestamp: new Date().toISOString(),
      synced: {} as Record<string, unknown>,
    };

    if (mode === 'today') {
      // 오늘 날짜의 실시간 데이터 동기화
      const today = formatDate(new Date());

      const [summary, pages, sources, devices, keywords] = await Promise.all([
        getAnalyticsSummary(1),
        getTopPages(1, 20),
        getTrafficSourceMedium(1),
        getDeviceStats(1),
        getSearchKeywords(1),
      ]);

      const syncResults: Record<string, unknown> = {};

      if (summary) {
        syncResults.summary = await saveSummary(today, summary);
      }

      if (pages.length > 0) {
        syncResults.pages = await savePages(today, pages);
      }

      if (sources.length > 0) {
        syncResults.sources = await saveSources(
          today,
          sources.map((s) => ({
            source: s.source,
            medium: s.medium,
            users: s.users,
            sessions: s.sessions,
          }))
        );
      }

      if (devices.length > 0) {
        syncResults.devices = await saveDevices(today, devices);
      }

      if (keywords.length > 0) {
        syncResults.keywords = await saveKeywords(today, keywords);
      }

      results.synced = { [today]: syncResults };
    } else if (mode === 'daily' || mode === 'backfill') {
      // 일별 데이터 동기화 (최근 7일 또는 30일)
      const days = mode === 'backfill' ? 30 : 7;
      const dailyData = await getDailyAnalytics(days);

      // 일별로 데이터 수집 및 저장
      for (const day of dailyData) {
        const date = convertGADateToISO(day.date);

        // 해당 날짜의 상세 데이터 조회
        const [pages, sources, devices] = await Promise.all([
          getTopPages(1, 20, date, date),
          getTrafficSourceMedium(1, date, date),
          getDeviceStats(1, date, date),
        ]);

        const syncResults: Record<string, unknown> = {};

        // Summary 저장 (일별 데이터에서 추출)
        syncResults.summary = await saveSummary(date, {
          totalUsers: day.users,
          newUsers: 0, // 일별 데이터에는 없음
          sessions: day.sessions,
          pageViews: day.pageViews,
          avgSessionDuration: 0,
          bounceRate: 0,
        });

        if (pages.length > 0) {
          syncResults.pages = await savePages(date, pages);
        }

        if (sources.length > 0) {
          syncResults.sources = await saveSources(
            date,
            sources.map((s) => ({
              source: s.source,
              medium: s.medium,
              users: s.users,
              sessions: s.sessions,
            }))
          );
        }

        if (devices.length > 0) {
          syncResults.devices = await saveDevices(date, devices);
        }

        (results.synced as Record<string, unknown>)[date] = syncResults;
      }

      // 검색 키워드는 기간 전체로 저장
      const keywords = await getSearchKeywords(days);
      if (keywords.length > 0) {
        const today = formatDate(new Date());
        (results.synced as Record<string, unknown>).keywords = await saveKeywords(
          today,
          keywords
        );
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error('Analytics sync error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Vercel Cron에서 호출하는 GET 요청도 지원
export async function GET(request: Request) {
  // POST로 리다이렉트
  return POST(request);
}
