/**
 * Analytics 데이터 저장/조회 라이브러리 (Cloudflare D1)
 * - 기존 Airtable 구현을 D1 proxy 기반으로 교체. export 시그니처는 동일하게 유지.
 * - 파일명은 호환을 위해 유지 (analytics-airtable).
 */
import { d1Query, d1Batch, d1Run, type D1Statement } from "./d1";

const TABLE_MAP = {
  summary: "analytics_summary",
  pages: "analytics_pages",
  sources: "analytics_sources",
  devices: "analytics_devices",
  keywords: "analytics_keywords",
  naverKeywords: "naver_keywords",
  naverAdDaily: "naver_ad_daily",
  naverAdCampaigns: "naver_ad_campaigns",
  naverAdCampaignDaily: "naver_ad_campaign_daily",
} as const;

type TableName = keyof typeof TABLE_MAP;

interface AirtableRecord {
  id?: string;
  fields: Record<string, unknown>;
}

type Param = string | number | null;

// 컬럼은 D1 스키마에 실제 존재하는 것만 허용 (id/order 등 자동 컬럼 제외)
function buildInsert(table: string, fields: Record<string, unknown>): D1Statement {
  const cols = Object.keys(fields).filter((k) => k !== "id");
  const params: Param[] = cols.map((c) => {
    const v = fields[c];
    if (v == null) return null;
    if (typeof v === "boolean") return v ? 1 : 0;
    if (typeof v === "number") return v;
    return String(v);
  });
  return {
    sql: `INSERT INTO ${table} (${cols.map((c) => `"${c}"`).join(",")}) VALUES (${cols
      .map(() => "?")
      .join(",")})`,
    params,
  };
}

const nowIso = () => new Date().toISOString();

// ── 저수준 (호환 유지) ──

export async function getRecordsByDate(table: TableName, date: string): Promise<AirtableRecord[]> {
  const t = TABLE_MAP[table];
  const rows = await d1Query<Record<string, unknown>>(`SELECT * FROM ${t} WHERE date = ?`, [date]);
  return rows.map((r) => ({ id: String(r.id ?? ""), fields: r }));
}

export async function getRecordsByDateRange(
  table: TableName,
  startDate: string,
  endDate: string
): Promise<AirtableRecord[]> {
  const t = TABLE_MAP[table];
  const rows = await d1Query<Record<string, unknown>>(
    `SELECT * FROM ${t} WHERE date >= ? AND date <= ? ORDER BY date DESC`,
    [startDate, endDate]
  );
  return rows.map((r) => ({ id: String(r.id ?? ""), fields: r }));
}

export async function createRecords(
  table: TableName,
  records: Array<Record<string, unknown>>
): Promise<AirtableRecord[]> {
  const t = TABLE_MAP[table];
  if (records.length === 0) return [];
  await d1Batch(records.map((f) => buildInsert(t, f)));
  return records.map((f) => ({ fields: f }));
}

export async function updateRecords(
  table: TableName,
  records: Array<{ id: string; fields: Record<string, unknown> }>
): Promise<AirtableRecord[]> {
  const t = TABLE_MAP[table];
  const stmts: D1Statement[] = records.map(({ id, fields }) => {
    const cols = Object.keys(fields).filter((k) => k !== "id");
    const params: Param[] = cols.map((c) => {
      const v = fields[c];
      if (v == null) return null;
      if (typeof v === "boolean") return v ? 1 : 0;
      if (typeof v === "number") return v;
      return String(v);
    });
    return {
      sql: `UPDATE ${t} SET ${cols.map((c) => `"${c}" = ?`).join(", ")} WHERE id = ?`,
      params: [...params, id],
    };
  });
  await d1Batch(stmts);
  return records.map((r) => ({ id: r.id, fields: r.fields }));
}

export async function deleteRecordsByDate(table: TableName, date: string): Promise<number> {
  const t = TABLE_MAP[table];
  await d1Run(`DELETE FROM ${t} WHERE date = ?`, [date]);
  return 0;
}

export async function upsertByDate(
  table: TableName,
  date: string,
  records: Array<Record<string, unknown>>
): Promise<{ created: number; updated: number; deleted: number }> {
  const t = TABLE_MAP[table];
  const stmts: D1Statement[] = [{ sql: `DELETE FROM ${t} WHERE date = ?`, params: [date] }];
  for (const f of records) stmts.push(buildInsert(t, f));
  await d1Batch(stmts);
  return { created: records.length, updated: 0, deleted: 0 };
}

// ── Summary / Pages / Sources / Devices / Keywords 저장 ──

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
  return upsertByDate("summary", date, [{ date, ...data, syncedAt: nowIso() }]);
}

export async function savePages(
  date: string,
  pages: Array<{ path: string; title: string; views: number }>
) {
  return upsertByDate(
    "pages",
    date,
    pages.map((p) => ({ date, ...p, syncedAt: nowIso() }))
  );
}

