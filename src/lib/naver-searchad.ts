/**
 * 네이버 검색광고 API 라이브러리
 * https://naver.github.io/searchad-apidoc/
 */

import crypto from 'crypto';

const API_BASE_URL = 'https://api.searchad.naver.com';
const ACCESS_LICENSE = process.env.NAVER_AD_ACCESS_LICENSE || '';
const SECRET_KEY = process.env.NAVER_AD_SECRET_KEY || '';
const CUSTOMER_ID = process.env.NAVER_AD_CUSTOMER_ID || '';

// HMAC-SHA256 서명 생성
function generateSignature(timestamp: string, method: string, path: string): string {
  const message = `${timestamp}.${method}.${path}`;
  const hmac = crypto.createHmac('sha256', SECRET_KEY);
  hmac.update(message);
  return hmac.digest('base64');
}

// API 요청 헬퍼
async function naverAdRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown
): Promise<T> {
  const timestamp = String(Date.now());

  // 서명 생성 시 쿼리 스트링 제외 (경로만 사용)
  const pathWithoutQuery = path.split('?')[0];
  const signature = generateSignature(timestamp, method, pathWithoutQuery);

  const url = `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Timestamp': timestamp,
      'X-API-KEY': ACCESS_LICENSE,
      'X-Customer': CUSTOMER_ID,
      'X-Signature': signature,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Naver Ad API Error:', response.status, errorText);
    throw new Error(`Naver Ad API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

// 캠페인 목록 조회
export interface Campaign {
  nccCampaignId: string;
  customerId: number;
  name: string;
  campaignTp: string;
  deliveryMethod: string;
  trackingMode: string;
  dailyBudget: number;
  status: string;
  statusReason: string;
  regTm: string;
  editTm: string;
}

export async function getCampaigns(): Promise<Campaign[]> {
  return naverAdRequest<Campaign[]>('GET', '/ncc/campaigns');
}

// 광고그룹 목록 조회
export interface AdGroup {
  nccAdgroupId: string;
  customerId: number;
  nccCampaignId: string;
  name: string;
  status: string;
  pcChannelId: string;
  mobileChannelId: string;
  bidAmt: number;
  regTm: string;
  editTm: string;
}

export async function getAdGroups(campaignId?: string): Promise<AdGroup[]> {
  const path = campaignId
    ? `/ncc/adgroups?nccCampaignId=${campaignId}`
    : '/ncc/adgroups';
  return naverAdRequest<AdGroup[]>('GET', path);
}

// 키워드 목록 조회
export interface Keyword {
  nccKeywordId: string;
  nccAdgroupId: string;
  keyword: string;
  customerId: number;
  bidAmt: number;
  useGroupBidAmt: boolean;
  status: string;
  statusReason: string;
  nccQi: {
    qiGrade: number;
  };
  regTm: string;
  editTm: string;
}

export async function getKeywords(adGroupId: string): Promise<Keyword[]> {
  return naverAdRequest<Keyword[]>('GET', `/ncc/keywords?nccAdgroupId=${adGroupId}`);
}

// 통계 데이터 조회
export interface StatRecord {
  id: string;
  impCnt: number;      // 노출수
  clkCnt: number;      // 클릭수
  salesAmt: number;    // 광고비
  ctr: number;         // 클릭률
  cpc: number;         // 클릭당 비용
  avgRnk: number;      // 평균 순위
  ccnt: number;        // 전환수
  crto: number;        // 전환률
  convAmt: number;     // 전환매출
  viewCnt: number;     // 조회수
}

export interface StatResponse {
  data: StatRecord[];
}

// 날짜 형식 변환 (YYYY-MM-DD -> YYYYMMDD)
function formatDateForStat(date: string): string {
  return date.replace(/-/g, '');
}

// 캠페인 통계 조회
export async function getCampaignStats(
  campaignIds: string[],
  startDate: string,
  endDate: string
): Promise<StatRecord[]> {
  const params = new URLSearchParams({
    ids: campaignIds.join(','),
    fields: JSON.stringify(['impCnt', 'clkCnt', 'salesAmt', 'ctr', 'cpc', 'avgRnk', 'ccnt', 'crto', 'convAmt']),
    timeRange: JSON.stringify({
      since: formatDateForStat(startDate),
      until: formatDateForStat(endDate),
    }),
  });

  const response = await naverAdRequest<StatResponse>('GET', `/stats?${params.toString()}`);
  return response.data || [];
}

// 광고그룹 통계 조회
export async function getAdGroupStats(
  adGroupIds: string[],
  startDate: string,
  endDate: string
): Promise<StatRecord[]> {
  const params = new URLSearchParams({
    ids: adGroupIds.join(','),
    fields: JSON.stringify(['impCnt', 'clkCnt', 'salesAmt', 'ctr', 'cpc', 'avgRnk', 'ccnt', 'crto', 'convAmt']),
    timeRange: JSON.stringify({
      since: formatDateForStat(startDate),
      until: formatDateForStat(endDate),
    }),
  });

  const response = await naverAdRequest<StatResponse>('GET', `/stats?${params.toString()}`);
  return response.data || [];
}

// 키워드 통계 조회
export async function getKeywordStats(
  keywordIds: string[],
  startDate: string,
  endDate: string
): Promise<StatRecord[]> {
  const params = new URLSearchParams({
    ids: keywordIds.join(','),
    fields: JSON.stringify(['impCnt', 'clkCnt', 'salesAmt', 'ctr', 'cpc', 'avgRnk', 'ccnt', 'crto', 'convAmt']),
    timeRange: JSON.stringify({
      since: formatDateForStat(startDate),
      until: formatDateForStat(endDate),
    }),
  });

  const response = await naverAdRequest<StatResponse>('GET', `/stats?${params.toString()}`);
  return response.data || [];
}

// 전체 키워드 통계 조회 (캠페인 -> 광고그룹 -> 키워드 순차 조회)
export interface KeywordStat {
  keyword: string;
  impressions: number;
  clicks: number;
  ctr: number;
  avgPosition: number;
  cost: number;
  conversions: number;
}

export async function getAllKeywordStats(
  startDate: string,
  endDate: string
): Promise<KeywordStat[]> {
  try {
    // 1. 캠페인 목록 조회
    const campaigns = await getCampaigns();
    if (campaigns.length === 0) {
      console.log('No campaigns found');
      return [];
    }

    // 2. 모든 광고그룹 조회
    const allAdGroups: AdGroup[] = [];
    for (const campaign of campaigns) {
      const adGroups = await getAdGroups(campaign.nccCampaignId);
      allAdGroups.push(...adGroups);
    }

    if (allAdGroups.length === 0) {
      console.log('No ad groups found');
      return [];
    }

    // 3. 모든 키워드 조회
    const allKeywords: Keyword[] = [];
    for (const adGroup of allAdGroups) {
      const keywords = await getKeywords(adGroup.nccAdgroupId);
      allKeywords.push(...keywords);
    }

    if (allKeywords.length === 0) {
      console.log('No keywords found');
      return [];
    }

    // 4. 키워드 통계 조회 (배치로 처리 - 한 번에 최대 100개)
    const keywordStats: KeywordStat[] = [];
    const batchSize = 100;

    for (let i = 0; i < allKeywords.length; i += batchSize) {
      const batch = allKeywords.slice(i, i + batchSize);
      const keywordIds = batch.map(k => k.nccKeywordId);

      const stats = await getKeywordStats(keywordIds, startDate, endDate);

      // 키워드 ID와 매칭하여 결과 생성
      for (const stat of stats) {
        const keyword = batch.find(k => k.nccKeywordId === stat.id);
        if (keyword) {
          keywordStats.push({
            keyword: keyword.keyword,
            impressions: stat.impCnt || 0,
            clicks: stat.clkCnt || 0,
            ctr: stat.ctr || 0,
            avgPosition: stat.avgRnk || 0,
            cost: stat.salesAmt || 0,
            conversions: stat.ccnt || 0,
          });
        }
      }
    }

    // 클릭수 기준 내림차순 정렬
    return keywordStats.sort((a, b) => b.clicks - a.clicks);
  } catch (error) {
    console.error('Error fetching keyword stats:', error);
    return [];
  }
}

// 일별 통계 조회 (캠페인 전체)
export interface DailyStatRecord {
  date: string;
  impCnt: number;      // 노출수
  clkCnt: number;      // 클릭수
  salesAmt: number;    // 광고비
  ctr: number;         // 클릭률
  cpc: number;         // 클릭당 비용
  ccnt: number;        // 전환수
}

// 단일 날짜 통계 조회 (더 정확한 일별 데이터)
export async function getSingleDayStats(
  campaignIds: string[],
  date: string
): Promise<DailyStatRecord | null> {
  if (!campaignIds || campaignIds.length === 0) {
    return null;
  }

  try {
    const params = new URLSearchParams({
      ids: campaignIds.join(','),
      fields: JSON.stringify(['impCnt', 'clkCnt', 'salesAmt', 'ctr', 'cpc', 'ccnt']),
      timeRange: JSON.stringify({
        since: formatDateForStat(date),
        until: formatDateForStat(date),
      }),
    });

    const response = await naverAdRequest<StatResponse>('GET', `/stats?${params.toString()}`);

    if (!response || !response.data || response.data.length === 0) {
      return null;
    }

    // 모든 캠페인 합산
    const totals = response.data.reduce(
      (acc, record) => ({
        impCnt: acc.impCnt + (record.impCnt || 0),
        clkCnt: acc.clkCnt + (record.clkCnt || 0),
        salesAmt: acc.salesAmt + (record.salesAmt || 0),
        ccnt: acc.ccnt + (record.ccnt || 0),
      }),
      { impCnt: 0, clkCnt: 0, salesAmt: 0, ccnt: 0 }
    );

    return {
      date,
      impCnt: totals.impCnt,
      clkCnt: totals.clkCnt,
      salesAmt: totals.salesAmt,
      ccnt: totals.ccnt,
      ctr: totals.impCnt > 0 ? (totals.clkCnt / totals.impCnt) * 100 : 0,
      cpc: totals.clkCnt > 0 ? totals.salesAmt / totals.clkCnt : 0,
    };
  } catch (error) {
    console.error('getSingleDayStats error:', error);
    return null;
  }
}

// 여러 날짜 통계 조회 (하루씩 개별 조회)
export async function getMultipleDaysStats(
  campaignIds: string[],
  dates: string[]
): Promise<DailyStatRecord[]> {
  const results: DailyStatRecord[] = [];

  for (const date of dates) {
    const stat = await getSingleDayStats(campaignIds, date);
    if (stat && (stat.impCnt > 0 || stat.clkCnt > 0 || stat.salesAmt > 0)) {
      results.push(stat);
    }
    // Rate limit 방지
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return results.sort((a, b) => a.date.localeCompare(b.date));
}

export async function getDailyStats(
  campaignIds: string[],
  startDate: string,
  endDate: string
): Promise<DailyStatRecord[]> {
  if (!campaignIds || campaignIds.length === 0) {
    console.log('getDailyStats: No campaign IDs provided');
    return [];
  }

  try {
    const params = new URLSearchParams({
      ids: campaignIds.join(','),
      fields: JSON.stringify(['impCnt', 'clkCnt', 'salesAmt', 'ctr', 'cpc', 'ccnt']),
      timeRange: JSON.stringify({
        since: formatDateForStat(startDate),
        until: formatDateForStat(endDate),
      }),
      timeIncrement: 'daily',
    });

    const response = await naverAdRequest<{ data: Array<{ time?: string; stat_dt?: string } & StatRecord> }>(
      'GET',
      `/stats?${params.toString()}`
    );

    // API 응답 검증
    if (!response || !response.data || !Array.isArray(response.data)) {
      console.log('getDailyStats: Invalid API response format', response);
      return [];
    }

    // 날짜별로 집계
    const dailyMap = new Map<string, DailyStatRecord>();

    for (const record of response.data) {
      // time 또는 stat_dt 필드에서 날짜 추출 (API 버전에 따라 다를 수 있음)
      const rawDate = record.time || record.stat_dt;
      if (!rawDate || typeof rawDate !== 'string') {
        console.log('getDailyStats: Record missing date field', record);
        continue;
      }

      // YYYYMMDD 형식을 YYYY-MM-DD로 변환
      let formattedDate: string;
      if (rawDate.includes('-')) {
        formattedDate = rawDate.slice(0, 10); // 이미 YYYY-MM-DD 형식
      } else if (rawDate.length >= 8) {
        formattedDate = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;
      } else {
        console.log('getDailyStats: Invalid date format', rawDate);
        continue;
      }

      const existing = dailyMap.get(formattedDate);

      if (existing) {
        existing.impCnt += record.impCnt || 0;
        existing.clkCnt += record.clkCnt || 0;
        existing.salesAmt += record.salesAmt || 0;
        existing.ccnt += record.ccnt || 0;
      } else {
        dailyMap.set(formattedDate, {
          date: formattedDate,
          impCnt: record.impCnt || 0,
          clkCnt: record.clkCnt || 0,
          salesAmt: record.salesAmt || 0,
          ctr: 0,
          cpc: 0,
          ccnt: record.ccnt || 0,
        });
      }
    }

    // CTR, CPC 계산
    const result = Array.from(dailyMap.values()).map(stat => ({
      ...stat,
      ctr: stat.impCnt > 0 ? (stat.clkCnt / stat.impCnt) * 100 : 0,
      cpc: stat.clkCnt > 0 ? stat.salesAmt / stat.clkCnt : 0,
    }));

    return result.sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('getDailyStats error:', error);
    return [];
  }
}

// 캠페인별 통계 조회 (캠페인 정보 + 통계 합산)
export interface CampaignWithStats {
  id: string;
  name: string;
  status: string;
  dailyBudget: number;
  impCnt: number;
  clkCnt: number;
  salesAmt: number;
  ctr: number;
  cpc: number;
  ccnt: number;
}

export async function getCampaignsWithStats(
  startDate: string,
  endDate: string
): Promise<CampaignWithStats[]> {
  // 1. 캠페인 목록 조회
  const campaigns = await getCampaigns();
  if (campaigns.length === 0) return [];

  // 2. 캠페인 통계 조회
  const campaignIds = campaigns.map(c => c.nccCampaignId);
  const stats = await getCampaignStats(campaignIds, startDate, endDate);

  // 3. 통계 매핑
  const statsMap = new Map<string, StatRecord>();
  for (const stat of stats) {
    statsMap.set(stat.id, stat);
  }

  return campaigns.map(campaign => {
    const stat = statsMap.get(campaign.nccCampaignId);
    return {
      id: campaign.nccCampaignId,
      name: campaign.name,
      status: campaign.status,
      dailyBudget: campaign.dailyBudget,
      impCnt: stat?.impCnt || 0,
      clkCnt: stat?.clkCnt || 0,
      salesAmt: stat?.salesAmt || 0,
      ctr: stat?.ctr || 0,
      cpc: stat?.cpc || 0,
      ccnt: stat?.ccnt || 0,
    };
  });
}

// 광고 요약 통계 조회
export interface AdSummary {
  totalCost: number;
  totalClicks: number;
  totalImpressions: number;
  avgCtr: number;
  avgCpc: number;
  totalConversions: number;
}

export async function getAdSummary(
  startDate: string,
  endDate: string
): Promise<AdSummary> {
  const campaigns = await getCampaigns();
  if (campaigns.length === 0) {
    return {
      totalCost: 0,
      totalClicks: 0,
      totalImpressions: 0,
      avgCtr: 0,
      avgCpc: 0,
      totalConversions: 0,
    };
  }

  const campaignIds = campaigns.map(c => c.nccCampaignId);
  const stats = await getCampaignStats(campaignIds, startDate, endDate);

  const summary = stats.reduce(
    (acc, stat) => ({
      totalCost: acc.totalCost + (stat.salesAmt || 0),
      totalClicks: acc.totalClicks + (stat.clkCnt || 0),
      totalImpressions: acc.totalImpressions + (stat.impCnt || 0),
      totalConversions: acc.totalConversions + (stat.ccnt || 0),
    }),
    { totalCost: 0, totalClicks: 0, totalImpressions: 0, totalConversions: 0 }
  );

  return {
    ...summary,
    avgCtr: summary.totalImpressions > 0
      ? (summary.totalClicks / summary.totalImpressions) * 100
      : 0,
    avgCpc: summary.totalClicks > 0
      ? summary.totalCost / summary.totalClicks
      : 0,
  };
}

// 주간별 통계 조회
export interface WeeklyStatRecord {
  weekStart: string;   // 주 시작일 (월요일)
  weekEnd: string;     // 주 종료일 (일요일)
  weekLabel: string;   // 주차 라벨 (예: "12월 3주")
  impCnt: number;
  clkCnt: number;
  salesAmt: number;
  ctr: number;
  cpc: number;
  ccnt: number;
}

export async function getWeeklyStats(
  weeks: number = 8
): Promise<WeeklyStatRecord[]> {
  try {
    const campaigns = await getCampaigns();
    if (campaigns.length === 0) return [];

    const campaignIds = campaigns.map(c => c.nccCampaignId);
    const results: WeeklyStatRecord[] = [];

    // 이번 주 월요일 계산
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const thisMonday = new Date(today);
    thisMonday.setDate(today.getDate() + mondayOffset);
    thisMonday.setHours(0, 0, 0, 0);

    // 최근 N주 데이터 조회
    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date(thisMonday);
      weekStart.setDate(thisMonday.getDate() - (i * 7));

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      // 미래 날짜 방지
      const endDate = weekEnd > today ? today : weekEnd;

      const startStr = weekStart.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      const stats = await getCampaignStats(campaignIds, startStr, endStr);

      const totals = stats.reduce(
        (acc, stat) => ({
          impCnt: acc.impCnt + (stat.impCnt || 0),
          clkCnt: acc.clkCnt + (stat.clkCnt || 0),
          salesAmt: acc.salesAmt + (stat.salesAmt || 0),
          ccnt: acc.ccnt + (stat.ccnt || 0),
        }),
        { impCnt: 0, clkCnt: 0, salesAmt: 0, ccnt: 0 }
      );

      // 주차 라벨 생성 (예: "12월 3주")
      const month = weekStart.getMonth() + 1;
      const weekOfMonth = Math.ceil(weekStart.getDate() / 7);
      const weekLabel = `${month}월 ${weekOfMonth}주`;

      results.push({
        weekStart: startStr,
        weekEnd: endStr,
        weekLabel,
        impCnt: totals.impCnt,
        clkCnt: totals.clkCnt,
        salesAmt: totals.salesAmt,
        ctr: totals.impCnt > 0 ? (totals.clkCnt / totals.impCnt) * 100 : 0,
        cpc: totals.clkCnt > 0 ? totals.salesAmt / totals.clkCnt : 0,
        ccnt: totals.ccnt,
      });
    }

    // 오래된 주차가 먼저 오도록 정렬
    return results.reverse();
  } catch (error) {
    console.error('getWeeklyStats error:', error);
    return [];
  }
}

// 월별 통계 조회
export interface MonthlyStatRecord {
  month: string;       // YYYY-MM 형식
  monthLabel: string;  // 라벨 (예: "2024년 12월")
  impCnt: number;
  clkCnt: number;
  salesAmt: number;
  ctr: number;
  cpc: number;
  ccnt: number;
}

export async function getMonthlyStats(
  months: number = 12
): Promise<MonthlyStatRecord[]> {
  try {
    const campaigns = await getCampaigns();
    if (campaigns.length === 0) return [];

    const campaignIds = campaigns.map(c => c.nccCampaignId);
    const results: MonthlyStatRecord[] = [];
    const today = new Date();

    for (let i = 0; i < months; i++) {
      const targetDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
      const monthEnd = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

      // 미래 날짜 방지
      const endDate = monthEnd > today ? today : monthEnd;

      const startStr = monthStart.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      const stats = await getCampaignStats(campaignIds, startStr, endStr);

      const totals = stats.reduce(
        (acc, stat) => ({
          impCnt: acc.impCnt + (stat.impCnt || 0),
          clkCnt: acc.clkCnt + (stat.clkCnt || 0),
          salesAmt: acc.salesAmt + (stat.salesAmt || 0),
          ccnt: acc.ccnt + (stat.ccnt || 0),
        }),
        { impCnt: 0, clkCnt: 0, salesAmt: 0, ccnt: 0 }
      );

      const year = monthStart.getFullYear();
      const month = monthStart.getMonth() + 1;

      results.push({
        month: `${year}-${String(month).padStart(2, '0')}`,
        monthLabel: `${year}년 ${month}월`,
        impCnt: totals.impCnt,
        clkCnt: totals.clkCnt,
        salesAmt: totals.salesAmt,
        ctr: totals.impCnt > 0 ? (totals.clkCnt / totals.impCnt) * 100 : 0,
        cpc: totals.clkCnt > 0 ? totals.salesAmt / totals.clkCnt : 0,
        ccnt: totals.ccnt,
      });
    }

    // 오래된 월이 먼저 오도록 정렬
    return results.reverse();
  } catch (error) {
    console.error('getMonthlyStats error:', error);
    return [];
  }
}

// 연간 통계 조회 (월별 추이)
export interface YearlyStatRecord {
  year: number;
  month: number;
  monthLabel: string;  // 예: "1월", "2월"
  impCnt: number;
  clkCnt: number;
  salesAmt: number;
  ctr: number;
  cpc: number;
  ccnt: number;
}

export async function getYearlyStats(
  year?: number
): Promise<{ currentYear: YearlyStatRecord[]; previousYear: YearlyStatRecord[] }> {
  try {
    const campaigns = await getCampaigns();
    if (campaigns.length === 0) return { currentYear: [], previousYear: [] };

    const campaignIds = campaigns.map(c => c.nccCampaignId);
    const today = new Date();
    const targetYear = year || today.getFullYear();

    const fetchYearData = async (yr: number): Promise<YearlyStatRecord[]> => {
      const results: YearlyStatRecord[] = [];
      const maxMonth = yr === today.getFullYear() ? today.getMonth() + 1 : 12;

      for (let month = 1; month <= maxMonth; month++) {
        const monthStart = new Date(yr, month - 1, 1);
        const monthEnd = new Date(yr, month, 0);

        // 미래 날짜 방지
        const endDate = monthEnd > today ? today : monthEnd;

        const startStr = monthStart.toISOString().split('T')[0];
        const endStr = endDate.toISOString().split('T')[0];

        const stats = await getCampaignStats(campaignIds, startStr, endStr);

        const totals = stats.reduce(
          (acc, stat) => ({
            impCnt: acc.impCnt + (stat.impCnt || 0),
            clkCnt: acc.clkCnt + (stat.clkCnt || 0),
            salesAmt: acc.salesAmt + (stat.salesAmt || 0),
            ccnt: acc.ccnt + (stat.ccnt || 0),
          }),
          { impCnt: 0, clkCnt: 0, salesAmt: 0, ccnt: 0 }
        );

        results.push({
          year: yr,
          month,
          monthLabel: `${month}월`,
          impCnt: totals.impCnt,
          clkCnt: totals.clkCnt,
          salesAmt: totals.salesAmt,
          ctr: totals.impCnt > 0 ? (totals.clkCnt / totals.impCnt) * 100 : 0,
          cpc: totals.clkCnt > 0 ? totals.salesAmt / totals.clkCnt : 0,
          ccnt: totals.ccnt,
        });
      }

      return results;
    };

    const [currentYear, previousYear] = await Promise.all([
      fetchYearData(targetYear),
      fetchYearData(targetYear - 1),
    ]);

    return { currentYear, previousYear };
  } catch (error) {
    console.error('getYearlyStats error:', error);
    return { currentYear: [], previousYear: [] };
  }
}

// 전월 대비 분석
export interface MonthComparisonResult {
  current: {
    month: string;
    salesAmt: number;
    clkCnt: number;
    impCnt: number;
    ctr: number;
    cpc: number;
  };
  previous: {
    month: string;
    salesAmt: number;
    clkCnt: number;
    impCnt: number;
    ctr: number;
    cpc: number;
  };
  changes: {
    salesAmt: number;  // 퍼센트 변화율
    clkCnt: number;
    impCnt: number;
    ctr: number;       // 포인트 변화
    cpc: number;       // 퍼센트 변화율
  };
}

export async function getMonthComparison(): Promise<MonthComparisonResult | null> {
  try {
    const campaigns = await getCampaigns();
    if (campaigns.length === 0) return null;

    const campaignIds = campaigns.map(c => c.nccCampaignId);
    const today = new Date();

    // 이번 달
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const currentMonthEnd = today;

    // 지난 달
    const previousMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const previousMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);

    const [currentStats, previousStats] = await Promise.all([
      getCampaignStats(
        campaignIds,
        currentMonthStart.toISOString().split('T')[0],
        currentMonthEnd.toISOString().split('T')[0]
      ),
      getCampaignStats(
        campaignIds,
        previousMonthStart.toISOString().split('T')[0],
        previousMonthEnd.toISOString().split('T')[0]
      ),
    ]);

    const sumStats = (stats: StatRecord[]) => stats.reduce(
      (acc, stat) => ({
        salesAmt: acc.salesAmt + (stat.salesAmt || 0),
        clkCnt: acc.clkCnt + (stat.clkCnt || 0),
        impCnt: acc.impCnt + (stat.impCnt || 0),
      }),
      { salesAmt: 0, clkCnt: 0, impCnt: 0 }
    );

    const current = sumStats(currentStats);
    const previous = sumStats(previousStats);

    const currentCtr = current.impCnt > 0 ? (current.clkCnt / current.impCnt) * 100 : 0;
    const currentCpc = current.clkCnt > 0 ? current.salesAmt / current.clkCnt : 0;
    const previousCtr = previous.impCnt > 0 ? (previous.clkCnt / previous.impCnt) * 100 : 0;
    const previousCpc = previous.clkCnt > 0 ? previous.salesAmt / previous.clkCnt : 0;

    const calcChange = (curr: number, prev: number): number => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };

    return {
      current: {
        month: `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`,
        salesAmt: current.salesAmt,
        clkCnt: current.clkCnt,
        impCnt: current.impCnt,
        ctr: currentCtr,
        cpc: currentCpc,
      },
      previous: {
        month: `${previousMonthStart.getFullYear()}-${String(previousMonthStart.getMonth() + 1).padStart(2, '0')}`,
        salesAmt: previous.salesAmt,
        clkCnt: previous.clkCnt,
        impCnt: previous.impCnt,
        ctr: previousCtr,
        cpc: previousCpc,
      },
      changes: {
        salesAmt: calcChange(current.salesAmt, previous.salesAmt),
        clkCnt: calcChange(current.clkCnt, previous.clkCnt),
        impCnt: calcChange(current.impCnt, previous.impCnt),
        ctr: currentCtr - previousCtr, // 포인트 차이
        cpc: calcChange(currentCpc, previousCpc),
      },
    };
  } catch (error) {
    console.error('getMonthComparison error:', error);
    return null;
  }
}

