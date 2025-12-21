/**
 * Airtable Naver 키워드 테이블 생성 스크립트
 */

require('dotenv').config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_ANALYTICS_BASE_ID;

async function createTable(tableName, fields) {
  const response = await fetch(`https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: tableName,
      fields: fields
    })
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(`❌ ${tableName} 생성 실패:`, data.error?.message || data);
    return null;
  }

  console.log(`✅ ${tableName} 생성 완료: ${data.id}`);
  return data.id;
}

async function main() {
  console.log('🚀 Naver 키워드 테이블 생성 시작...\n');

  // NaverKeywords 테이블 (월별 키워드 통계)
  const keywordFields = [
    { name: 'yearMonth', type: 'singleLineText' },  // 2024-01 형식
    { name: 'keyword', type: 'singleLineText' },
    { name: 'impressions', type: 'number', options: { precision: 0 } },
    { name: 'clicks', type: 'number', options: { precision: 0 } },
    { name: 'cost', type: 'number', options: { precision: 0 } },
    { name: 'ctr', type: 'number', options: { precision: 4 } },
    { name: 'cpc', type: 'number', options: { precision: 0 } },
    { name: 'avgPosition', type: 'number', options: { precision: 2 } },
    { name: 'conversions', type: 'number', options: { precision: 0 } },
    { name: 'syncedAt', type: 'singleLineText' }
  ];

  const tableId = await createTable('NaverKeywords', keywordFields);

  // 결과 출력
  if (tableId) {
    console.log('\n📋 환경변수에 추가하세요:');
    console.log(`AIRTABLE_NAVER_KEYWORDS_TABLE=${tableId}`);
  }
}

main().catch(console.error);
