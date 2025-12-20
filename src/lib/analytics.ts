import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';

// ===========================================
// 메모리 캐시 시스템 (Rate Limit 방지)
// ===========================================
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL = 5 * 60 * 1000; // 5분 캐시

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

function generateCacheKey(prefix: string, ...args: unknown[]): string {
  return `${prefix}:${JSON.stringify(args)}`;
}

// GA4 속성 ID
const propertyId = process.env.GA4_PROPERTY_ID;

// Search Console 사이트 URL
const siteUrl = process.env.SEARCH_CONSOLE_SITE_URL;

// Private key 변환 함수 - 모든 \n 변형을 실제 줄바꿈으로 변환
function normalizePrivateKey(key: string): string {
  return key
    .split(String.raw`\n`)
    .join('\n')
    .replace(/\r\n/g, '\n')
    .trim();
}

// 서비스 계정 인증 설정
function getCredentials():
  | { client_email: string; private_key: string }
  | undefined {
  // GOOGLE_APPLICATION_CREDENTIALS_JSON (JSON 전체)
  const jsonCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (jsonCredentials) {
    try {
      const parsed = JSON.parse(jsonCredentials);
      if (parsed.private_key) {
        parsed.private_key = normalizePrivateKey(parsed.private_key);
      }
      return {
        client_email: parsed.client_email,
        private_key: parsed.private_key,
      };
    } catch (e) {
      console.error('Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON:', e);
    }
  }

  return undefined;
}

// GoogleAuth를 사용한 인증
function createAnalyticsClient() {
  const credentials = getCredentials();

  if (!credentials) {
    console.error('[GA4] No credentials available');
    return new BetaAnalyticsDataClient();
  }

  const auth = new GoogleAuth({
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
    scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
  });

  return new BetaAnalyticsDataClient({ auth });
}

const analyticsDataClient = createAnalyticsClient();

// 타입 정의
export interface AnalyticsData {
  totalUsers: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
}

export interface DailyData {
  date: string;
  users: number;
  sessions: number;
  pageViews: number;
}

export interface PageData {
  path: string;
  title: string;
  views: number;
}

export interface TrafficSource {
  source: string;
  users: number;
  sessions: number;
}

export interface TrafficSourceMedium {
  source: string;
  medium: string;
  users: number;
  sessions: number;
  bounceRate: number;
}

export interface ChannelGroup {
  channel: string;
  users: number;
  sessions: number;
  pageViews: number;
}

export interface LandingPage {
  page: string;
  sessions: number;
  users: number;
  bounceRate: number;
}

export interface DeviceData {
  device: string;
  users: number;
  sessions: number;
  pageViews: number;
}

export interface CityData {
  city: string;
  users: number;
  sessions: number;
}

export interface BrowserData {
  browser: string;
  users: number;
  sessions: number;
}

export interface CountryData {
  country: string;
  users: number;
  sessions: number;
}

export interface OSData {
  os: string;
  users: number;
  sessions: number;
}

export interface UserTypeData {
  userType: string;
  users: number;
  sessions: number;
}

export interface HourlyData {
  hour: string;
  users: number;
  sessions: number;
}

export interface DayOfWeekData {
  dayOfWeek: string;
  users: number;
  sessions: number;
}

export interface ReferrerData {
  referrer: string;
  users: number;
  sessions: number;
}

// 날짜 범위 계산 헬퍼
interface DateRangeParams {
  days?: number;
  startDate?: string;
  endDate?: string;
}

function getDateRange(params: DateRangeParams): { startDate: string; endDate: string } {
  if (params.startDate && params.endDate) {
    return { startDate: params.startDate, endDate: params.endDate };
  }
  const days = params.days || 30;
  return { startDate: `${days}daysAgo`, endDate: 'today' };
}

