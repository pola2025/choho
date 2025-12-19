// 팝업 아카이브 데이터 에어테이블 입력 스크립트
// 실행: node scripts/seed-popups.js
// 환경변수 필요: AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_POPUP_TABLE_ID

require('dotenv').config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_POPUP_TABLE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
  console.error('환경변수가 설정되지 않았습니다.');
  console.error('필요한 환경변수: AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_POPUP_TABLE_ID');
  process.exit(1);
}

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`;

// 현재 사이트에서 사용 중인 팝업 데이터
// 필드명: Name, Status (대문자)
const popupData = [
  {
    Name: "입실시간 안내",
    description: "저녁 18:00 이후 입실 시 관리자 사전 연락 필수 안내",
    category: "notice",
    Status: "active",
    startDate: "2024-12-01",
    thumbnailUrl: "https://www.chorigol.co.kr/images/rooms/forest/main.webp",
    order: 1,
    isActive: true,
  },
  {
    Name: "눈썰매장 입장권 할인",
    description: "초호펜션 이용고객 대상 초리골 눈썰매장 입장권 할인 혜택",
    category: "promotion",
    Status: "active",
    startDate: "2024-12-15",
    endDate: "2025-02-28",
    thumbnailUrl: "https://www.chorigol.co.kr/images/journal/ice-wall/ice-wall-2.webp",
    order: 2,
    isActive: true,
  },
  {
    Name: "카페 음료 10% 할인",
    description: "눈썰매장 입장 팔찌 지참 시 초리골164 베이커리 카페 음료 10% 할인",
    category: "promotion",
    Status: "active",
    startDate: "2024-12-15",
    endDate: "2025-02-28",
    thumbnailUrl: "https://www.chorigol.co.kr/images/cafe/cafe-main.webp",
    order: 3,
    isActive: true,
  },
  {
    Name: "겨울철 이용 안내",
    description: "동파 예방 물소리, 테라스 그릴 사용 불가, 조설기 소음 안내",
    category: "notice",
    Status: "active",
    startDate: "2024-12-01",
    endDate: "2025-02-28",
    thumbnailUrl: "https://www.chorigol.co.kr/images/rooms/forest/main.webp",
    order: 4,
    isActive: true,
  },
  {
    Name: "빙벽 시즌 오픈",
    description: "한파와 함께 초호펜션 빙벽이 아름답게 얼어붙었습니다",
    category: "event",
    Status: "active",
    startDate: "2024-12-20",
    endDate: "2025-02-15",
    thumbnailUrl: "https://www.chorigol.co.kr/images/journal/ice-wall/ice-wall-2.webp",
    order: 5,
    isActive: true,
  },
];

async function createRecords(records) {
  const response = await fetch(AIRTABLE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      records: records.map(record => ({ fields: record })),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Airtable API Error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

async function main() {
  console.log('팝업 아카이브 데이터 에어테이블 입력 시작...\n');

  try {
    console.log(`${popupData.length}개 팝업 데이터 입력 중...`);
    const result = await createRecords(popupData);
    console.log(`✓ ${result.records.length}개 레코드 생성 완료\n`);

    console.log('========================================');
    console.log(`총 ${result.records.length}개 팝업 입력 완료!`);
    console.log('========================================\n');

    // 생성된 레코드 출력
    console.log('생성된 팝업 목록:');
    result.records.forEach((record, index) => {
      console.log(`${index + 1}. ${record.fields.name} (${record.fields.category})`);
    });

  } catch (error) {
    console.error('에러 발생:', error.message);
    process.exit(1);
  }
}

main();
