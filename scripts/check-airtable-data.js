/**
 * Airtable 저장된 데이터 확인
 */

require('dotenv').config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_ANALYTICS_BASE_ID;
const TABLE_ID = process.env.AIRTABLE_NAVER_AD_DAILY_TABLE;

async function main() {
  const allDates = [];
  let offset = null;

  do {
    const url = offset
      ? `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?offset=${offset}`
      : `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}?pageSize=100`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      },
    });

    const data = await response.json();
    const records = data.records || [];

    for (const r of records) {
      if (r.fields.date) {
        allDates.push(r.fields.date);
      }
    }

    offset = data.offset;
  } while (offset);

  allDates.sort();

  console.log(`전체 레코드 수: ${allDates.length}`);
  console.log(`첫 번째 날짜: ${allDates[0]}`);
  console.log(`마지막 날짜: ${allDates[allDates.length - 1]}`);

  // 월별 분포
  const monthCounts = {};
  for (const date of allDates) {
    const month = date.slice(0, 7);
    monthCounts[month] = (monthCounts[month] || 0) + 1;
  }

  console.log('\n월별 데이터 분포:');
  Object.entries(monthCounts).sort().forEach(([month, count]) => {
    console.log(`  ${month}: ${count}일`);
  });
}

main().catch(console.error);