export async function saveSources(
  date: string,
  sources: Array<{ source: string; medium: string; users: number; sessions: number }>
) {
  return upsertByDate(
    "sources",
    date,
    sources.map((s) => ({ date, ...s, syncedAt: nowIso() }))
  );
}

export async function saveDevices(
  date: string,
  devices: Array<{ device: string; users: number; sessions: number; pageViews: number }>
) {
  return upsertByDate(
    "devices",
    date,
    devices.map((d) => ({ date, ...d, syncedAt: nowIso() }))
  );
}

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
  return upsertByDate(
    "keywords",
    date,
    keywords.map((k) => ({ date, ...k, syncedAt: nowIso() }))
  );
}

// ── 최신 조회 (range) ──

function rangeFromArgs(days: number, startDateStr?: string, endDateStr?: string) {
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  if (startDateStr && endDateStr) return { start: startDateStr, end: endDateStr };
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return { start: fmt(start), end: fmt(end) };
}

async function getLatestRange(table: TableName, days: number, s?: string, e?: string) {
  const { start, end } = rangeFromArgs(days, s, e);
  const t = TABLE_MAP[table];
  return d1Query<Record<string, unknown>>(
    `SELECT * FROM ${t} WHERE date >= ? AND date <= ? ORDER BY date DESC`,
    [start, end]
  );
}

export async function getLatestSummary(days = 30, s?: string, e?: string) {
  return getLatestRange("summary", days, s, e);
}
export async function getLatestPages(days = 30, s?: string, e?: string) {
  return getLatestRange("pages", days, s, e);
}
export async function getLatestSources(days = 30, s?: string, e?: string) {
  return getLatestRange("sources", days, s, e);
}
export async function getLatestDevices(days = 30, s?: string, e?: string) {
  return getLatestRange("devices", days, s, e);
}
export async function getLatestKeywords(days = 30, s?: string, e?: string) {
  return getLatestRange("keywords", days, s, e);
}

// ============================================
// 네이버 검색광고 키워드 (월별)
// ============================================

export async function saveNaverKeywords(
  yearMonth: string,
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
  const t = TABLE_MAP.naverKeywords;
  const stmts: D1Statement[] = [
    { sql: `DELETE FROM ${t} WHERE yearMonth = ?`, params: [yearMonth] },
  ];
  for (const kw of keywords) stmts.push(buildInsert(t, { yearMonth, ...kw, syncedAt: nowIso() }));
  await d1Batch(stmts);
  return { created: keywords.length, updated: 0, deleted: 0 };
}

export async function getNaverKeywordsByMonth(yearMonth: string) {
  return d1Query<Record<string, unknown>>(
    `SELECT * FROM ${TABLE_MAP.naverKeywords} WHERE yearMonth = ? ORDER BY clicks DESC`,
    [yearMonth]
  );
}

export async function getNaverKeywordsRange(startYearMonth: string, endYearMonth: string) {
  return d1Query<Record<string, unknown>>(
    `SELECT * FROM ${TABLE_MAP.naverKeywords} WHERE yearMonth >= ? AND yearMonth <= ? ORDER BY yearMonth DESC`,
    [startYearMonth, endYearMonth]
  );
}

export async function getNaverKeywordsTrend(months = 6) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months + 1);
  const ym = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  return getNaverKeywordsRange(ym(startDate), ym(endDate));
}

// ============================================
// 네이버 광고 일별 통계
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

export async function saveNaverAdDaily(
  records: NaverAdDailyRecord[]
): Promise<{ created: number; updated: number; deleted: number }> {
  const t = TABLE_MAP.naverAdDaily;
  const stmts: D1Statement[] = [];
  for (const r of records) {
    stmts.push({ sql: `DELETE FROM ${t} WHERE date = ?`, params: [r.date] });
    stmts.push(buildInsert(t, { ...r, syncedAt: nowIso() }));
  }
  await d1Batch(stmts);
  return { created: records.length, updated: 0, deleted: 0 };
}

export async function getNaverAdDaily(
  startDate: string,
  endDate: string
): Promise<NaverAdDailyRecord[]> {
  const rows = await d1Query<Record<string, unknown>>(
    `SELECT * FROM ${TABLE_MAP.naverAdDaily} WHERE date >= ? AND date <= ? ORDER BY date ASC`,
    [startDate, endDate]
  );
  return rows.map((f) => ({
    date: String(f.date || ""),
    impCnt: Number(f.impCnt) || 0,
    clkCnt: Number(f.clkCnt) || 0,
    salesAmt: Number(f.salesAmt) || 0,
    ctr: Number(f.ctr) || 0,
    cpc: Number(f.cpc) || 0,
    ccnt: Number(f.ccnt) || 0,
    syncedAt: f.syncedAt ? String(f.syncedAt) : undefined,
  }));
}

