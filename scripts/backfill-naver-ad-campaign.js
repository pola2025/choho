/**
 * 네이버 검색광고 캠페인별 일별 데이터 백필 스크립트
 *
 * 실행: node scripts/backfill-naver-ad-campaign.js
 *
 * 캠페인별로 일별 데이터를 저장하여 AI 리포트에서 캠페인별 분석 가능
 */

require('dotenv').config({ path: '.env.local' });

const crypto = require('crypto');

const API_BASE_URL = 'https://api.searchad.naver.com';
const ACCESS_LICENSE = process.env.NAVER_AD_ACCESS_LICENSE;
const SECRET_KEY = process.env.NAVER_AD_SECRET_KEY;
const CUSTOMER_ID = process.env.NAVER_AD_CUSTOMER_ID;

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_ANALYTICS_BASE_ID;
const CAMPAIGN_DAILY_TABLE = process.env.AIRTABLE_NAVER_AD_CAMPAIGN_DAILY_TABLE;

// 설정: 백필 시작일
const BACKFILL_START = '2024-01-01';

// 캠페인 그룹 매핑
const CAMPAIGN_GROUPS = {
  'cmp-a001-01-000000004743481': 'place-personal',  // 초호-개인
  'cmp-a001-01-000000004742841': 'place-group',     // 단체
  'cmp-a001-06-000000009059251': 'place-group',     // 플레이스#1
  'cmp-a001-03-000000005889812': 'power-content',   // 파워컨텐츠_단체
};

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

