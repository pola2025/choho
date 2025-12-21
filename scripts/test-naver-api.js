/**
 * 네이버 검색광고 API 테스트
 */

require('dotenv').config({ path: '.env.local' });

const crypto = require('crypto');

const API_BASE_URL = 'https://api.searchad.naver.com';
const ACCESS_LICENSE = process.env.NAVER_AD_ACCESS_LICENSE;
const SECRET_KEY = process.env.NAVER_AD_SECRET_KEY;
const CUSTOMER_ID = process.env.NAVER_AD_CUSTOMER_ID;

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

  console.log(`🔗 Request: ${method} ${path}`);

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

  const text = await response.text();

  if (!response.ok) {
    console.error(`❌ Error ${response.status}:`, text);
    throw new Error(`Naver Ad API error: ${response.status}`);
  }

  const data = JSON.parse(text);
  console.log(`✅ Response:`, JSON.stringify(data, null, 2).slice(0, 2000));
  return data;
}

async function main() {
  console.log('🔍 네이버 검색광고 API 테스트\n');

  // 1. 캠페인 목록
  console.log('=== 캠페인 목록 ===');
  const campaigns = await naverAdRequest('GET', '/ncc/campaigns');
  console.log(`\n캠페인 수: ${campaigns.length}`);

  if (campaigns.length === 0) return;

  const campaignIds = campaigns.map(c => c.nccCampaignId);
  console.log('캠페인 IDs:', campaignIds);

  // 2. 최근 7일 통계 조회
  console.log('\n=== 최근 7일 통계 ===');
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  const formatDate = (d) => d.toISOString().split('T')[0].replace(/-/g, '');

  const params = new URLSearchParams({
    ids: campaignIds.join(','),
    fields: JSON.stringify(['impCnt', 'clkCnt', 'salesAmt', 'ctr', 'cpc', 'ccnt']),
    timeRange: JSON.stringify({
      since: formatDate(startDate),
      until: formatDate(endDate),
    }),
    timeIncrement: 'daily',
  });

  console.log(`\n날짜 범위: ${formatDate(startDate)} ~ ${formatDate(endDate)}`);
  await naverAdRequest('GET', `/stats?${params.toString()}`);
}

main().catch(console.error);
