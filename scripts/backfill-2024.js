/**
 * 2024년 데이터 백필 시도
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

async function main() {
  console.log('🔍 2024년 데이터 조회 가능 여부 테스트\n');

  // 캠페인 목록
  const campaigns = await naverAdRequest('GET', '/ncc/campaigns');
  console.log(`캠페인 수: ${campaigns.length}`);

  const campaignIds = campaigns.map(c => c.nccCampaignId);

  // 테스트할 날짜들
  const testDates = [
    '2024-01-01',
    '2024-06-01',
    '2024-11-01',
    '2024-12-01',
    '2024-12-20',
  ];

  for (const date of testDates) {
    const formatDate = (d) => d.replace(/-/g, '');

    const params = new URLSearchParams({
      ids: campaignIds.join(','),
      fields: JSON.stringify(['impCnt', 'clkCnt', 'salesAmt']),
      timeRange: JSON.stringify({
        since: formatDate(date),
        until: formatDate(date),
      }),
    });

    try {
      const response = await naverAdRequest('GET', `/stats?${params.toString()}`);

      if (response.data && response.data.length > 0) {
        const totals = response.data.reduce((acc, r) => ({
          impCnt: acc.impCnt + (r.impCnt || 0),
          clkCnt: acc.clkCnt + (r.clkCnt || 0),
          salesAmt: acc.salesAmt + (r.salesAmt || 0),
        }), { impCnt: 0, clkCnt: 0, salesAmt: 0 });

        console.log(`${date}: 노출 ${totals.impCnt}, 클릭 ${totals.clkCnt}, 비용 ${totals.salesAmt}원`);
      } else {
        console.log(`${date}: 데이터 없음`);
      }
    } catch (err) {
      console.log(`${date}: 오류 - ${err.message}`);
    }

    await new Promise(r => setTimeout(r, 300));
  }
}

main().catch(console.error);
