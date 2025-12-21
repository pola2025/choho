/**
 * 네이버 검색광고 키워드 과거 데이터 백필 스크립트
 *
 * 실행: node scripts/backfill-naver-keywords.js
 *
 * 네이버 API는 약 1년치 데이터만 조회 가능하므로
 * 가능한 빨리 실행하여 데이터를 저장해야 합니다.
 */

require('dotenv').config({ path: '.env.local' });

const crypto = require('crypto');

const API_BASE_URL = 'https://api.searchad.naver.com';
const ACCESS_LICENSE = process.env.NAVER_AD_ACCESS_LICENSE;
const SECRET_KEY = process.env.NAVER_AD_SECRET_KEY;
const CUSTOMER_ID = process.env.NAVER_AD_CUSTOMER_ID;

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_ANALYTICS_BASE_ID;
const NAVER_KEYWORDS_TABLE = process.env.AIRTABLE_NAVER_KEYWORDS_TABLE;

// 설정: 백필 시작 월 (2024-01부터)
const BACKFILL_START_MONTH = '2024-01';

function generateSignature(timestamp, method, path) {
  const message = `${timestamp}.${method}.${path}`;
  const hmac = crypto.createHmac('sha256', SECRET_KEY);
  hmac.update(message);
  return hmac.digest('base64');
}