// ============================================
// 키워드 검색량 조회 (RelKwdStat)
// ============================================

export interface KeywordSearchVolume {
  keyword: string;
  monthlyPcQcCnt: number;      // PC 월간 검색수
  monthlyMobileQcCnt: number;  // 모바일 월간 검색수
  totalSearchCnt: number;       // 총 월간 검색수
  monthlyAvePcClkCnt: number;  // PC 월평균 클릭수
  monthlyAveMobileClkCnt: number; // 모바일 월평균 클릭수
  compIdx: string;              // 경쟁지수 (높음/중간/낮음)
  plAvgDepth: number;          // 광고 평균 노출 순위
}

// 키워드 검색량 조회
export async function getKeywordSearchVolume(
  keywords: string[]
): Promise<KeywordSearchVolume[]> {
  try {
    if (!keywords || keywords.length === 0) return [];

    // 최대 5개씩 나누어 조회 (API 제한)
    const results: KeywordSearchVolume[] = [];
    const batchSize = 5;

    for (let i = 0; i < keywords.length; i += batchSize) {
      const batch = keywords.slice(i, i + batchSize);

      const response = await naverAdRequest<{
        keywordList: Array<{
          relKeyword: string;
          monthlyPcQcCnt: number | string;
          monthlyMobileQcCnt: number | string;
          monthlyAvePcClkCnt: number;
          monthlyAveMobileClkCnt: number;
          monthlyAvePcCtr: number;
          monthlyAveMobileCtr: number;
          compIdx: string;
          plAvgDepth: number;
        }>;
      }>('GET', `/keywordstool?hintKeywords=${encodeURIComponent(batch.join(','))}&showDetail=1`);

      if (response.keywordList) {
        for (const kw of response.keywordList) {
          // "< 10" 같은 문자열 처리
          const pcCnt = typeof kw.monthlyPcQcCnt === 'string'
            ? (kw.monthlyPcQcCnt.includes('<') ? 5 : parseInt(kw.monthlyPcQcCnt) || 0)
            : kw.monthlyPcQcCnt || 0;
          const mobileCnt = typeof kw.monthlyMobileQcCnt === 'string'
            ? (kw.monthlyMobileQcCnt.includes('<') ? 5 : parseInt(kw.monthlyMobileQcCnt) || 0)
            : kw.monthlyMobileQcCnt || 0;

          results.push({
            keyword: kw.relKeyword,
            monthlyPcQcCnt: pcCnt,
            monthlyMobileQcCnt: mobileCnt,
            totalSearchCnt: pcCnt + mobileCnt,
            monthlyAvePcClkCnt: kw.monthlyAvePcClkCnt || 0,
            monthlyAveMobileClkCnt: kw.monthlyAveMobileClkCnt || 0,
            compIdx: kw.compIdx || '낮음',
            plAvgDepth: kw.plAvgDepth || 0,
          });
        }
      }
    }

    return results;
  } catch (error) {
    console.error('getKeywordSearchVolume error:', error);
    return [];
  }
}

