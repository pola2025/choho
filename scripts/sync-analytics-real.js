/**
 * 실제 Google Analytics 데이터를 Airtable에 동기화하는 스크립트
 * 사용법: node scripts/sync-analytics-real.js
 */

require('dotenv').config({ path: '.env.local' });

const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const { GoogleAuth } = require('google-auth-library');
const { google } = require('googleapis');

// 환경변수
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_ANALYTICS_BASE_ID;
const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID;
const SEARCH_CONSOLE_SITE_URL = process.env.SEARCH_CONSOLE_SITE_URL;

const TABLES = {
  summary: process.env.AIRTABLE_ANALYTICS_SUMMARY_TABLE,
  pages: process.env.AIRTABLE_ANALYTICS_PAGES_TABLE,
  sources: process.env.AIRTABLE_ANALYTICS_SOURCES_TABLE,
  devices: process.env.AIRTABLE_ANALYTICS_DEVICES_TABLE,
  keywords: process.env.AIRTABLE_ANALYTICS_KEYWORDS_TABLE,
};

// Private key 변환
function normalizePrivateKey(key) {
  return key.split(String.raw`\n`).join('\n').replace(/\r\n/g, '\n').trim();
}

// 인증 정보 가져오기
function getCredentials() {
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
      console.error('Failed to parse credentials:', e);
    }
  }
  return undefined;
}

// GA4 클라이언트 생성
function createAnalyticsClient() {
  const credentials = getCredentials();
  if (!credentials) {
    throw new Error('No credentials available');
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

// Search Console 클라이언트 생성
function createSearchConsoleClient() {
  const credentials = getCredentials();
  if (!credentials) return null;

  const auth = new google.auth.JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });

  return google.searchconsole({ version: 'v1', auth });
}

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

// 레코드 삭제
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
  if (records.length === 0) return 0;

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

// 메인 동기화 함수
async function syncRealData() {
  console.log('=== Real Analytics Sync ===');
  console.log('GA4 Property ID:', GA4_PROPERTY_ID);
  console.log('Base ID:', BASE_ID);

  const analyticsClient = createAnalyticsClient();
  const searchConsole = createSearchConsoleClient();

  const today = new Date().toISOString().split('T')[0];
  console.log('\nSyncing data for:', today);

  // 1. Summary 데이터
  console.log('\n1. Fetching GA4 summary...');
  try {
    const [summaryResponse] = await analyticsClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate: '1daysAgo', endDate: 'today' }],
      metrics: [
        { name: 'totalUsers' },
        { name: 'newUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
      ],
    });

    if (summaryResponse.rows?.length > 0) {
      const row = summaryResponse.rows[0];
      const summaryData = {
        date: today,
        totalUsers: parseInt(row.metricValues?.[0]?.value || '0'),
        newUsers: parseInt(row.metricValues?.[1]?.value || '0'),
        sessions: parseInt(row.metricValues?.[2]?.value || '0'),
        pageViews: parseInt(row.metricValues?.[3]?.value || '0'),
        avgSessionDuration: parseFloat(row.metricValues?.[4]?.value || '0'),
        bounceRate: parseFloat(row.metricValues?.[5]?.value || '0') * 100,
        syncedAt: new Date().toISOString(),
      };

      await deleteRecordsByDate(TABLES.summary, today);
      await createRecords(TABLES.summary, [summaryData]);
      console.log('   Summary:', summaryData);
    }
  } catch (err) {
    console.error('   Error fetching summary:', err.message);
  }

  // 2. Top Pages
  console.log('\n2. Fetching top pages...');
  try {
    const [pagesResponse] = await analyticsClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate: '1daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
      metrics: [{ name: 'screenPageViews' }],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: 20,
    });

    if (pagesResponse.rows?.length > 0) {
      const pagesData = pagesResponse.rows.map((row) => ({
        date: today,
        path: row.dimensionValues?.[0]?.value || '',
        title: row.dimensionValues?.[1]?.value || '',
        views: parseInt(row.metricValues?.[0]?.value || '0'),
        syncedAt: new Date().toISOString(),
      }));

      await deleteRecordsByDate(TABLES.pages, today);
      await createRecords(TABLES.pages, pagesData);
      console.log(`   Created ${pagesData.length} page records`);
    }
  } catch (err) {
    console.error('   Error fetching pages:', err.message);
  }

  // 3. Traffic Sources
  console.log('\n3. Fetching traffic sources...');
  try {
    const [sourcesResponse] = await analyticsClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate: '1daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
      metrics: [{ name: 'totalUsers' }, { name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 15,
    });

    if (sourcesResponse.rows?.length > 0) {
      const sourcesData = sourcesResponse.rows.map((row) => ({
        date: today,
        source: row.dimensionValues?.[0]?.value || '(direct)',
        medium: row.dimensionValues?.[1]?.value || '(none)',
        users: parseInt(row.metricValues?.[0]?.value || '0'),
        sessions: parseInt(row.metricValues?.[1]?.value || '0'),
        syncedAt: new Date().toISOString(),
      }));

      await deleteRecordsByDate(TABLES.sources, today);
      await createRecords(TABLES.sources, sourcesData);
      console.log(`   Created ${sourcesData.length} source records`);
    }
  } catch (err) {
    console.error('   Error fetching sources:', err.message);
  }

  // 4. Devices
  console.log('\n4. Fetching device stats...');
  try {
    const [devicesResponse] = await analyticsClient.runReport({
      property: `properties/${GA4_PROPERTY_ID}`,
      dateRanges: [{ startDate: '1daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [
        { name: 'totalUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    });

    if (devicesResponse.rows?.length > 0) {
      const devicesData = devicesResponse.rows.map((row) => ({
        date: today,
        device: row.dimensionValues?.[0]?.value || 'unknown',
        users: parseInt(row.metricValues?.[0]?.value || '0'),
        sessions: parseInt(row.metricValues?.[1]?.value || '0'),
        pageViews: parseInt(row.metricValues?.[2]?.value || '0'),
        syncedAt: new Date().toISOString(),
      }));

      await deleteRecordsByDate(TABLES.devices, today);
      await createRecords(TABLES.devices, devicesData);
      console.log(`   Created ${devicesData.length} device records`);
    }
  } catch (err) {
    console.error('   Error fetching devices:', err.message);
  }

  // 5. Search Keywords (Search Console)
  console.log('\n5. Fetching search keywords...');
  if (searchConsole && SEARCH_CONSOLE_SITE_URL) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);

      const formatDate = (d) => d.toISOString().split('T')[0];

      const response = await searchConsole.searchanalytics.query({
        siteUrl: SEARCH_CONSOLE_SITE_URL,
        requestBody: {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
          dimensions: ['query'],
          rowLimit: 50,
          dataState: 'final',
        },
      });

      if (response.data.rows?.length > 0) {
        const keywordsData = response.data.rows.map((row) => ({
          date: today,
          query: row.keys?.[0] || '',
          clicks: row.clicks || 0,
          impressions: row.impressions || 0,
          ctr: (row.ctr || 0) * 100,
          position: row.position || 0,
          syncedAt: new Date().toISOString(),
        }));

        await deleteRecordsByDate(TABLES.keywords, today);
        await createRecords(TABLES.keywords, keywordsData);
        console.log(`   Created ${keywordsData.length} keyword records`);
      }
    } catch (err) {
      console.error('   Error fetching keywords:', err.message);
    }
  } else {
    console.log('   Search Console not configured');
  }

  console.log('\n=== Sync Complete ===');
}

syncRealData().catch(console.error);
