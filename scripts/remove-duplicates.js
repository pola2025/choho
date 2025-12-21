/**
 * 중복 데이터 제거 스크립트
 * - 날짜당 가장 최신 레코드만 유지
 */

require('dotenv').config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_ANALYTICS_BASE_ID;
const NAVER_AD_DAILY_TABLE = process.env.AIRTABLE_NAVER_AD_DAILY_TABLE;

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

    const result = await airtableRequest(tableId, 'GET', null, params);
    records.push(...result.records);
    offset = result.offset;
  } while (offset);

  return records;
}

async function deleteRecords(tableId, recordIds) {
  // 10개씩 배치 삭제
  for (let i = 0; i < recordIds.length; i += 10) {
    const batch = recordIds.slice(i, i + 10);
    const params = {};
    batch.forEach((id, idx) => {
      params[`records[${idx}]`] = id;
    });

    await airtableRequest(tableId, 'DELETE', null, params);
    await new Promise(resolve => setTimeout(resolve, 200));

    if ((i + 10) % 100 === 0 || i + 10 >= recordIds.length) {
      console.log(`   삭제 진행: ${Math.min(i + 10, recordIds.length)}/${recordIds.length}`);
    }
  }
}

async function main() {
  console.log('🧹 중복 데이터 제거 시작\n');

  // 1. 모든 레코드 조회
  console.log('📊 레코드 조회 중...');
  const records = await getAllRecords(NAVER_AD_DAILY_TABLE);
  console.log(`   총 ${records.length}개 레코드\n`);

  // 2. 날짜별로 그룹핑하고 가장 최신 레코드만 유지
  const dateGroups = {};

  for (const record of records) {
    const date = record.fields.date;
    if (!date) continue;

    if (!dateGroups[date]) {
      dateGroups[date] = [];
    }
    dateGroups[date].push(record);
  }

  // 3. 삭제할 레코드 찾기
  const toDelete = [];

  for (const [date, dateRecords] of Object.entries(dateGroups)) {
    if (dateRecords.length > 1) {
      // syncedAt 기준으로 정렬하여 가장 최신 것만 남기기
      dateRecords.sort((a, b) => {
        const timeA = a.fields.syncedAt || '';
        const timeB = b.fields.syncedAt || '';
        return timeB.localeCompare(timeA);
      });

      // 첫 번째(가장 최신) 제외하고 나머지 삭제
      for (let i = 1; i < dateRecords.length; i++) {
        toDelete.push(dateRecords[i].id);
      }
    }
  }

  console.log(`📋 분석 결과:`);
  console.log(`   - 고유 날짜: ${Object.keys(dateGroups).length}개`);
  console.log(`   - 삭제 대상: ${toDelete.length}개 레코드`);
  console.log(`   - 유지 레코드: ${records.length - toDelete.length}개\n`);

  if (toDelete.length === 0) {
    console.log('✅ 중복 없음, 삭제할 레코드 없습니다.');
    return;
  }

  // 4. 삭제 실행
  console.log('🗑️  중복 레코드 삭제 중...');
  await deleteRecords(NAVER_AD_DAILY_TABLE, toDelete);

  console.log(`\n✅ 완료! ${toDelete.length}개 중복 레코드 삭제됨`);
  console.log(`   남은 레코드: ${records.length - toDelete.length}개`);
}

main().catch(console.error);
