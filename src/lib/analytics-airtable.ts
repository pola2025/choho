/**
 * Analytics 데이터를 Airtable에 저장/조회하는 라이브러리
 */

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_ANALYTICS_BASE_ID;

const TABLES = {
  summary: process.env.AIRTABLE_ANALYTICS_SUMMARY_TABLE,
  pages: process.env.AIRTABLE_ANALYTICS_PAGES_TABLE,
  sources: process.env.AIRTABLE_ANALYTICS_SOURCES_TABLE,
  devices: process.env.AIRTABLE_ANALYTICS_DEVICES_TABLE,
  keywords: process.env.AIRTABLE_ANALYTICS_KEYWORDS_TABLE,
  naverKeywords: process.env.AIRTABLE_NAVER_KEYWORDS_TABLE,
  naverAdDaily: process.env.AIRTABLE_NAVER_AD_DAILY_TABLE,
  naverAdCampaigns: process.env.AIRTABLE_NAVER_AD_CAMPAIGNS_TABLE,
} as const;

type TableName = keyof typeof TABLES;

interface AirtableRecord {
  id?: string;
  fields: Record<string, unknown>;
}

// Airtable API 호출 헬퍼
async function airtableRequest(
  tableId: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  body?: unknown,
  params?: Record<string, string>
) {
  const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${tableId}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    method,
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Airtable API error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

// 레코드 조회 (날짜 기준)
export async function getRecordsByDate(
  table: TableName,
  date: string
): Promise<AirtableRecord[]> {
  const tableId = TABLES[table];
  if (!tableId) throw new Error(`Unknown table: ${table}`);

  // Airtable Date 필드는 IS_SAME 함수로 비교
  const result = await airtableRequest(tableId, 'GET', undefined, {
    filterByFormula: `IS_SAME({date}, '${date}', 'day')`,
  });

  return result.records || [];
}

// 레코드 조회 (날짜 범위)
export async function getRecordsByDateRange(
  table: TableName,
  startDate: string,
  endDate: string
): Promise<AirtableRecord[]> {
  const tableId = TABLES[table];
  if (!tableId) throw new Error(`Unknown table: ${table}`);

  // Airtable Date 필드는 IS_AFTER, IS_BEFORE 함수로 비교
  const result = await airtableRequest(tableId, 'GET', undefined, {
    filterByFormula: `AND(IS_AFTER({date}, DATEADD('${startDate}', -1, 'day')), IS_BEFORE({date}, DATEADD('${endDate}', 1, 'day')))`,
    'sort[0][field]': 'date',
    'sort[0][direction]': 'desc',
  });

  return result.records || [];
}

// 레코드 생성
export async function createRecords(
  table: TableName,
  records: Array<Record<string, unknown>>
): Promise<AirtableRecord[]> {
  const tableId = TABLES[table];
  if (!tableId) throw new Error(`Unknown table: ${table}`);

  // Airtable은 한 번에 10개까지만 생성 가능
  const batches: Array<Record<string, unknown>[]> = [];
  for (let i = 0; i < records.length; i += 10) {
    batches.push(records.slice(i, i + 10));
  }

  const allRecords: AirtableRecord[] = [];
  for (const batch of batches) {
    const result = await airtableRequest(tableId, 'POST', {
      records: batch.map((fields) => ({ fields })),
    });
    allRecords.push(...(result.records || []));
  }

  return allRecords;
}

// 레코드 업데이트
export async function updateRecords(
  table: TableName,
  records: Array<{ id: string; fields: Record<string, unknown> }>
): Promise<AirtableRecord[]> {
  const tableId = TABLES[table];
  if (!tableId) throw new Error(`Unknown table: ${table}`);

  // Airtable은 한 번에 10개까지만 업데이트 가능
  const batches: Array<{ id: string; fields: Record<string, unknown> }[]> = [];
  for (let i = 0; i < records.length; i += 10) {
    batches.push(records.slice(i, i + 10));
  }

  const allRecords: AirtableRecord[] = [];
  for (const batch of batches) {
    const result = await airtableRequest(tableId, 'PATCH', {
      records: batch,
    });
    allRecords.push(...(result.records || []));
  }

  return allRecords;
}

// 레코드 삭제 (날짜 기준)
export async function deleteRecordsByDate(
  table: TableName,
  date: string
): Promise<number> {
  const existing = await getRecordsByDate(table, date);
  if (existing.length === 0) return 0;

  const tableId = TABLES[table];
  if (!tableId) throw new Error(`Unknown table: ${table}`);

  // Airtable은 한 번에 10개까지만 삭제 가능
  const ids = existing.map((r) => r.id).filter(Boolean) as string[];
  for (let i = 0; i < ids.length; i += 10) {
    const batch = ids.slice(i, i + 10);
    const params: Record<string, string> = {};
    batch.forEach((id, index) => {
      params[`records[${index}]`] = id;
    });
    await airtableRequest(tableId, 'DELETE', undefined, params);
  }

  return ids.length;
}

// Upsert: 있으면 업데이트, 없으면 생성 (날짜 기준)
export async function upsertByDate(
  table: TableName,
  date: string,
  records: Array<Record<string, unknown>>
): Promise<{ created: number; updated: number; deleted: number }> {
  // 기존 레코드 삭제
  const deleted = await deleteRecordsByDate(table, date);

  // 새 레코드 생성
  if (records.length > 0) {
    await createRecords(table, records);
  }

  return {
    created: records.length,
    updated: 0,
    deleted,
  };
}

// Summary 데이터 저장
export async function saveSummary(
  date: string,
  data: {
    totalUsers: number;
    newUsers: number;
    sessions: number;
    pageViews: number;
    avgSessionDuration: number;
    bounceRate: number;
  }
) {
  return upsertByDate('summary', date, [
    {
      date,
      ...data,
      syncedAt: new Date().toISOString(),
    },
  ]);
}

// Pages 데이터 저장
export async function savePages(
  date: string,
  pages: Array<{ path: string; title: string; views: number }>
) {
  const records = pages.map((page) => ({
    date,
    ...page,
    syncedAt: new Date().toISOString(),
  }));
  return upsertByDate('pages', date, records);
}

// Sources 데이터 저장
export async function saveSources(
  date: string,
  sources: Array<{ source: string; medium: string; users: number; sessions: number }>
) {
  const records = sources.map((src) => ({
    date,
    ...src,
    syncedAt: new Date().toISOString(),
  }));
  return upsertByDate('sources', date, records);
}

// Devices 데이터 저장
export async function saveDevices(
  date: string,
  devices: Array<{ device: string; users: number; sessions: number; pageViews: number }>
) {
  const records = devices.map((dev) => ({
    date,
    ...dev,
    syncedAt: new Date().toISOString(),
  }));
  return upsertByDate('devices', date, records);
}

// Keywords 데이터 저장
export async function saveKeywords(
  date: string,
  keywords: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>
) {
  const records = keywords.map((kw) => ({
    date,
    ...kw,
    syncedAt: new Date().toISOString(),
  }));
  return upsertByDate('keywords', date, records);
}

// 최신 Summary 조회 (최근 N일 또는 날짜 범위)
export async function getLatestSummary(
  days: number = 30,
  startDateStr?: string,
  endDateStr?: string
) {
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  let start: string;
  let end: string;

  if (startDateStr && endDateStr) {
    // 날짜 범위가 지정된 경우
    start = startDateStr;
    end = endDateStr;
  } else {
    // days 기준으로 계산
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    start = formatDate(startDate);
    end = formatDate(endDate);
  }

  const records = await getRecordsByDateRange('summary', start, end);

  return records.map((r) => r.fields);
}

// 최신 Pages 조회 (최근 N일 또는 날짜 범위)
export async function getLatestPages(
  days: number = 30,
  startDateStr?: string,
  endDateStr?: string
) {
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  let start: string;
  let end: string;

  if (startDateStr && endDateStr) {
    start = startDateStr;
    end = endDateStr;
  } else {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    start = formatDate(startDate);
    end = formatDate(endDate);
  }

  const records = await getRecordsByDateRange('pages', start, end);
  return records.map((r) => r.fields);
}

// 최신 Sources 조회 (최근 N일 또는 날짜 범위)
export async function getLatestSources(
  days: number = 30,
  startDateStr?: string,
  endDateStr?: string
) {
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  let start: string;
  let end: string;

  if (startDateStr && endDateStr) {
    start = startDateStr;
    end = endDateStr;
  } else {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    start = formatDate(startDate);
    end = formatDate(endDate);
  }

  const records = await getRecordsByDateRange('sources', start, end);
  return records.map((r) => r.fields);
}

// 최신 Devices 조회 (최근 N일 또는 날짜 범위)
export async function getLatestDevices(
  days: number = 30,
  startDateStr?: string,
  endDateStr?: string
) {
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  let start: string;
  let end: string;

  if (startDateStr && endDateStr) {
    start = startDateStr;
    end = endDateStr;
  } else {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    start = formatDate(startDate);
    end = formatDate(endDate);
  }

  const records = await getRecordsByDateRange('devices', start, end);
  return records.map((r) => r.fields);
}

// 최신 Keywords 조회 (최근 N일 또는 날짜 범위)
export async function getLatestKeywords(
  days: number = 30,
  startDateStr?: string,
  endDateStr?: string
) {
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  let start: string;
  let end: string;

  if (startDateStr && endDateStr) {
    start = startDateStr;
    end = endDateStr;
  } else {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    start = formatDate(startDate);
    end = formatDate(endDate);
  }

  const records = await getRecordsByDateRange('keywords', start, end);
  return records.map((r) => r.fields);
}

// ============================================
// 네이버 검색광고 키워드 (월별 저장)
// ============================================

// 네이버 키워드 데이터 저장 (월별)
export async function saveNaverKeywords(
  yearMonth: string, // 'YYYY-MM' 형식
  keywords: Array<{
    keyword: string;
    impressions: number;
    clicks: number;
    ctr: number;
    avgPosition: number;
    cost: number;
    conversions: number;
  }>
) {
  // 기존 해당 월 데이터 삭제 후 새로 저장
  const tableId = TABLES.naverKeywords;
  if (!tableId) {
    console.log('AIRTABLE_NAVER_KEYWORDS_TABLE not configured');
    return { created: 0, updated: 0, deleted: 0 };
  }

  // 해당 월 데이터 조회 및 삭제
  const existing = await airtableRequest(tableId, 'GET', undefined, {
    filterByFormula: `{yearMonth} = '${yearMonth}'`,
  });

  const existingRecords = existing.records || [];
  if (existingRecords.length > 0) {
    const ids = existingRecords.map((r: AirtableRecord) => r.id).filter(Boolean) as string[];
    for (let i = 0; i < ids.length; i += 10) {
      const batch = ids.slice(i, i + 10);
      const params: Record<string, string> = {};
      batch.forEach((id, index) => {
        params[`records[${index}]`] = id;
      });
      await airtableRequest(tableId, 'DELETE', undefined, params);
    }
  }

  // 새 데이터 저장
  const records = keywords.map((kw) => ({
    yearMonth,
    ...kw,
    syncedAt: new Date().toISOString(),
  }));

  // Airtable은 한 번에 10개까지만 생성 가능
  const batches: typeof records[] = [];
  for (let i = 0; i < records.length; i += 10) {
    batches.push(records.slice(i, i + 10));
  }

  let created = 0;
  for (const batch of batches) {
    const result = await airtableRequest(tableId, 'POST', {
      records: batch.map((fields) => ({ fields })),
    });
    created += (result.records || []).length;
  }

  return {
    created,
    updated: 0,
    deleted: existingRecords.length,
  };
}

// 네이버 키워드 조회 (월별)
export async function getNaverKeywordsByMonth(yearMonth: string) {
  const tableId = TABLES.naverKeywords;
  if (!tableId) {
    console.log('AIRTABLE_NAVER_KEYWORDS_TABLE not configured');
    return [];
  }

  const result = await airtableRequest(tableId, 'GET', undefined, {
    filterByFormula: `{yearMonth} = '${yearMonth}'`,
    'sort[0][field]': 'clicks',
    'sort[0][direction]': 'desc',
  });

  return (result.records || []).map((r: AirtableRecord) => r.fields);
}

// 네이버 키워드 조회 (범위 - 여러 달)
export async function getNaverKeywordsRange(startYearMonth: string, endYearMonth: string) {
  const tableId = TABLES.naverKeywords;
  if (!tableId) {
    console.log('AIRTABLE_NAVER_KEYWORDS_TABLE not configured');
    return [];
  }

  const result = await airtableRequest(tableId, 'GET', undefined, {
    filterByFormula: `AND({yearMonth} >= '${startYearMonth}', {yearMonth} <= '${endYearMonth}')`,
    'sort[0][field]': 'yearMonth',
    'sort[0][direction]': 'desc',
  });

  return (result.records || []).map((r: AirtableRecord) => r.fields);
}

// 최근 N개월 네이버 키워드 추이 조회
export async function getNaverKeywordsTrend(months: number = 6) {
  const tableId = TABLES.naverKeywords;
  if (!tableId) {
    console.log('AIRTABLE_NAVER_KEYWORDS_TABLE not configured');
    return [];
  }

  // 최근 N개월 계산
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months + 1);

  const startYearMonth = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
  const endYearMonth = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}`;

  return getNaverKeywordsRange(startYearMonth, endYearMonth);
}

// ============================================
// 네이버 광고 일별 통계 (캐싱)
// ============================================

export interface NaverAdDailyRecord {
  date: string;
  impCnt: number;
  clkCnt: number;
  salesAmt: number;
  ctr: number;
  cpc: number;
  ccnt: number;
  syncedAt?: string;
}

// 네이버 광고 일별 데이터 저장
export async function saveNaverAdDaily(
  records: NaverAdDailyRecord[]
): Promise<{ created: number; updated: number; deleted: number }> {
  const tableId = TABLES.naverAdDaily;
  if (!tableId) {
    console.log('AIRTABLE_NAVER_AD_DAILY_TABLE not configured');
    return { created: 0, updated: 0, deleted: 0 };
  }

  let totalCreated = 0;
  let totalDeleted = 0;

  // 날짜별로 그룹화하여 upsert
  for (const record of records) {
    // 기존 데이터 삭제
    const existing = await airtableRequest(tableId, 'GET', undefined, {
      filterByFormula: `{date} = '${record.date}'`,
    });

    const existingRecords = existing.records || [];
    if (existingRecords.length > 0) {
      const ids = existingRecords.map((r: AirtableRecord) => r.id).filter(Boolean) as string[];
      for (let i = 0; i < ids.length; i += 10) {
        const batch = ids.slice(i, i + 10);
        const params: Record<string, string> = {};
        batch.forEach((id, index) => {
          params[`records[${index}]`] = id;
        });
        await airtableRequest(tableId, 'DELETE', undefined, params);
      }
      totalDeleted += ids.length;
    }

    // 새 데이터 저장
    await airtableRequest(tableId, 'POST', {
      records: [{
        fields: {
          ...record,
          syncedAt: new Date().toISOString(),
        }
      }],
    });
    totalCreated++;
  }

  return { created: totalCreated, updated: 0, deleted: totalDeleted };
}

// 네이버 광고 일별 데이터 조회 (날짜 범위)
export async function getNaverAdDaily(
  startDate: string,
  endDate: string
): Promise<NaverAdDailyRecord[]> {
  const tableId = TABLES.naverAdDaily;
  if (!tableId) {
    console.log('AIRTABLE_NAVER_AD_DAILY_TABLE not configured');
    return [];
  }

  const result = await airtableRequest(tableId, 'GET', undefined, {
    filterByFormula: `AND({date} >= '${startDate}', {date} <= '${endDate}')`,
    'sort[0][field]': 'date',
    'sort[0][direction]': 'asc',
  });

  return (result.records || []).map((r: AirtableRecord) => ({
    date: String(r.fields.date || ''),
    impCnt: Number(r.fields.impCnt) || 0,
    clkCnt: Number(r.fields.clkCnt) || 0,
    salesAmt: Number(r.fields.salesAmt) || 0,
    ctr: Number(r.fields.ctr) || 0,
    cpc: Number(r.fields.cpc) || 0,
    ccnt: Number(r.fields.ccnt) || 0,
    syncedAt: r.fields.syncedAt ? String(r.fields.syncedAt) : undefined,
  }));
}

// 네이버 광고 일별 데이터 중 누락된 날짜 확인
export async function getMissingNaverAdDates(
  startDate: string,
  endDate: string
): Promise<string[]> {
  const existingData = await getNaverAdDaily(startDate, endDate);
  const existingDates = new Set(existingData.map(d => d.date));

  const missingDates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date().toISOString().split('T')[0];

  while (current <= end) {
    const dateStr = current.toISOString().split('T')[0];
    // 오늘 날짜는 항상 갱신 필요 (당일 데이터 업데이트)
    if (!existingDates.has(dateStr) || dateStr === today) {
      missingDates.push(dateStr);
    }
    current.setDate(current.getDate() + 1);
  }

  return missingDates;
}

// ============================================
// 네이버 광고 캠페인별 통계 (캐싱)
// ============================================

export interface NaverAdCampaignRecord {
  date: string;
  campaignId: string;
  campaignName: string;
  status: string;
  dailyBudget: number;
  impCnt: number;
  clkCnt: number;
  salesAmt: number;
  ctr: number;
  cpc: number;
  ccnt: number;
  syncedAt?: string;
}

// 네이버 광고 캠페인별 데이터 저장
export async function saveNaverAdCampaigns(
  date: string,
  campaigns: Array<Omit<NaverAdCampaignRecord, 'date' | 'syncedAt'>>
): Promise<{ created: number; updated: number; deleted: number }> {
  const tableId = TABLES.naverAdCampaigns;
  if (!tableId) {
    console.log('AIRTABLE_NAVER_AD_CAMPAIGNS_TABLE not configured');
    return { created: 0, updated: 0, deleted: 0 };
  }

  // 해당 날짜 기존 데이터 삭제
  const existing = await airtableRequest(tableId, 'GET', undefined, {
    filterByFormula: `{date} = '${date}'`,
  });

  const existingRecords = existing.records || [];
  if (existingRecords.length > 0) {
    const ids = existingRecords.map((r: AirtableRecord) => r.id).filter(Boolean) as string[];
    for (let i = 0; i < ids.length; i += 10) {
      const batch = ids.slice(i, i + 10);
      const params: Record<string, string> = {};
      batch.forEach((id, index) => {
        params[`records[${index}]`] = id;
      });
      await airtableRequest(tableId, 'DELETE', undefined, params);
    }
  }

  // 새 데이터 저장
  const records = campaigns.map((c) => ({
    date,
    ...c,
    syncedAt: new Date().toISOString(),
  }));

  const batches: typeof records[] = [];
  for (let i = 0; i < records.length; i += 10) {
    batches.push(records.slice(i, i + 10));
  }

  let created = 0;
  for (const batch of batches) {
    const result = await airtableRequest(tableId, 'POST', {
      records: batch.map((fields) => ({ fields })),
    });
    created += (result.records || []).length;
  }

  return { created, updated: 0, deleted: existingRecords.length };
}

// 네이버 광고 캠페인별 데이터 조회 (날짜 범위)
export async function getNaverAdCampaigns(
  startDate: string,
  endDate: string
): Promise<NaverAdCampaignRecord[]> {
  const tableId = TABLES.naverAdCampaigns;
  if (!tableId) {
    console.log('AIRTABLE_NAVER_AD_CAMPAIGNS_TABLE not configured');
    return [];
  }

  const result = await airtableRequest(tableId, 'GET', undefined, {
    filterByFormula: `AND({date} >= '${startDate}', {date} <= '${endDate}')`,
    'sort[0][field]': 'date',
    'sort[0][direction]': 'desc',
  });

  return (result.records || []).map((r: AirtableRecord) => ({
    date: String(r.fields.date || ''),
    campaignId: String(r.fields.campaignId || ''),
    campaignName: String(r.fields.campaignName || ''),
    status: String(r.fields.status || ''),
    dailyBudget: Number(r.fields.dailyBudget) || 0,
    impCnt: Number(r.fields.impCnt) || 0,
    clkCnt: Number(r.fields.clkCnt) || 0,
    salesAmt: Number(r.fields.salesAmt) || 0,
    ctr: Number(r.fields.ctr) || 0,
    cpc: Number(r.fields.cpc) || 0,
    ccnt: Number(r.fields.ccnt) || 0,
    syncedAt: r.fields.syncedAt ? String(r.fields.syncedAt) : undefined,
  }));
}