// 기본 통계 조회 (오늘 ~ N일 전)
export async function getAnalyticsSummary(
  days: number = 30,
  startDate?: string,
  endDate?: string
): Promise<AnalyticsData | null> {
  if (!propertyId) {
    console.error('GA4_PROPERTY_ID is not set');
    return null;
  }

  // 캐시 확인
  const cacheKey = generateCacheKey('summary', days, startDate, endDate);
  const cached = getCached<AnalyticsData>(cacheKey);
  if (cached) return cached;

  const dateRange = getDateRange({ days, startDate, endDate });

  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      metrics: [
        { name: 'totalUsers' },
        { name: 'newUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
      ],
    });

    if (response.rows && response.rows.length > 0) {
      const row = response.rows[0];
      const result = {
        totalUsers: parseInt(row.metricValues?.[0]?.value || '0'),
        newUsers: parseInt(row.metricValues?.[1]?.value || '0'),
        sessions: parseInt(row.metricValues?.[2]?.value || '0'),
        pageViews: parseInt(row.metricValues?.[3]?.value || '0'),
        avgSessionDuration: parseFloat(row.metricValues?.[4]?.value || '0'),
        bounceRate: parseFloat(row.metricValues?.[5]?.value || '0') * 100,
      };
      setCache(cacheKey, result);
      return result;
    }

    return null;
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    return null;
  }
}

// 일별 데이터 조회
export async function getDailyAnalytics(
  days: number = 30,
  startDate?: string,
  endDate?: string
): Promise<DailyData[]> {
  if (!propertyId) {
    console.error('GA4_PROPERTY_ID is not set');
    return [];
  }

  // 캐시 확인
  const cacheKey = generateCacheKey('daily', days, startDate, endDate);
  const cached = getCached<DailyData[]>(cacheKey);
  if (cached) return cached;

  const dateRange = getDateRange({ days, startDate, endDate });

  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'totalUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
      ],
      orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
    });

    if (response.rows) {
      const result = response.rows.map((row) => ({
        date: row.dimensionValues?.[0]?.value || '',
        users: parseInt(row.metricValues?.[0]?.value || '0'),
        sessions: parseInt(row.metricValues?.[1]?.value || '0'),
        pageViews: parseInt(row.metricValues?.[2]?.value || '0'),
      }));
      setCache(cacheKey, result);
      return result;
    }

    return [];
  } catch (error) {
    console.error('Error fetching daily analytics:', error);
    return [];
  }
}

// 인기 페이지 조회
export async function getTopPages(
  days: number = 30,
  limit: number = 10,
  startDate?: string,
  endDate?: string
): Promise<PageData[]> {
  if (!propertyId) {
    console.error('GA4_PROPERTY_ID is not set');
    return [];
  }

  // 캐시 확인
  const cacheKey = generateCacheKey('topPages', days, limit, startDate, endDate);
  const cached = getCached<PageData[]>(cacheKey);
  if (cached) return cached;

  const dateRange = getDateRange({ days, startDate, endDate });

  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
      metrics: [{ name: 'screenPageViews' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit,
    });

    if (response.rows) {
      const result = response.rows.map((row) => ({
        path: row.dimensionValues?.[0]?.value || '',
        title: row.dimensionValues?.[1]?.value || '',
        views: parseInt(row.metricValues?.[0]?.value || '0'),
      }));
      setCache(cacheKey, result);
      return result;
    }

    return [];
  } catch (error) {
    console.error('Error fetching top pages:', error);
    return [];
  }
}

// 트래픽 소스 조회
export async function getTrafficSources(
  days: number = 30,
  startDate?: string,
  endDate?: string
): Promise<TrafficSource[]> {
  if (!propertyId) {
    console.error('GA4_PROPERTY_ID is not set');
    return [];
  }

  // 캐시 확인
  const cacheKey = generateCacheKey('trafficSources', days, startDate, endDate);
  const cached = getCached<TrafficSource[]>(cacheKey);
  if (cached) return cached;

  const dateRange = getDateRange({ days, startDate, endDate });

  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: 'sessionSource' }],
      metrics: [{ name: 'totalUsers' }, { name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10,
    });

    if (response.rows) {
      const result = response.rows.map((row) => ({
        source: row.dimensionValues?.[0]?.value || '(direct)',
        users: parseInt(row.metricValues?.[0]?.value || '0'),
        sessions: parseInt(row.metricValues?.[1]?.value || '0'),
      }));
      setCache(cacheKey, result);
      return result;
    }

    return [];
  } catch (error) {
    console.error('Error fetching traffic sources:', error);
    return [];
  }
}

