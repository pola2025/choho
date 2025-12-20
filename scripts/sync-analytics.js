/**
 * Analytics 데이터를 Airtable에 수동 동기화하는 스크립트
 * 사용법: node scripts/sync-analytics.js [mode]
 * mode: today (기본), daily, backfill
 */

require('dotenv').config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_ANALYTICS_BASE_ID;

const TABLES = {
  summary: process.env.AIRTABLE_ANALYTICS_SUMMARY_TABLE,
  pages: process.env.AIRTABLE_ANALYTICS_PAGES_TABLE,
  sources: process.env.AIRTABLE_ANALYTICS_SOURCES_TABLE,
  devices: process.env.AIRTABLE_ANALYTICS_DEVICES_TABLE,
  keywords: process.env.AIRTABLE_ANALYTICS_KEYWORDS_TABLE,
};

console.log('=== Analytics Sync Script ===');
console.log('Base ID:', BASE_ID);
console.log('Tables:', TABLES);

// Airtable API 호출 헬퍼
async function airtableRequest(tableId, method, body, params) {
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

// 레코드 삭제 (날짜 기준)
async function deleteRecordsByDate(tableId, date) {
  const result = await airtableRequest(tableId, 'GET', undefined, {
    filterByFormula: `{date}='${date}'`,
  });

  const records = result.records || [];
  if (records.length === 0) return 0;

  const ids = records.map((r) => r.id);
  for (let i = 0; i < ids.length; i += 10) {
    const batch = ids.slice(i, i + 10);
    const params = {};
    batch.forEach((id, index) => {
      params[`records[${index}]`] = id;
    });
    await airtableRequest(tableId, 'DELETE', undefined, params);
  }

  return ids.length;
}

// 레코드 생성
async function createRecords(tableId, records) {
  const batches = [];
  for (let i = 0; i < records.length; i += 10) {
    batches.push(records.slice(i, i + 10));
  }

  let total = 0;
  for (const batch of batches) {
    await airtableRequest(tableId, 'POST', {
      records: batch.map((fields) => ({ fields })),
    });
    total += batch.length;
  }

  return total;
}

// 테스트 데이터 생성 및 저장
async function syncTestData() {
  const today = new Date().toISOString().split('T')[0];
  console.log('\nSyncing test data for:', today);

  // Summary 테스트 데이터
  console.log('\n1. Syncing summary...');
  const deleted1 = await deleteRecordsByDate(TABLES.summary, today);
  console.log(`   Deleted ${deleted1} existing records`);

  await createRecords(TABLES.summary, [{
    date: today,
    totalUsers: 150,
    newUsers: 45,
    sessions: 200,
    pageViews: 580,
    avgSessionDuration: 125.5,
    bounceRate: 42.3,
    syncedAt: new Date().toISOString(),
  }]);
  console.log('   Created 1 summary record');

  // Pages 테스트 데이터
  console.log('\n2. Syncing pages...');
  const deleted2 = await deleteRecordsByDate(TABLES.pages, today);
  console.log(`   Deleted ${deleted2} existing records`);

  const pagesData = [
    { date: today, path: '/', title: '홈페이지', views: 120, syncedAt: new Date().toISOString() },
    { date: today, path: '/rooms', title: '객실 안내', views: 85, syncedAt: new Date().toISOString() },
    { date: today, path: '/reservation', title: '예약', views: 65, syncedAt: new Date().toISOString() },
  ];
  await createRecords(TABLES.pages, pagesData);
  console.log(`   Created ${pagesData.length} page records`);

  // Sources 테스트 데이터
  console.log('\n3. Syncing sources...');
  const deleted3 = await deleteRecordsByDate(TABLES.sources, today);
  console.log(`   Deleted ${deleted3} existing records`);

  const sourcesData = [
    { date: today, source: 'google', medium: 'organic', users: 80, sessions: 95, syncedAt: new Date().toISOString() },
    { date: today, source: 'naver', medium: 'organic', users: 45, sessions: 52, syncedAt: new Date().toISOString() },
    { date: today, source: '(direct)', medium: '(none)', users: 25, sessions: 30, syncedAt: new Date().toISOString() },
  ];
  await createRecords(TABLES.sources, sourcesData);
  console.log(`   Created ${sourcesData.length} source records`);

  // Devices 테스트 데이터
  console.log('\n4. Syncing devices...');
  const deleted4 = await deleteRecordsByDate(TABLES.devices, today);
  console.log(`   Deleted ${deleted4} existing records`);

  const devicesData = [
    { date: today, device: 'mobile', users: 95, sessions: 120, pageViews: 350, syncedAt: new Date().toISOString() },
    { date: today, device: 'desktop', users: 45, sessions: 65, pageViews: 200, syncedAt: new Date().toISOString() },
    { date: today, device: 'tablet', users: 10, sessions: 15, pageViews: 30, syncedAt: new Date().toISOString() },
  ];
  await createRecords(TABLES.devices, devicesData);
  console.log(`   Created ${devicesData.length} device records`);

  // Keywords 테스트 데이터
  console.log('\n5. Syncing keywords...');
  const deleted5 = await deleteRecordsByDate(TABLES.keywords, today);
  console.log(`   Deleted ${deleted5} existing records`);

  const keywordsData = [
    { date: today, query: '초리골펜션', clicks: 25, impressions: 150, ctr: 16.67, position: 1.2, syncedAt: new Date().toISOString() },
    { date: today, query: '양평펜션', clicks: 12, impressions: 280, ctr: 4.29, position: 5.8, syncedAt: new Date().toISOString() },
    { date: today, query: '초호펜션', clicks: 8, impressions: 95, ctr: 8.42, position: 2.1, syncedAt: new Date().toISOString() },
  ];
  await createRecords(TABLES.keywords, keywordsData);
  console.log(`   Created ${keywordsData.length} keyword records`);

  console.log('\n=== Sync Complete ===');
}

syncTestData().catch(console.error);
