// 초리골 역사 데이터 에어테이블 일괄 입력 스크립트
// 실행: node scripts/seed-chorigol-history.js
// 환경변수 필요: AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_CHORIGOL_HISTORY_TABLE_ID

require('dotenv').config({ path: '.env.local' });

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_ID = process.env.AIRTABLE_CHORIGOL_HISTORY_TABLE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !AIRTABLE_TABLE_ID) {
  console.error('환경변수가 설정되지 않았습니다.');
  console.error('필요한 환경변수: AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_CHORIGOL_HISTORY_TABLE_ID');
  process.exit(1);
}

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_ID}`;

// 20개 초리골 역사 데이터
const historyData = [
  {
    year: "조선시대",
    title: "초리골 지명의 유래 - '꼬리'에서 비롯된 이름",
    content: "파주시 《지명유래집》에 따르면, '초리(礁栮)동, 초릿굴'은 법원4리 지역으로 마을 주변 산골짜기에 풀이 많이 난다 하여 붙은 이름입니다. 중앙일보 《강마을산마을》에서는 초리골이 눈의 꼬리처럼 길다고 해서 꼬리의 옛말인 '초리'에서 이름을 따왔다고 기록하고 있습니다. 또한 마을 뒷 바위 바닥에 암초버섯(현재의 석이버섯)이 많이 달려 '초이골'이라고도 불렸습니다.",
    source: "파주위키, 파주시 지명유래집",
    sourceUrl: "https://paju.wiki/mw/index.php/초리골_전원마을",
    category: "origin",
    order: 1,
    viewCount: 0,
    isPublished: true,
  },
  {
    year: "조선시대",
    title: "천현면(泉峴面)의 역사 - 샘재의 유래",
    content: "현 법원읍 지역은 조선시대에 천현(泉峴, 샘재)의 이름을 따서 천현면이라 불렸습니다. 갈곡리와 삼성대 골짜기에서 내려오는 샘물이 법원리와 대능리 벌판의 자갈과 모래로 덮인 지하 1km 정도로 물줄기가 흘러 가야리 황새말 앞으로 터져 흘러내려 '샘물을 덮어 흐르는 고개(泉峴)'라 하였습니다.",
    source: "위키백과, 파주시",
    sourceUrl: "https://ko.wikipedia.org/wiki/법원읍",
    category: "origin",
    order: 2,
    viewCount: 0,
    isPublished: true,
  },
  {
    year: "1900년대 초",
    title: "장군봉 은굴의 은 채광 역사",
    content: "1900년대 초반 일제강점기 때 장군봉 정상 아래 은굴에서 은을 채광했습니다. 굴의 길이는 정확히 알 수 없으나 구전에 의하면 명주실 한 타래 정도로 긴 굴로 추정됩니다. 채광 중 붕괴사고로 인해 수십 명의 인명피해가 발생했다고 전해집니다.",
    source: "파주위키",
    sourceUrl: "https://paju.wiki/mw/index.php/초리골_전원마을",
    category: "history",
    order: 3,
    viewCount: 0,
    isPublished: true,
  },
  {
    year: "1947년",
    title: "초호정의 탄생 - 나눔으로 일궈낸 연못",
    content: "일제강점기 직후 어려운 시기에 초호 우종하 선생은 마을 주민들에게 연못 공사를 의뢰하고 품삯으로 식량을 제공했습니다. 중장비 없이 맨손과 호미로 완성된 초호정은 나눔의 기적이었으며, 이후 마을의 상징이 되었습니다.",
    source: "초호펜션",
    sourceUrl: "https://www.chorigol.co.kr",
    category: "history",
    order: 4,
    viewCount: 0,
    isPublished: true,
  },
  {
    year: "1960년대",
    title: "은굴 폐광과 군부대 봉쇄",
    content: "1960년대까지 은을 채취하다 폐광되었습니다. 빈번한 간첩의 침투로 인해 군부대에서 굴 입구를 콘크리트로 봉하여 지금까지 유지되고 있습니다. 과거 간첩 침투로 봉인된 은굴을 개발해 역사적 의미를 되찾을 전망입니다.",
    source: "파주위키, 파주시 문화관광포털",
    sourceUrl: "https://tour.paju.go.kr/user/tour/place/BD_tourPlaceInfoView.do?q_gubun=area&areaSe=1001&cntntsSn=547",
    category: "history",
    order: 5,
    viewCount: 0,
    isPublished: true,
  },
  {
    year: "1968년",
    title: "1.21 사태 - 초리골 삼봉산에서 무장공비 발견",
    content: "1968년 1월 21일 청와대 기습을 노린 북한 무장공비 31명이 초리골 삼봉산에서 휴식 중 나무하러 산에 올라온 우씨 4형제와 마주쳤습니다. 공비들은 투표 끝에 형제들을 살려주었고, 형제들은 곧바로 인근 파출소에 신고했습니다. 이 사건은 대한민국 역사에 중요한 사건으로 기록되었습니다.",
    source: "위키백과, 국가기록원",
    sourceUrl: "https://ko.wikipedia.org/wiki/1·21_사태",
    category: "history",
    order: 6,
    viewCount: 0,
    isPublished: true,
  },
  {
    year: "1989년",
    title: "천현면에서 법원읍으로 승격",
    content: "1989년 4월 1일 군 조례 제1280호에 의해 천현면이 법원읍으로 명칭 변경과 함께 승격되었습니다. 법원읍이라는 이름은 법의리(法儀里)와 원기리(院基里)에서 한 자씩 따온 것으로, 사법기관 법원(法院)과는 관련이 없습니다.",
    source: "위키백과",
    sourceUrl: "https://ko.wikipedia.org/wiki/법원읍",
    category: "history",
    order: 7,
    viewCount: 0,
    isPublished: true,
  },
  {
    year: "1992년",
    title: "초리골 마을 운영 규약 제정 - 자연환경 보전의 시작",
    content: "파주시 법원읍 초리골 마을 주민들은 1992년 마을 운영 규약을 만들어 지금까지 지켜오고 있습니다. 규약에는 공장·축사 등 신축을 제한하고 2층 초과 건물 신축 시 마을 동의를 받도록 하며, 자연환경 파괴가 우려되는 행위를 차단하는 내용이 담겨있습니다.",
    source: "파주위키, 파이낸셜뉴스",
    sourceUrl: "https://www.fnnews.com/news/202002210439203836",
    category: "development",
    order: 8,
    viewCount: 0,
    isPublished: true,
  },
  {
    year: "1615년",
    title: "자운서원 건립 - 율곡 이이 선생을 기리다",
    content: "자운서원은 조선시대의 대학자 율곡 이이의 학문과 덕행을 추모하고자 광해군 7년(1615)에 건립되었습니다. 효종 1년(1650)에 '자운'이라는 사액을 받았으며, 숙종 39년(1713)에 김장생과 박세채를 추가 배향했습니다. 흥선대원군의 서원철폐령으로 1868년 폐쇄되었다가 1969년 복원되었습니다.",
    source: "위키백과, 파주시 문화관광포털",
    sourceUrl: "https://ko.wikipedia.org/wiki/자운서원",
    category: "culture",
    order: 9,
    viewCount: 0,
    isPublished: true,
  },
  {
    year: "현재",
    title: "비학산과 12개 봉우리 - 초리골을 둘러싼 산세",
    content: "비학산(해발 454m)은 학이 날개를 펴고 날아가는 형국의 산입니다. 초리골을 중심으로 12개의 봉우리가 주위를 둘러싸고 있으며 능선 길이가 12km에 이릅니다. 비학산 정상 전망대에서는 직천저수지와 감악산이 시원하게 조망됩니다.",
    source: "파주위키, 파주시 문화관광포털",
    sourceUrl: "https://paju.wiki/mw/index.php/초리골_전원마을",
    category: "nature",
    order: 10,
    viewCount: 0,
    isPublished: true,
  },
  {
    year: "현재",
    title: "초리골의 야생동물 - 도롱뇽, 가재, 노루가 사는 마을",
    content: "초리골은 비학산과 암산 사이에 자리 잡은 마을로, 도롱뇽, 가재, 노루, 오소리 등 야생동물이 서식합니다. 마을 규약으로 자연환경을 보전해온 덕분에 맑은 계곡과 풍부한 생태계가 유지되고 있습니다.",
    source: "파주위키",
    sourceUrl: "https://paju.wiki/mw/index.php/초리골_전원마을",
    category: "nature",
    order: 11,
    viewCount: 0,
    isPublished: true,
  },
  {
    year: "현재",
    title: "장군봉과 장군바위 - 장수의 전설이 깃든 봉우리",
    content: "다산수도원에서 좌측 산길로 오르면 장군바위 전망대가 있고, 200여m를 더 오르면 해발 400m의 장군봉이 있습니다. 장군봉은 장수가 바위로 공기놀이를 했다는 장군바위가 있어 붙여진 이름으로 전해집니다.",
    source: "파주위키",
    sourceUrl: "https://paju.wiki/mw/index.php/초리골_전원마을",
    category: "nature",
    order: 12,
    viewCount: 0,
    isPublished: true,
  },
  {
    year: "현재",
    title: "다산수도원 - 초리골 깊은 곳의 노동피정 공간",
    content: "초리골 계곡 끝에 위치한 천주교 다산수도원은 주변에 28만평의 전답과 양어장, 가축 사육장이 있어 육체노동이 주는 신선한 의미를 느끼는 '노동피정'의 공간으로 이용되고 있습니다.",
    source: "파주위키",
    sourceUrl: "https://paju.wiki/mw/index.php/초리골_전원마을",
    category: "culture",
    order: 13,
    viewCount: 0,
    isPublished: true,
  },
  {
    year: "현재",
    title: "단양우씨 집성촌 - 대대로 이어온 마을 공동체",
    content: "2020년 말 현재 초리골에는 98세대에 190여명이 거주하고 있으며, 단양우씨가 20%정도를 차지합니다. 조선 개국 초 정도전의 탄압을 피해 전국 산간벽지로 흩어진 단양우씨 일가가 이곳에 정착해 집성촌을 이루었습니다.",
    source: "파주위키",
    sourceUrl: "https://paju.wiki/mw/index.php/초리골_전원마을",
    category: "history",
    order: 14,
    viewCount: 0,
    isPublished: true,
  },
  {
    year: "2018년",
    title: "초비클럽 결성 - 귀촌민과 원주민이 함께하는 공동체",
    content: "2018년 초리골 지역의 사업자 15명이 결성한 마을공동체 '초비클럽'이 탄생했습니다. 귀촌민과 원주민이 융합한 자생모임으로, '눈 내리는 초리골' 겨울축제 아이디어가 바로 이곳에서 나왔습니다.",
    source: "파이낸셜뉴스",
    sourceUrl: "https://www.fnnews.com/news/202002210439203836",
    category: "development",
    order: 15,
    viewCount: 0,
    isPublished: true,
  },
  {
    year: "2018년",
    title: "더 초리골 수영장 개장 - 여름 휴양지로의 변신",
    content: "2018년 여름에 개장한 수영장 '더 초리골'로 초리골이 여름 휴양지 모습을 갖추게 되었습니다. 취사가 가능한 특색 있는 수영장으로 여름에는 하루 평균 500여명이 방문합니다.",
    source: "파이낸셜뉴스",
    sourceUrl: "https://www.fnnews.com/news/202002210439203836",
    category: "development",
    order: 16,
    viewCount: 0,
    isPublished: true,
  },
  {
    year: "2019년",
    title: "눈 내리는 초리골 겨울축제 시작",
    content: "2019년부터 파주시 유일의 겨울축제 '눈 내리는 초리골'이 개최되었습니다. 마을 전체가 골짜기로 이루어져 겨울철 기온이 낮은 지역의 자연환경을 이용해 눈썰매장, 얼음썰매장, 빙어잡기, 송어낚시 체험장을 운영합니다.",
    source: "파주시 문화관광포털",
    sourceUrl: "https://tour.paju.go.kr/user/board/BD_board.view.do?bbsCd=2001&seq=20191231151147883",
    category: "development",
    order: 17,
    viewCount: 0,
    isPublished: true,
  },
  {
    year: "2019년",
    title: "초리골 협동조합 설립 - 마을살리기 프로젝트",
    content: "파주형 마을살리기 프로젝트의 일환으로 2019년 11월 초리골 협동조합이 설립되었습니다. 초리골협동조합은 마을 개발 및 복지 증진, 문화 보존 및 육성, 주민소득사업 추진 등을 관장합니다.",
    source: "파주위키, 파이낸셜뉴스",
    sourceUrl: "https://paju.wiki/mw/index.php/초리골_전원마을",
    category: "development",
    order: 18,
    viewCount: 0,
    isPublished: true,
  },
  {
    year: "2020년",
    title: "파주의 알프스 - 소득 주도형 마을로 진화",
    content: "'파주의 알프스'라 불릴 만큼 자연경관이 수려한 초리골은 펜션, 캠핑장, 카페, 음식점, 수영장 등이 조성되어 등산객, 캠핑족, 탐방객들이 즐겨 찾는 숨은 명소가 되었습니다. 주민 스스로 지켜온 아름다운 초리골은 파주형 마을살리기 프로젝트에 힘입어 '소득 주도형' 마을로 진화하고 있습니다.",
    source: "파이낸셜뉴스",
    sourceUrl: "https://www.fnnews.com/news/202002210439203836",
    category: "development",
    order: 19,
    viewCount: 0,
    isPublished: true,
  },
  {
    year: "2025년",
    title: "1.21 사태 생존자 김신조 별세 - 우씨 형제 빈소 방문",
    content: "2025년 4월 9일 김신조가 향년 83세로 세상을 떠났습니다. 1968년 1.21 사태 당시 초리골 삼봉산에서 무장공비 일행과 마주친 뒤 위기를 모면하고 신고했던 나무꾼 4형제의 막내 우성제 씨 등이 빈소를 찾았습니다.",
    source: "뉴스 보도",
    sourceUrl: "https://namu.wiki/w/김신조",
    category: "history",
    order: 20,
    viewCount: 0,
    isPublished: true,
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
  console.log('초리골 역사 데이터 에어테이블 입력 시작...\n');

  try {
    // Airtable API는 한 번에 최대 10개 레코드 생성 가능
    const batch1 = historyData.slice(0, 10);
    const batch2 = historyData.slice(10, 20);

    console.log('1차 배치 (1-10번) 입력 중...');
    const result1 = await createRecords(batch1);
    console.log(`✓ ${result1.records.length}개 레코드 생성 완료\n`);

    console.log('2차 배치 (11-20번) 입력 중...');
    const result2 = await createRecords(batch2);
    console.log(`✓ ${result2.records.length}개 레코드 생성 완료\n`);

    console.log('========================================');
    console.log(`총 ${result1.records.length + result2.records.length}개 레코드 입력 완료!`);
    console.log('========================================\n');

    // 생성된 레코드 ID 출력
    console.log('생성된 레코드 ID:');
    [...result1.records, ...result2.records].forEach((record, index) => {
      console.log(`${index + 1}. ${record.id}: ${record.fields.title}`);
    });

  } catch (error) {
    console.error('에러 발생:', error.message);
    process.exit(1);
  }
}

main();
