// 팝업 썸네일 URL 업데이트 스크립트
require('dotenv').config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_POPUP_TABLE_ID;
const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`;

// URL 매핑 (외부 URL -> 로컬 경로)
const urlMapping = {
  'https://www.chorigol.co.kr/images/rooms/forest/main.webp': '/images/rooms/forest/main.webp',
  'https://www.chorigol.co.kr/images/journal/ice-wall/ice-wall-2.webp': '/images/journal/ice-wall/ice-wall-2.webp',
  'https://www.chorigol.co.kr/images/cafe/cafe-main.webp': '/images/cafe/main.webp',
};

async function updateUrls() {
  // 현재 데이터 조회
  const response = await fetch(AIRTABLE_URL, {
    headers: { 'Authorization': `Bearer ${AIRTABLE_API_KEY}` }
  });
  const data = await response.json();

  console.log('현재 팝업 데이터:');
  for (const record of data.records) {
    const currentUrl = record.fields.thumbnailUrl;
    const newUrl = urlMapping[currentUrl] || currentUrl;

    console.log(`- ${record.fields.Name}: ${currentUrl} -> ${newUrl}`);

    if (currentUrl !== newUrl) {
      // URL 업데이트
      const updateRes = await fetch(AIRTABLE_URL, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          records: [{
            id: record.id,
            fields: { thumbnailUrl: newUrl }
          }]
        })
      });

      if (updateRes.ok) {
        console.log(`  ✓ 업데이트 완료`);
      } else {
        console.log(`  ✗ 업데이트 실패`);
      }
    }
  }
}

updateUrls().catch(console.error);
