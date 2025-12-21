/**
 * Airtable Naver Ad 테이블 생성 스크립트
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
  console.log('🚀 Naver Ad 테이블 생성 시작...\n');

  // 1. NaverAdDaily 테이블
  const dailyFields = [
    { name: 'date', type: 'singleLineText' },
    { name: 'impCnt', type: 'number', options: { precision: 0 } },
    { name: 'clkCnt', type: 'number', options: { precision: 0 } },
    { name: 'salesAmt', type: 'number', options: { precision: 0 } },
    { name: 'ctr', type: 'number', options: { precision: 4 } },
    { name: 'cpc', type: 'number', options: { precision: 0 } },
    { name: 'ccnt', type: 'number', options: { precision: 0 } },
    { name: 'syncedAt', type: 'singleLineText' }
  ];

  const dailyTableId = await createTable('NaverAdDaily', dailyFields);

  // 2. NaverAdCampaigns 테이블
  const campaignFields = [
    { name: 'date', type: 'singleLineText' },
    { name: 'campaignId', type: 'singleLineText' },
    { name: 'campaignName', type: 'singleLineText' },
    { name: 'status', type: 'singleLineText' },
    { name: 'dailyBudget', type: 'number', options: { precision: 0 } },
    { name: 'impCnt', type: 'number', options: { precision: 0 } },
    { name: 'clkCnt', type: 'number', options: { precision: 0 } },
    { name: 'salesAmt', type: 'number', options: { precision: 0 } },
    { name: 'ctr', type: 'number', options: { precision: 4 } },
    { name: 'cpc', type: 'number', options: { precision: 0 } },
    { name: 'ccnt', type: 'number', options: { precision: 0 } },
    { name: 'syncedAt', type: 'singleLineText' }
  ];

  const campaignTableId = await createTable('NaverAdCampaigns', campaignFields);

  // 결과 출력
  console.log('\n📋 환경변수에 추가하세요:');
  if (dailyTableId) {
    console.log(`AIRTABLE_NAVER_AD_DAILY_TABLE=${dailyTableId}`);
  }
  if (campaignTableId) {
    console.log(`AIRTABLE_NAVER_AD_CAMPAIGNS_TABLE=${campaignTableId}`);
  }
}

main().catch(console.error);
