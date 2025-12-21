/**
 * 네이버 검색광고 과거 데이터 백필 스크립트
 *
 * 실행: node scripts/backfill-naver-ad.js
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
const NAVER_AD_DAILY_TABLE = process.env.AIRTABLE_NAVER_AD_DAILY_TABLE;

// 설정: 백필 시작일 (1년 전부터)
const BACKFILL_DAYS = 365;

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

// 단일 날짜 통계 조회
async function getSingleDayStats(campaignIds, date) {
  const formatDate = (d) => d.replace(/-/g, '');

  const params = new URLSearchParams({
    ids: campaignIds.join(','),
    fields: JSON.stringify(['impCnt', 'clkCnt', 'salesAmt', 'ctr', 'cpc', 'ccnt']),
    timeRange: JSON.stringify({
      since: formatDate(date),
      until: formatDate(date),
    }),
  });

  const response = await naverAdRequest('GET', `/stats?${params.toString()}`);

  if (!response || !response.data || response.data.length === 0) {
    return null;
  }

  // 모든 캠페인 합산
  const totals = response.data.reduce((acc, record) => ({
    impCnt: acc.impCnt + (record.impCnt || 0),
    clkCnt: acc.clkCnt + (record.clkCnt || 0),
    salesAmt: acc.salesAmt + (record.salesAmt || 0),
    ccnt: acc.ccnt + (record.ccnt || 0),
  }), { impCnt: 0, clkCnt: 0, salesAmt: 0, ccnt: 0 });

  return {
    date,
    impCnt: totals.impCnt,
    clkCnt: totals.clkCnt,
    salesAmt: totals.salesAmt,
    ccnt: totals.ccnt,
    ctr: totals.impCnt > 0 ? (totals.clkCnt / totals.impCnt) * 100 : 0,
    cpc: totals.clkCnt > 0 ? totals.salesAmt / totals.clkCnt : 0,
  };
}

async function getExistingDates() {
  const result = await airtableRequest(NAVER_AD_DAILY_TABLE, 'GET', undefined, {
    'fields[]': 'date',
    'sort[0][field]': 'date',
    'sort[0][direction]': 'asc',
  });

  return new Set((result.records || []).map(r => r.fields.date));
}

async function saveRecords(records) {
  // 10개씩 배치 처리
  for (let i = 0; i < records.length; i += 10) {
    const batch = records.slice(i, i + 10);
    await airtableRequest(NAVER_AD_DAILY_TABLE, 'POST', {
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
  console.log('🚀 네이버 검색광고 데이터 백필 시작\n');

  // 환경변수 확인
  if (!ACCESS_LICENSE || !SECRET_KEY || !CUSTOMER_ID) {
    console.error('❌ 네이버 검색광고 API 환경변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  if (!NAVER_AD_DAILY_TABLE) {
    console.error('❌ AIRTABLE_NAVER_AD_DAILY_TABLE 환경변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  try {
    // 1. 캠페인 목록 조회
    console.log('📋 캠페인 목록 조회 중...');
    const campaigns = await getCampaigns();
    console.log(`   ${campaigns.length}개 캠페인 발견\n`);

    if (campaigns.length === 0) {
      console.log('❌ 등록된 캠페인이 없습니다.');
      process.exit(1);
    }

    const campaignIds = campaigns.map(c => c.nccCampaignId);

    // 2. 기존 저장된 날짜 확인
    console.log('📅 기존 저장된 데이터 확인 중...');
    const existingDates = await getExistingDates();
    console.log(`   ${existingDates.size}개 날짜 데이터 존재\n`);

    // 3. 백필할 날짜 범위 계산
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - BACKFILL_DAYS);

    const formatDate = (d) => d.toISOString().split('T')[0];

    console.log(`📆 백필 기간: ${formatDate(startDate)} ~ ${formatDate(endDate)}`);

    // 누락된 날짜 찾기
    const missingDates = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      const dateStr = formatDate(current);
      if (!existingDates.has(dateStr)) {
        missingDates.push(dateStr);
      }
      current.setDate(current.getDate() + 1);
    }

    console.log(`   ${missingDates.length}개 날짜 데이터 누락\n`);

    if (missingDates.length === 0) {
      console.log('✅ 모든 데이터가 이미 저장되어 있습니다.');
      return;
    }

    // 4. 하루씩 조회하여 저장
    console.log(`📊 ${missingDates.length}일 데이터 조회 예정\n`);

    let totalSaved = 0;
    let noDataDays = 0;
    const recordsToSave = [];

    for (let i = 0; i < missingDates.length; i++) {
      const date = missingDates[i];
      const progress = `[${i + 1}/${missingDates.length}]`;

      try {
        const stat = await getSingleDayStats(campaignIds, date);

        if (stat && (stat.impCnt > 0 || stat.clkCnt > 0 || stat.salesAmt > 0)) {
          recordsToSave.push(stat);

          // 10개 모이면 저장
          if (recordsToSave.length >= 10) {
            await saveRecords(recordsToSave);
            totalSaved += recordsToSave.length;
            console.log(`${progress} ${date} - 저장 완료 (누적 ${totalSaved}개)`);
            recordsToSave.length = 0;
          }
        } else {
          noDataDays++;
          if (i % 30 === 0) {
            console.log(`${progress} ${date} - 데이터 없음`);
          }
        }

        // Rate limit 방지 (초당 5회 제한 고려)
        await new Promise(resolve => setTimeout(resolve, 250));
      } catch (err) {
        console.error(`${progress} ${date} 조회 실패:`, err.message);
      }
    }

    // 남은 레코드 저장
    if (recordsToSave.length > 0) {
      await saveRecords(recordsToSave);
      totalSaved += recordsToSave.length;
    }

    console.log(`\n🎉 백필 완료!`);
    console.log(`   저장: ${totalSaved}일`);
    console.log(`   데이터 없음: ${noDataDays}일`);

  } catch (error) {
    console.error('❌ 백필 실패:', error);
    process.exit(1);
  }
}

main();