// 현재 등록된 키워드들의 검색량 조회
export async function getRegisteredKeywordsSearchVolume(
  startDate: string,
  endDate: string
): Promise<Array<KeywordStat & KeywordSearchVolume>> {
  try {
    // 1. 등록된 키워드 목록 조회
    const keywordStats = await getAllKeywordStats(startDate, endDate);
    if (keywordStats.length === 0) return [];

    // 2. 키워드명 추출
    const keywordNames = keywordStats.map(k => k.keyword);

    // 3. 검색량 조회
    const searchVolumes = await getKeywordSearchVolume(keywordNames);
    const volumeMap = new Map(searchVolumes.map(v => [v.keyword, v]));

    // 4. 병합
    return keywordStats.map(stat => ({
      ...stat,
      monthlyPcQcCnt: volumeMap.get(stat.keyword)?.monthlyPcQcCnt || 0,
      monthlyMobileQcCnt: volumeMap.get(stat.keyword)?.monthlyMobileQcCnt || 0,
      totalSearchCnt: volumeMap.get(stat.keyword)?.totalSearchCnt || 0,
      monthlyAvePcClkCnt: volumeMap.get(stat.keyword)?.monthlyAvePcClkCnt || 0,
      monthlyAveMobileClkCnt: volumeMap.get(stat.keyword)?.monthlyAveMobileClkCnt || 0,
      compIdx: volumeMap.get(stat.keyword)?.compIdx || '낮음',
      plAvgDepth: volumeMap.get(stat.keyword)?.plAvgDepth || 0,
    }));
  } catch (error) {
    console.error('getRegisteredKeywordsSearchVolume error:', error);
    return [];
  }
}

// API 연결 테스트
export async function testConnection(): Promise<boolean> {
  try {
    await getCampaigns();
    return true;
  } catch (error) {
    console.error('Naver Ad API connection test failed:', error);
    return false;
  }
}