export async function getMissingNaverAdDates(
  startDate: string,
  endDate: string
): Promise<string[]> {
  const existingData = await getNaverAdDaily(startDate, endDate);
  const existingDates = new Set(existingData.map((d) => d.date));
  const missingDates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date().toISOString().split("T")[0];
  while (current <= end) {
    const dateStr = current.toISOString().split("T")[0];
    if (!existingDates.has(dateStr) || dateStr === today) missingDates.push(dateStr);
    current.setDate(current.getDate() + 1);
  }
  return missingDates;
}

// ============================================
// 네이버 광고 캠페인별 통계
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

export async function saveNaverAdCampaigns(
  date: string,
  campaigns: Array<Omit<NaverAdCampaignRecord, "date" | "syncedAt">>
): Promise<{ created: number; updated: number; deleted: number }> {
  const t = TABLE_MAP.naverAdCampaigns;
  const stmts: D1Statement[] = [{ sql: `DELETE FROM ${t} WHERE date = ?`, params: [date] }];
  for (const c of campaigns) stmts.push(buildInsert(t, { date, ...c, syncedAt: nowIso() }));
  await d1Batch(stmts);
  return { created: campaigns.length, updated: 0, deleted: 0 };
}

export async function getNaverAdCampaigns(
  startDate: string,
  endDate: string
): Promise<NaverAdCampaignRecord[]> {
  const rows = await d1Query<Record<string, unknown>>(
    `SELECT * FROM ${TABLE_MAP.naverAdCampaigns} WHERE date >= ? AND date <= ? ORDER BY date DESC`,
    [startDate, endDate]
  );
  return rows.map((f) => ({
    date: String(f.date || ""),
    campaignId: String(f.campaignId || ""),
    campaignName: String(f.campaignName || ""),
    status: String(f.status || ""),
    dailyBudget: Number(f.dailyBudget) || 0,
    impCnt: Number(f.impCnt) || 0,
    clkCnt: Number(f.clkCnt) || 0,
    salesAmt: Number(f.salesAmt) || 0,
    ctr: Number(f.ctr) || 0,
    cpc: Number(f.cpc) || 0,
    ccnt: Number(f.ccnt) || 0,
    syncedAt: f.syncedAt ? String(f.syncedAt) : undefined,
  }));
}

// ============================================
// 네이버 광고 캠페인별 일별 통계 (AI 리포트용)
// ============================================

export interface NaverAdCampaignDailyRecord {
  date: string;
  campaignId: string;
  campaignName: string;
  campaignGroup: string;
  impCnt: number;
  clkCnt: number;
  salesAmt: number;
  ctr: number;
  cpc: number;
  ccnt: number;
  syncedAt?: string;
}

export async function getNaverAdCampaignDaily(
  startDate: string,
  endDate: string,
  campaignGroup?: string
): Promise<NaverAdCampaignDailyRecord[]> {
  const t = TABLE_MAP.naverAdCampaignDaily;
  let sql = `SELECT * FROM ${t} WHERE date >= ? AND date <= ?`;
  const params: Param[] = [startDate, endDate];
  if (campaignGroup) {
    sql += ` AND campaignGroup = ?`;
    params.push(campaignGroup);
  }
  sql += ` ORDER BY date DESC`;
  const rows = await d1Query<Record<string, unknown>>(sql, params);
  return rows.map((f) => ({
    date: String(f.date || ""),
    campaignId: String(f.campaignId || ""),
    campaignName: String(f.campaignName || ""),
    campaignGroup: String(f.campaignGroup || ""),
    impCnt: Number(f.impCnt) || 0,
    clkCnt: Number(f.clkCnt) || 0,
    salesAmt: Number(f.salesAmt) || 0,
    ctr: Number(f.ctr) || 0,
    cpc: Number(f.cpc) || 0,
    ccnt: Number(f.ccnt) || 0,
    syncedAt: f.syncedAt ? String(f.syncedAt) : undefined,
  }));
}

export async function getNaverAdCampaignDailyAggregated(
  startDate: string,
  endDate: string,
  campaignGroup: string
): Promise<{ impressions: number; clicks: number; cost: number; ctr: number; cpc: number }> {
  const records = await getNaverAdCampaignDaily(startDate, endDate, campaignGroup);
  const totals = records.reduce(
    (acc, r) => ({
      impressions: acc.impressions + r.impCnt,
      clicks: acc.clicks + r.clkCnt,
      cost: acc.cost + r.salesAmt,
    }),
    { impressions: 0, clicks: 0, cost: 0 }
  );
  return {
    ...totals,
    ctr: totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0,
    cpc: totals.clicks > 0 ? totals.cost / totals.clicks : 0,
  };
}
