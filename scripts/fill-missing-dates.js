/**
 * 누락된 날짜에 0 데이터 채우기
 */

require('dotenv').config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_ANALYTICS_BASE_ID;
const TABLE_ID = process.env.AIRTABLE_NAVER_AD_DAILY_TABLE;

async function getExistingDates() {
  const allDates = new Set();
  let offset = null;

  do {
    const url = offset
      ? `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?offset=${offset}`
      : `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?pageSize=100`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
    });

    const data = await response.json();
    for (const r of (data.records || [])) {
      if (r.fields.date) allDates.add(r.fields.date);
    }
    offset = data.offset;
  } while (offset);

  return allDates;
}

async function saveRecords(records) {
  for (let i = 0; i < records.length; i += 10) {
    const batch = records.slice(i, i + 10);
    await fetch(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: batch.map(fields => ({ fields })),
      }),
    });
    await new Promise(r => setTimeout(r, 200));
  }
}

async function main() {
  console.log('🔍 기존 데이터 확인 중...');
  const existingDates = await getExistingDates();
  console.log(`   ${existingDates.size}일 데이터 존재\n`);

  // 2024-12-21 ~ 오늘까지 모든 날짜 생성
  const startDate = new Date('2024-12-21');
  const endDate = new Date();
  const missingDates = [];

  const current = new Date(startDate);
  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0];
    if (!existingDates.has(dateStr)) {
      missingDates.push(dateStr);
    }
    current.setDate(current.getDate() + 1);
  }

  console.log(`📅 누락된 날짜: ${missingDates.length}일`);

  if (missingDates.length === 0) {
    console.log('✅ 모든 날짜 데이터가 있습니다.');
    return;
  }

  console.log('   ' + missingDates.slice(0, 10).join(', ') + (missingDates.length > 10 ? '...' : ''));

  // 0 데이터로 채우기
  const zeroRecords = missingDates.map(date => ({
    date,
    impCnt: 0,
    clkCnt: 0,
    salesAmt: 0,
    ctr: 0,
    cpc: 0,
    ccnt: 0,
    syncedAt: new Date().toISOString(),
  }));

  console.log('\n💾 0 데이터 저장 중...');
  await saveRecords(zeroRecords);
  console.log(`✅ ${zeroRecords.length}개 레코드 저장 완료`);
}

main().catch(console.error);
