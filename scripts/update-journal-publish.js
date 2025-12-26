// 저널 공개/비공개 상태 변경 스크립트
require('dotenv').config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_JOURNAL_TABLE_ID;

async function updateJournalPublishStatus(title, isPublished) {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
    console.error('❌ Airtable 환경변수가 설정되지 않았습니다.');
    return;
  }

  try {
    // 1. 해당 제목의 저널 찾기
    const filterFormula = encodeURIComponent(`{title}="${title}"`);
    const searchUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}?filterByFormula=${filterFormula}`;

    console.log(`🔍 저널 검색 중: "${title}"`);

    const searchResponse = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!searchResponse.ok) {
      const error = await searchResponse.text();
      console.error('❌ 검색 실패:', error);
      return;
    }

    const searchData = await searchResponse.json();

    if (searchData.records.length === 0) {
      console.log(`⚠️ 저널을 찾을 수 없습니다: "${title}"`);
      return;
    }

    const record = searchData.records[0];
    console.log(`✅ 저널 발견: ${record.fields.title} (ID: ${record.id})`);

    // 2. isPublished 상태 변경
    const updateUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`;

    const updateResponse = await fetch(updateUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [
          {
            id: record.id,
            fields: {
              isPublished: isPublished,
            },
          },
        ],
      }),
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      console.error('❌ 업데이트 실패:', error);
      return;
    }

    const updateData = await updateResponse.json();
    console.log(`✅ 저널 상태 변경 완료:`);
    console.log(`   - 제목: ${updateData.records[0].fields.title}`);
    console.log(`   - 공개 상태: ${isPublished ? '공개' : '비공개'}`);
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

// 얼음썰매 무료이용 저널 비공개 처리
updateJournalPublishStatus('얼음썰매 무료이용', false);