async function naverAdRequest(method, path) {
  const timestamp = String(Date.now());
  const pathWithoutQuery = path.split('?')[0];
  const signature = generateSignature(timestamp, method, pathWithoutQuery);

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Timestamp': timestamp,
      'X-API-KEY': ACCESS_LICENSE,
      'X-Customer': CUSTOMER_ID,
      'X-Signature': signature,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Naver Ad API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

async function airtableRequest(tableId, method, body, params) {
  const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}`);
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

async function getCampaigns() {
  return naverAdRequest('GET', '/ncc/campaigns');
}

async function getAdGroups(campaignId) {
  return naverAdRequest('GET', `/ncc/adgroups?nccCampaignId=${campaignId}`);
}

async function getKeywords(adGroupId) {
  return naverAdRequest('GET', `/ncc/keywords?nccAdgroupId=${adGroupId}`);
}

// 키워드 통계 조회
async function getKeywordStats(keywordIds, startDate, endDate) {
  const formatDate = (d) => d.replace(/-/g, '');

  const params = new URLSearchParams({
    ids: keywordIds.join(','),
    fields: JSON.stringify(['impCnt', 'clkCnt', 'salesAmt', 'ctr', 'cpc', 'avgRnk', 'ccnt']),
    timeRange: JSON.stringify({
      since: formatDate(startDate),
      until: formatDate(endDate),
    }),
  });

  const response = await naverAdRequest('GET', `/stats?${params.toString()}`);
  return response.data || [];
}

// 월의 시작일과 종료일 계산
function getMonthDateRange(yearMonth) {
  const [year, month] = yearMonth.split('-').map(Number);
  const startDate = `${yearMonth}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${yearMonth}-${String(lastDay).padStart(2, '0')}`;
  return { startDate, endDate };
}

// 기존 저장된 월 확인
async function getExistingMonths() {
  const result = await airtableRequest(NAVER_KEYWORDS_TABLE, 'GET', undefined, {
    'fields[]': 'yearMonth',
  });

  const months = new Set();
  for (const record of result.records || []) {
    if (record.fields.yearMonth) {
      months.add(record.fields.yearMonth);
    }
  }
  return months;
}

// 레코드 저장
async function saveRecords(records) {
  // 10개씩 배치 처리
  for (let i = 0; i < records.length; i += 10) {
    const batch = records.slice(i, i + 10);
    await airtableRequest(NAVER_KEYWORDS_TABLE, 'POST', {
      records: batch.map(fields => ({
        fields: {
          ...fields,
          syncedAt: new Date().toISOString(),
        }
      })),
    });

    // Rate limit 방지
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

async function main() {
  console.log('🚀 네이버 검색광고 키워드 데이터 백필 시작\n');

  // 환경변수 확인
  if (!ACCESS_LICENSE || !SECRET_KEY || !CUSTOMER_ID) {
    console.error('❌ 네이버 검색광고 API 환경변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  if (!NAVER_KEYWORDS_TABLE) {
    console.error('❌ AIRTABLE_NAVER_KEYWORDS_TABLE 환경변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  try {
    // 1. 캠페인 -> 광고그룹 -> 키워드 목록 조회
    console.log('📋 캠페인 및 키워드 목록 조회 중...');
    const campaigns = await getCampaigns();
    console.log(`   ${campaigns.length}개 캠페인 발견`);

    const allKeywords = [];
    for (const campaign of campaigns) {
      const adGroups = await getAdGroups(campaign.nccCampaignId);
      for (const adGroup of adGroups) {
        const keywords = await getKeywords(adGroup.nccAdgroupId);
        allKeywords.push(...keywords);
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    console.log(`   ${allKeywords.length}개 키워드 발견\n`);

    if (allKeywords.length === 0) {
      console.log('❌ 등록된 키워드가 없습니다.');
      process.exit(1);
    }

    // 2. 기존 저장된 월 확인
    console.log('📅 기존 저장된 데이터 확인 중...');
    const existingMonths = await getExistingMonths();
    console.log(`   ${existingMonths.size}개 월 데이터 존재\n`);

    // 3. 백필할 월 범위 계산
    const today = new Date();
    const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

    const missingMonths = [];
    const [startYear, startMonth] = BACKFILL_START_MONTH.split('-').map(Number);
    let year = startYear;
    let month = startMonth;

    while (`${year}-${String(month).padStart(2, '0')}` <= currentYearMonth) {
      const yearMonth = `${year}-${String(month).padStart(2, '0')}`;
      if (!existingMonths.has(yearMonth)) {
        missingMonths.push(yearMonth);
      }
      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
    }

    console.log(`📆 백필 기간: ${BACKFILL_START_MONTH} ~ ${currentYearMonth}`);
    console.log(`   ${missingMonths.length}개 월 데이터 누락\n`);

    if (missingMonths.length === 0) {
      console.log('✅ 모든 데이터가 이미 저장되어 있습니다.');
      return;
    }

    // 4. 월별로 키워드 통계 조회 및 저장
    console.log(`📊 ${missingMonths.length}개월 데이터 조회 예정\n`);

    let totalSaved = 0;
    const keywordIds = allKeywords.map(k => k.nccKeywordId);
    const keywordMap = new Map(allKeywords.map(k => [k.nccKeywordId, k.keyword]));

    for (let i = 0; i < missingMonths.length; i++) {
      const yearMonth = missingMonths[i];
      const { startDate, endDate } = getMonthDateRange(yearMonth);
      const progress = `[${i + 1}/${missingMonths.length}]`;

      try {
        // 배치로 키워드 통계 조회 (100개씩)
        const monthStats = [];
        for (let j = 0; j < keywordIds.length; j += 100) {
          const batch = keywordIds.slice(j, j + 100);
          const stats = await getKeywordStats(batch, startDate, endDate);

          for (const stat of stats) {
            const keyword = keywordMap.get(stat.id);
            if (keyword && (stat.impCnt > 0 || stat.clkCnt > 0 || stat.salesAmt > 0)) {
              monthStats.push({
                yearMonth,
                keyword,
                impressions: stat.impCnt || 0,
                clicks: stat.clkCnt || 0,
                cost: stat.salesAmt || 0,
                ctr: stat.ctr || 0,
                cpc: stat.cpc || 0,
                avgPosition: stat.avgRnk || 0,
                conversions: stat.ccnt || 0,
              });
            }
          }

          await new Promise(resolve => setTimeout(resolve, 200));
        }

        if (monthStats.length > 0) {
          await saveRecords(monthStats);
          totalSaved += monthStats.length;
          console.log(`${progress} ${yearMonth} - ${monthStats.length}개 키워드 저장 (누적 ${totalSaved}개)`);
        } else {
          console.log(`${progress} ${yearMonth} - 데이터 없음`);
        }

      } catch (err) {
        console.error(`${progress} ${yearMonth} 조회 실패:`, err.message);
      }

      // Rate limit 방지
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n🎉 키워드 백필 완료!`);
    console.log(`   저장: ${totalSaved}개 레코드`);

  } catch (error) {
    console.error('❌ 백필 실패:', error);
    process.exit(1);
  }
}

main();