// 캠페인별 단일 날짜 통계 조회
async function getCampaignDayStats(campaignId, date) {
  const formatDate = (d) => d.replace(/-/g, '');

  const params = new URLSearchParams({
    ids: campaignId,
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

  const record = response.data[0];
  return {
    date,
    campaignId,
    impCnt: record.impCnt || 0,
    clkCnt: record.clkCnt || 0,
    salesAmt: record.salesAmt || 0,
    ccnt: record.ccnt || 0,
    ctr: record.impCnt > 0 ? (record.clkCnt / record.impCnt) * 100 : 0,
    cpc: record.clkCnt > 0 ? record.salesAmt / record.clkCnt : 0,
  };
}

async function getExistingRecords() {
  const result = await airtableRequest(CAMPAIGN_DAILY_TABLE, 'GET', undefined, {
    'fields[]': 'recordKey',
    pageSize: '100',
  });

  // 페이지네이션 처리
  const allKeys = new Set();
  let records = result.records || [];
  records.forEach(r => allKeys.add(r.fields.recordKey));

  let offset = result.offset;
  while (offset) {
    const nextResult = await airtableRequest(CAMPAIGN_DAILY_TABLE, 'GET', undefined, {
      'fields[]': 'recordKey',
      pageSize: '100',
      offset,
    });
    (nextResult.records || []).forEach(r => allKeys.add(r.fields.recordKey));
    offset = nextResult.offset;
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return allKeys;
}

async function saveRecords(records) {
  // 10개씩 배치 처리
  for (let i = 0; i < records.length; i += 10) {
    const batch = records.slice(i, i + 10);
    await airtableRequest(CAMPAIGN_DAILY_TABLE, 'POST', {
      records: batch.map(fields => ({
        fields: {
          ...fields,
          recordKey: `${fields.date}_${fields.campaignId}`,
          campaignGroup: CAMPAIGN_GROUPS[fields.campaignId] || 'unknown',
          syncedAt: new Date().toISOString(),
        }
      })),
    });

    // Rate limit 방지
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

async function main() {
  console.log('🚀 네이버 검색광고 캠페인별 데이터 백필 시작\n');

  // 환경변수 확인
  if (!ACCESS_LICENSE || !SECRET_KEY || !CUSTOMER_ID) {
    console.error('❌ 네이버 검색광고 API 환경변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  if (!CAMPAIGN_DAILY_TABLE) {
    console.error('❌ AIRTABLE_NAVER_AD_CAMPAIGN_DAILY_TABLE 환경변수가 설정되지 않았습니다.');
    console.log('\n📋 Airtable 테이블 생성 필요:');
    console.log('   테이블명: NaverAdCampaignDaily');
    console.log('   필드: date, campaignId, campaignName, campaignGroup, impCnt, clkCnt, salesAmt, ctr, cpc, ccnt, recordKey, syncedAt');
    process.exit(1);
  }

  try {
    // 1. 캠페인 목록 조회
    console.log('📋 캠페인 목록 조회 중...');
    const campaigns = await getCampaigns();
    console.log(`   ${campaigns.length}개 캠페인 발견\n`);

    campaigns.forEach(c => {
      const group = CAMPAIGN_GROUPS[c.nccCampaignId] || 'unknown';
      console.log(`   - ${c.name} (${c.nccCampaignId}) → ${group}`);
    });
    console.log('');

    if (campaigns.length === 0) {
      console.log('❌ 등록된 캠페인이 없습니다.');
      process.exit(1);
    }

    // 2. 기존 저장된 레코드 확인
    console.log('📅 기존 저장된 데이터 확인 중...');
    const existingKeys = await getExistingRecords();
    console.log(`   ${existingKeys.size}개 레코드 존재\n`);

    // 3. 백필할 날짜 범위 계산
    const endDate = new Date();
    const startDate = new Date(BACKFILL_START);

    const formatDateStr = (d) => d.toISOString().split('T')[0];

    console.log(`📆 백필 기간: ${formatDateStr(startDate)} ~ ${formatDateStr(endDate)}`);

    // 누락된 (날짜, 캠페인) 조합 찾기
    const missingCombos = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      const dateStr = formatDateStr(current);
      for (const campaign of campaigns) {
        const key = `${dateStr}_${campaign.nccCampaignId}`;
        if (!existingKeys.has(key)) {
          missingCombos.push({
            date: dateStr,
            campaignId: campaign.nccCampaignId,
            campaignName: campaign.name,
          });
        }
      }
      current.setDate(current.getDate() + 1);
    }

    console.log(`   ${missingCombos.length}개 데이터 누락 (${campaigns.length}캠페인 × 일수)\n`);

    if (missingCombos.length === 0) {
      console.log('✅ 모든 데이터가 이미 저장되어 있습니다.');
      return;
    }

    // 4. 조회하여 저장
    console.log(`📊 ${missingCombos.length}개 데이터 조회 예정\n`);

    let totalSaved = 0;
    let noDataCount = 0;
    const recordsToSave = [];

    for (let i = 0; i < missingCombos.length; i++) {
      const { date, campaignId, campaignName } = missingCombos[i];
      const progress = `[${i + 1}/${missingCombos.length}]`;

      try {
        const stat = await getCampaignDayStats(campaignId, date);

        if (stat && (stat.impCnt > 0 || stat.clkCnt > 0 || stat.salesAmt > 0)) {
          recordsToSave.push({
            ...stat,
            campaignName,
          });

          // 10개 모이면 저장
          if (recordsToSave.length >= 10) {
            await saveRecords(recordsToSave);
            totalSaved += recordsToSave.length;
            console.log(`${progress} 저장 완료 (누적 ${totalSaved}개)`);
            recordsToSave.length = 0;
          }
        } else {
          noDataCount++;
        }

        // Rate limit 방지 (초당 5회 제한 고려)
        await new Promise(resolve => setTimeout(resolve, 250));

        // 진행상황 표시 (100개마다)
        if (i > 0 && i % 100 === 0) {
          console.log(`${progress} 진행중... (저장: ${totalSaved}, 없음: ${noDataCount})`);
        }
      } catch (err) {
        console.error(`${progress} ${date} ${campaignName} 조회 실패:`, err.message);
      }
    }

    // 남은 레코드 저장
    if (recordsToSave.length > 0) {
      await saveRecords(recordsToSave);
      totalSaved += recordsToSave.length;
    }

    console.log(`\n🎉 백필 완료!`);
    console.log(`   저장: ${totalSaved}개`);
    console.log(`   데이터 없음: ${noDataCount}개`);

  } catch (error) {
    console.error('❌ 백필 실패:', error);
    process.exit(1);
  }
}

main();
