// 저널 목록 조회 스크립트
require('dotenv').config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_JOURNAL_TABLE_ID;

async function listJournals() {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
    console.error('❌ Airtable 환경변수가 설정되지 않았습니다.');
    return;
  }

  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}?sort[0][field]=createdAt&sort[0][direction]=desc`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ 조회 실패:', error);
      return;
    }

    const data = await response.json();
    console.log(`\n📋 전체 저널 목록 (${data.records.length}개):\n`);

    data.records.forEach((record, idx) => {
      const f = record.fields;
      console.log(`${idx + 1}. [${f.isPublished ? '✅' : '❌'}] ${f.title}`);
      console.log(`   ID: ${record.id}`);
      console.log(`   카테고리: ${f.category || '-'} | 생성일: ${f.createdAt || '-'}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ 오류 발생:', error);
  }
}

listJournals();
