/**
 * 데이터 정합성 확인 스크립트
 * - 중복 날짜 확인
 * - 월별 합계 검증
 */

require('dotenv').config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_ANALYTICS_BASE_ID;
const NAVER_AD_DAILY_TABLE = process.env.AIRTABLE_NAVER_AD_DAILY_TABLE;

async function airtableRequest(tableId, params) {
  const url = new URL(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableId}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Airtable API error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

async function getAllRecords(tableId) {
  const records = [];
  let offset = null;

  do {
    const params = {
      pageSize: '100',
    };
    if (offset) {
      params.offset = offset;
    }

    const result = await airtableRequest(tableId, params);
    records.push(...result.records);
    offset = result.offset;
  } while (offset);

  return records;
}

async function main() {
  console.log('🔍 데이터 정합성 확인 시작\n');

  // 일별 데이터 조회
  console.log('📊 일별 광고 데이터 조회 중...');
  const records = await getAllRecords(NAVER_AD_DAILY_TABLE);
  console.log(`   총 ${records.length}개 레코드\n`);

  // 1. 중복 날짜 확인
  console.log('1️⃣ 중복 날짜 확인');
  const dateCount = {};
  const duplicates = [];

  for (const record of records) {
    const date = record.fields.date;
    if (!date) continue;

    if (dateCount[date]) {
      dateCount[date]++;
      duplicates.push({
        date,
        id: record.id,
        salesAmt: record.fields.salesAmt,
      });
    } else {
      dateCount[date] = 1;
    }
  }

  if (duplicates.length > 0) {
    console.log(`   ⚠️  ${duplicates.length}개 중복 발견!`);
    const uniqueDuplicateDates = [...new Set(duplicates.map(d => d.date))];
    console.log(`   중복 날짜 (${uniqueDuplicateDates.length}개):`);
    uniqueDuplicateDates.slice(0, 10).forEach(date => {
      console.log(`     - ${date}: ${dateCount[date]}개 레코드`);
    });
    if (uniqueDuplicateDates.length > 10) {
      console.log(`     ... 외 ${uniqueDuplicateDates.length - 10}개 더`);
    }
  } else {
    console.log('   ✅ 중복 없음');
  }

  // 2. 월별 통계
  console.log('\n2️⃣ 월별 광고비 합계');
  const monthlyStats = {};

  for (const record of records) {
    const date = record.fields.date;
    if (!date) continue;

    const yearMonth = date.slice(0, 7);
    if (!monthlyStats[yearMonth]) {
      monthlyStats[yearMonth] = {
        count: 0,
        salesAmt: 0,
        clkCnt: 0,
        impCnt: 0,
      };
    }
    monthlyStats[yearMonth].count++;
    monthlyStats[yearMonth].salesAmt += record.fields.salesAmt || 0;
    monthlyStats[yearMonth].clkCnt += record.fields.clkCnt || 0;
    monthlyStats[yearMonth].impCnt += record.fields.impCnt || 0;
  }

  // 정렬
  const sortedMonths = Object.entries(monthlyStats)
    .sort(([a], [b]) => b.localeCompare(a));

  let totalSalesAmt = 0;
  console.log('\n   월        | 일수 | 광고비       | 클릭    | 노출');
  console.log('   ----------|------|--------------|---------|----------');

  for (const [month, stats] of sortedMonths) {
    totalSalesAmt += stats.salesAmt;
    console.log(`   ${month} | ${String(stats.count).padStart(4)} | ${String(stats.salesAmt.toLocaleString()).padStart(12)}원 | ${String(stats.clkCnt.toLocaleString()).padStart(7)} | ${stats.impCnt.toLocaleString()}`);
  }

  console.log('   ----------|------|--------------|---------|----------');
  console.log(`   합계       |      | ${String(totalSalesAmt.toLocaleString()).padStart(12)}원`);

  // 3. 이상치 확인
  console.log('\n3️⃣ 이상치 확인');
  const highCostDays = records
    .filter(r => r.fields.salesAmt > 100000)
    .sort((a, b) => b.fields.salesAmt - a.fields.salesAmt);

  if (highCostDays.length > 0) {
    console.log(`   광고비 10만원 초과 일수: ${highCostDays.length}일`);
    console.log('   상위 5일:');
    highCostDays.slice(0, 5).forEach(r => {
      console.log(`     - ${r.fields.date}: ${r.fields.salesAmt.toLocaleString()}원`);
    });
  } else {
    console.log('   ✅ 10만원 초과 일 없음');
  }

  console.log('\n✅ 정합성 확인 완료');
}

main().catch(console.error);