// 실시간 사용자 수 (최근 30분) - 30초 캐시
export async function getRealtimeUsers(): Promise<number> {
  if (!propertyId) {
    console.error('GA4_PROPERTY_ID is not set');
    return 0;
  }

  // 실시간 데이터는 30초 캐시
  const cacheKey = 'realtime';
  const entry = cache.get(cacheKey);
  if (entry && Date.now() - entry.timestamp < 30000) {
    return entry.data as number;
  }

  try {
    const [response] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${propertyId}`,
      metrics: [{ name: 'activeUsers' }],
    });

    if (response.rows && response.rows.length > 0) {
      const result = parseInt(response.rows[0].metricValues?.[0]?.value || '0');
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    }

    return 0;
  } catch (error) {
    console.error('Error fetching realtime users:', error);
    return 0;
  }
}

// 소스 + 매체별 트래픽 조회
export async function getTrafficSourceMedium(
  days: number = 30,
  startDate?: string,
  endDate?: string
): Promise<TrafficSourceMedium[]> {
  if (!propertyId) {
    console.error('GA4_PROPERTY_ID is not set');
    return [];
  }

  // 캐시 확인
  const cacheKey = generateCacheKey('sourceMedium', days, startDate, endDate);
  const cached = getCached<TrafficSourceMedium[]>(cacheKey);
  if (cached) return cached;

  const dateRange = getDateRange({ days, startDate, endDate });

  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
      metrics: [
        { name: 'totalUsers' },
        { name: 'sessions' },
        { name: 'bounceRate' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 15,
    });

    if (response.rows) {
      const result = response.rows.map((row) => ({
        source: row.dimensionValues?.[0]?.value || '(direct)',
        medium: row.dimensionValues?.[1]?.value || '(none)',
        users: parseInt(row.metricValues?.[0]?.value || '0'),
        sessions: parseInt(row.metricValues?.[1]?.value || '0'),
        bounceRate: parseFloat(row.metricValues?.[2]?.value || '0') * 100,
      }));
      setCache(cacheKey, result);
      return result;
    }

    return [];
  } catch (error) {
    console.error('Error fetching traffic source/medium:', error);
    return [];
  }
}

// 채널 그룹별 트래픽 조회
export async function getChannelGroups(
  days: number = 30,
  startDate?: string,
  endDate?: string
): Promise<ChannelGroup[]> {
  if (!propertyId) {
    console.error('GA4_PROPERTY_ID is not set');
    return [];
  }

  // 캐시 확인
  const cacheKey = generateCacheKey('channels', days, startDate, endDate);
  const cached = getCached<ChannelGroup[]>(cacheKey);
  if (cached) return cached;

  const dateRange = getDateRange({ days, startDate, endDate });

  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [
        { name: 'totalUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    });

    if (response.rows) {
      const result = response.rows.map((row) => ({
        channel: row.dimensionValues?.[0]?.value || 'Other',
        users: parseInt(row.metricValues?.[0]?.value || '0'),
        sessions: parseInt(row.metricValues?.[1]?.value || '0'),
        pageViews: parseInt(row.metricValues?.[2]?.value || '0'),
      }));
      setCache(cacheKey, result);
      return result;
    }

    return [];
  } catch (error) {
    console.error('Error fetching channel groups:', error);
    return [];
  }
}

// 랜딩 페이지 조회
export async function getLandingPages(
  days: number = 30,
  limit: number = 10,
  startDate?: string,
  endDate?: string
): Promise<LandingPage[]> {
  if (!propertyId) {
    console.error('GA4_PROPERTY_ID is not set');
    return [];
  }

  // 캐시 확인
  const cacheKey = generateCacheKey('landing', days, limit, startDate, endDate);
  const cached = getCached<LandingPage[]>(cacheKey);
  if (cached) return cached;

  const dateRange = getDateRange({ days, startDate, endDate });

  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: 'landingPage' }],
      metrics: [
        { name: 'sessions' },
        { name: 'totalUsers' },
        { name: 'bounceRate' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit,
    });

    if (response.rows) {
      const result = response.rows.map((row) => ({
        page: row.dimensionValues?.[0]?.value || '/',
        sessions: parseInt(row.metricValues?.[0]?.value || '0'),
        users: parseInt(row.metricValues?.[1]?.value || '0'),
        bounceRate: parseFloat(row.metricValues?.[2]?.value || '0') * 100,
      }));
      setCache(cacheKey, result);
      return result;
    }

    return [];
  } catch (error) {
    console.error('Error fetching landing pages:', error);
    return [];
  }
}

// 기기별 통계 조회
export async function getDeviceStats(
  days: number = 30,
  startDate?: string,
  endDate?: string
): Promise<DeviceData[]> {
  if (!propertyId) {
    console.error('GA4_PROPERTY_ID is not set');
    return [];
  }

  // 캐시 확인
  const cacheKey = generateCacheKey('devices', days, startDate, endDate);
  const cached = getCached<DeviceData[]>(cacheKey);
  if (cached) return cached;

  const dateRange = getDateRange({ days, startDate, endDate });

  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [
        { name: 'totalUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    });

    if (response.rows) {
      const result = response.rows.map((row) => ({
        device: row.dimensionValues?.[0]?.value || 'unknown',
        users: parseInt(row.metricValues?.[0]?.value || '0'),
        sessions: parseInt(row.metricValues?.[1]?.value || '0'),
        pageViews: parseInt(row.metricValues?.[2]?.value || '0'),
      }));
      setCache(cacheKey, result);
      return result;
    }

    return [];
  } catch (error) {
    console.error('Error fetching device stats:', error);
    return [];
  }
}

// 도시별 통계 조회
export async function getCityStats(
  days: number = 30,
  limit: number = 15,
  startDate?: string,
  endDate?: string
): Promise<CityData[]> {
  if (!propertyId) {
    console.error('GA4_PROPERTY_ID is not set');
    return [];
  }

  // 캐시 확인
  const cacheKey = generateCacheKey('cities', days, limit, startDate, endDate);
  const cached = getCached<CityData[]>(cacheKey);
  if (cached) return cached;

  const dateRange = getDateRange({ days, startDate, endDate });

  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: 'city' }],
      metrics: [{ name: 'totalUsers' }, { name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit,
    });

    if (response.rows) {
      const result = response.rows.map((row) => ({
        city: row.dimensionValues?.[0]?.value || '(not set)',
        users: parseInt(row.metricValues?.[0]?.value || '0'),
        sessions: parseInt(row.metricValues?.[1]?.value || '0'),
      }));
      setCache(cacheKey, result);
      return result;
    }

    return [];
  } catch (error) {
    console.error('Error fetching city stats:', error);
    return [];
  }
}

// 브라우저별 통계 조회
export async function getBrowserStats(
  days: number = 30,
  limit: number = 10,
  startDate?: string,
  endDate?: string
): Promise<BrowserData[]> {
  if (!propertyId) {
    console.error('GA4_PROPERTY_ID is not set');
    return [];
  }

  // 캐시 확인
  const cacheKey = generateCacheKey('browsers', days, limit, startDate, endDate);
  const cached = getCached<BrowserData[]>(cacheKey);
  if (cached) return cached;

  const dateRange = getDateRange({ days, startDate, endDate });

  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: 'browser' }],
      metrics: [{ name: 'totalUsers' }, { name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit,
    });

    if (response.rows) {
      const result = response.rows.map((row) => ({
        browser: row.dimensionValues?.[0]?.value || 'unknown',
        users: parseInt(row.metricValues?.[0]?.value || '0'),
        sessions: parseInt(row.metricValues?.[1]?.value || '0'),
      }));
      setCache(cacheKey, result);
      return result;
    }

    return [];
  } catch (error) {
    console.error('Error fetching browser stats:', error);
    return [];
  }
}

// 국가별 통계 조회
export async function getCountryStats(
  days: number = 30,
  limit: number = 15,
  startDate?: string,
  endDate?: string
): Promise<CountryData[]> {
  if (!propertyId) return [];

  // 캐시 확인
  const cacheKey = generateCacheKey('countries', days, limit, startDate, endDate);
  const cached = getCached<CountryData[]>(cacheKey);
  if (cached) return cached;

  const dateRange = getDateRange({ days, startDate, endDate });

  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: 'country' }],
      metrics: [{ name: 'totalUsers' }, { name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit,
    });

    if (response.rows) {
      const result = response.rows.map((row) => ({
        country: row.dimensionValues?.[0]?.value || '(not set)',
        users: parseInt(row.metricValues?.[0]?.value || '0'),
        sessions: parseInt(row.metricValues?.[1]?.value || '0'),
      }));
      setCache(cacheKey, result);
      return result;
    }
    return [];
  } catch (error) {
    console.error('Error fetching country stats:', error);
    return [];
  }
}

// 운영체제별 통계 조회
export async function getOSStats(
  days: number = 30,
  startDate?: string,
  endDate?: string
): Promise<OSData[]> {
  if (!propertyId) return [];

  // 캐시 확인
  const cacheKey = generateCacheKey('os', days, startDate, endDate);
  const cached = getCached<OSData[]>(cacheKey);
  if (cached) return cached;

  const dateRange = getDateRange({ days, startDate, endDate });

  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: 'operatingSystem' }],
      metrics: [{ name: 'totalUsers' }, { name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10,
    });

    if (response.rows) {
      const result = response.rows.map((row) => ({
        os: row.dimensionValues?.[0]?.value || 'unknown',
        users: parseInt(row.metricValues?.[0]?.value || '0'),
        sessions: parseInt(row.metricValues?.[1]?.value || '0'),
      }));
      setCache(cacheKey, result);
      return result;
    }
    return [];
  } catch (error) {
    console.error('Error fetching OS stats:', error);
    return [];
  }
}

// 신규 vs 재방문 통계
export async function getUserTypeStats(
  days: number = 30,
  startDate?: string,
  endDate?: string
): Promise<UserTypeData[]> {
  if (!propertyId) return [];

  // 캐시 확인
  const cacheKey = generateCacheKey('userType', days, startDate, endDate);
  const cached = getCached<UserTypeData[]>(cacheKey);
  if (cached) return cached;

  const dateRange = getDateRange({ days, startDate, endDate });

  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: 'newVsReturning' }],
      metrics: [{ name: 'totalUsers' }, { name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    });

    if (response.rows) {
      const result = response.rows.map((row) => ({
        userType: row.dimensionValues?.[0]?.value || 'unknown',
        users: parseInt(row.metricValues?.[0]?.value || '0'),
        sessions: parseInt(row.metricValues?.[1]?.value || '0'),
      }));
      setCache(cacheKey, result);
      return result;
    }
    return [];
  } catch (error) {
    console.error('Error fetching user type stats:', error);
    return [];
  }
}

// 시간대별 통계 조회
export async function getHourlyStats(
  days: number = 30,
  startDate?: string,
  endDate?: string
): Promise<HourlyData[]> {
  if (!propertyId) return [];

  // 캐시 확인
  const cacheKey = generateCacheKey('hourly', days, startDate, endDate);
  const cached = getCached<HourlyData[]>(cacheKey);
  if (cached) return cached;

  const dateRange = getDateRange({ days, startDate, endDate });

  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: 'hour' }],
      metrics: [{ name: 'totalUsers' }, { name: 'sessions' }],
      orderBys: [{ dimension: { dimensionName: 'hour' }, desc: false }],
    });

    if (response.rows) {
      const result = response.rows.map((row) => ({
        hour: row.dimensionValues?.[0]?.value || '0',
        users: parseInt(row.metricValues?.[0]?.value || '0'),
        sessions: parseInt(row.metricValues?.[1]?.value || '0'),
      }));
      setCache(cacheKey, result);
      return result;
    }
    return [];
  } catch (error) {
    console.error('Error fetching hourly stats:', error);
    return [];
  }
}

// 요일별 통계 조회
export async function getDayOfWeekStats(
  days: number = 30,
  startDate?: string,
  endDate?: string
): Promise<DayOfWeekData[]> {
  if (!propertyId) return [];

  // 캐시 확인
  const cacheKey = generateCacheKey('dayOfWeek', days, startDate, endDate);
  const cached = getCached<DayOfWeekData[]>(cacheKey);
  if (cached) return cached;

  const dateRange = getDateRange({ days, startDate, endDate });

  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: 'dayOfWeek' }],
      metrics: [{ name: 'totalUsers' }, { name: 'sessions' }],
      orderBys: [{ dimension: { dimensionName: 'dayOfWeek' }, desc: false }],
    });

    if (response.rows) {
      const result = response.rows.map((row) => ({
        dayOfWeek: row.dimensionValues?.[0]?.value || '0',
        users: parseInt(row.metricValues?.[0]?.value || '0'),
        sessions: parseInt(row.metricValues?.[1]?.value || '0'),
      }));
      setCache(cacheKey, result);
      return result;
    }
    return [];
  } catch (error) {
    console.error('Error fetching day of week stats:', error);
    return [];
  }
}

// 참조 URL 통계 조회
export async function getReferrerStats(
  days: number = 30,
  limit: number = 15,
  startDate?: string,
  endDate?: string
): Promise<ReferrerData[]> {
  if (!propertyId) return [];

  // 캐시 확인
  const cacheKey = generateCacheKey('referrer', days, limit, startDate, endDate);
  const cached = getCached<ReferrerData[]>(cacheKey);
  if (cached) return cached;

  const dateRange = getDateRange({ days, startDate, endDate });

  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [dateRange],
      dimensions: [{ name: 'pageReferrer' }],
      metrics: [{ name: 'totalUsers' }, { name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit,
    });

    if (response.rows) {
      const result = response.rows.map((row) => ({
        referrer: row.dimensionValues?.[0]?.value || '(direct)',
        users: parseInt(row.metricValues?.[0]?.value || '0'),
        sessions: parseInt(row.metricValues?.[1]?.value || '0'),
      }));
      setCache(cacheKey, result);
      return result;
    }
    return [];
  } catch (error) {
    console.error('Error fetching referrer stats:', error);
    return [];
  }
}

// ============================================
// Google Search Console API
// ============================================

export interface SearchKeyword {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchPage {
  page: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

// Search Console 클라이언트 생성
function createSearchConsoleClient() {
  const credentials = getCredentials();

  if (!credentials) {
    console.error('[SearchConsole] No credentials available');
    return null;
  }

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  return google.searchconsole({ version: 'v1', auth });
}

// 검색어(쿼리)별 통계 조회
export async function getSearchKeywords(
  days: number = 30,
  limit: number = 50,
  startDateStr?: string,
  endDateStr?: string
): Promise<SearchKeyword[]> {
  if (!siteUrl) {
    console.error('SEARCH_CONSOLE_SITE_URL is not set');
    return [];
  }

  // 캐시 확인
  const cacheKey = generateCacheKey('searchKeywords', days, limit, startDateStr, endDateStr);
  const cached = getCached<SearchKeyword[]>(cacheKey);
  if (cached) return cached;

  const searchConsole = createSearchConsoleClient();
  if (!searchConsole) return [];

  // 날짜 계산
  let startDate: Date;
  let endDate: Date;

  if (startDateStr && endDateStr) {
    startDate = new Date(startDateStr);
    endDate = new Date(endDateStr);
  } else {
    endDate = new Date();
    startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
  }

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  try {
    const response = await searchConsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['query'],
        rowLimit: limit,
        dataState: 'final',
      },
    });

    if (response.data.rows) {
      const result = response.data.rows.map((row) => ({
        query: row.keys?.[0] || '',
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: (row.ctr || 0) * 100,
        position: row.position || 0,
      }));
      setCache(cacheKey, result);
      return result;
    }

    return [];
  } catch (error) {
    console.error('Error fetching search keywords:', error);
    return [];
  }
}

// 페이지별 검색 통계 조회
export async function getSearchPages(
  days: number = 30,
  limit: number = 20
): Promise<SearchPage[]> {
  if (!siteUrl) {
    console.error('SEARCH_CONSOLE_SITE_URL is not set');
    return [];
  }

  // 캐시 확인
  const cacheKey = generateCacheKey('searchPages', days, limit);
  const cached = getCached<SearchPage[]>(cacheKey);
  if (cached) return cached;

  const searchConsole = createSearchConsoleClient();
  if (!searchConsole) return [];

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  try {
    const response = await searchConsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['page'],
        rowLimit: limit,
        dataState: 'final',
      },
    });

    if (response.data.rows) {
      const result = response.data.rows.map((row) => ({
        page: row.keys?.[0] || '',
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: (row.ctr || 0) * 100,
        position: row.position || 0,
      }));
      setCache(cacheKey, result);
      return result;
    }

    return [];
  } catch (error) {
    console.error('Error fetching search pages:', error);
    return [];
  }
}

// ============================================
// 비교 분석 API
// ============================================

export interface ComparisonData {
  current: {
    totalUsers: number;
    newUsers: number;
    sessions: number;
    pageViews: number;
    avgSessionDuration: number;
    bounceRate: number;
  };
  previous: {
    totalUsers: number;
    newUsers: number;
    sessions: number;
    pageViews: number;
    avgSessionDuration: number;
    bounceRate: number;
  };
  changes: {
    totalUsers: number;
    newUsers: number;
    sessions: number;
    pageViews: number;
    avgSessionDuration: number;
    bounceRate: number;
  };
  currentDaily: DailyData[];
  previousDaily: DailyData[];
  currentChannels: ChannelGroup[];
  previousChannels: ChannelGroup[];
}

// 두 기간 비교 데이터 조회
export async function getComparisonData(
  currentStart: string,
  currentEnd: string,
  previousStart: string,
  previousEnd: string
): Promise<ComparisonData | null> {
  if (!propertyId) {
    console.error('GA4_PROPERTY_ID is not set');
    return null;
  }

  try {
    // 현재 기간과 이전 기간 데이터를 병렬로 조회
    const [
      currentSummary,
      previousSummary,
      currentDaily,
      previousDaily,
      currentChannels,
      previousChannels,
    ] = await Promise.all([
      getAnalyticsSummary(0, currentStart, currentEnd),
      getAnalyticsSummary(0, previousStart, previousEnd),
      getDailyAnalytics(0, currentStart, currentEnd),
      getDailyAnalytics(0, previousStart, previousEnd),
      getChannelGroups(0, currentStart, currentEnd),
      getChannelGroups(0, previousStart, previousEnd),
    ]);

    if (!currentSummary) {
      return null;
    }

    // 이전 기간 데이터가 없으면 0으로 처리
    const safePreviousSummary = previousSummary || {
      totalUsers: 0,
      newUsers: 0,
      sessions: 0,
      pageViews: 0,
      avgSessionDuration: 0,
      bounceRate: 0,
    };

    // 변화율 계산 (이전 값이 0인 경우 처리)
    const calculateChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      current: currentSummary,
      previous: safePreviousSummary,
      changes: {
        totalUsers: calculateChange(currentSummary.totalUsers, safePreviousSummary.totalUsers),
        newUsers: calculateChange(currentSummary.newUsers, safePreviousSummary.newUsers),
        sessions: calculateChange(currentSummary.sessions, safePreviousSummary.sessions),
        pageViews: calculateChange(currentSummary.pageViews, safePreviousSummary.pageViews),
        avgSessionDuration: calculateChange(currentSummary.avgSessionDuration, safePreviousSummary.avgSessionDuration),
        bounceRate: calculateChange(currentSummary.bounceRate, safePreviousSummary.bounceRate),
      },
      currentDaily,
      previousDaily: previousDaily || [],
      currentChannels: currentChannels || [],
      previousChannels: previousChannels || [],
    };
  } catch (error) {
    console.error('Error fetching comparison data:', error);
    return null;
  }
}
