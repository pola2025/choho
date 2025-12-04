const fs = require('fs');

// Update page.tsx to add WinterNoticePopup
const pageContent = `import {
  Hero,
  Welcome,
  RoomList,
  CheckinGuide,
  Facilities,
  JournalPreview,
} from "@/components/sections";
import { IceWallPopup } from "@/components/IceWallPopup";
import { WinterNoticePopup } from "@/components/WinterNoticePopup";

export default function Home() {
  return (
    <main className="-mt-16">
      <Hero />
      <Welcome />
      <RoomList />
      <CheckinGuide />
      <Facilities />
      <JournalPreview />
      <IceWallPopup />
      <WinterNoticePopup />
    </main>
  );
}
`;

fs.writeFileSync('src/app/page.tsx', pageContent, 'utf8');
console.log('Updated page.tsx with WinterNoticePopup!');

// Update data.ts to add winter notice journal
const dataContent = `import type { Room, Journal } from "@/types";

export const rooms: Room[] = [
  {
    id: "1",
    name: "호수뷰 객실",
    slug: "lakeview",
    type: "bed",
    capacity: { standard: 4, maximum: 6 },
    area: 20,
    description: "아름다운 호수를 바라보며 즐기는 특별한 휴식. 숲과 호수를 만날 수 있는 객실입니다.",
    thumbnail: "/images/rooms/lakeview/main.webp",
    images: [
      { src: "/images/rooms/lakeview/33b7b5a1c1d9c.webp", alt: "호수뷰 객실 전경" },
      { src: "/images/rooms/lakeview/5813e8a445dcd.webp", alt: "호수뷰 객실 내부" },
      { src: "/images/rooms/lakeview/ec404e547ee96.webp", alt: "호수뷰 객실 침실" },
      { src: "/images/rooms/lakeview/969b5f7afc30b.webp", alt: "호수뷰 객실 거실" },
      { src: "/images/rooms/lakeview/cd1a71ba83636.webp", alt: "호수뷰 객실 욕실" },
    ],
    amenities: {
      provided: [
        "스마트폰 3종 충전기",
        "전자레인지",
        "소형냉장고",
        "조리도구, 식기",
        "전기인덕션",
        "수건",
        "바디워시/샴푸/비누",
      ],
      notProvided: ["전기밥솥", "칫솔/치약", "개인 조미료"],
    },
    policies: {
      checkIn: "15:00 - 22:00",
      checkOut: "11:00",
      extraPerson: [
        "36개월 미만 아동 추가인원 요금 미부과 (인원에는 포함)",
        "36개월 이상 추가인원 포함 요금부과",
        "어른 6명, 유아 1명 추가 불가",
      ],
      refund: [
        { days: "7-9일 전", rate: "90%" },
        { days: "5-6일 전", rate: "70%" },
        { days: "3-4일 전", rate: "50%" },
        { days: "2일 전", rate: "20%" },
        { days: "1일 전 ~ 당일", rate: "환불불가" },
      ],
      notices: [
        "크린토피아 펜션 클리닝 서비스 이용",
        "애견입실 불가능",
        "보호자 동반하지 않은 미성년자 이용 불가",
        "객실 내 절대 금연",
        "삼겹살 등 육류 직화 조리 금지",
        "양초 점화 엄격히 단속",
        "목조 건물로 화재 위험 주의",
        "퇴실 시 모든 쓰레기 분리수거",
        "사용한 식기류 세척",
      ],
    },
    naverBookingUrl: "https://booking.naver.com/booking/3/bizes/608360?preview=1",
  },
  {
    id: "2",
    name: "Forest",
    slug: "forest",
    type: "bed",
    capacity: { standard: 2, maximum: 4 },
    area: 12,
    description: "숲속 산새 소리와 함께 하는 힐링 스테이. 숲속에서 즐기는 편안한 휴식을 위한 침대 객실입니다.",
    thumbnail: "/images/rooms/forest/main.webp",
    images: [
      { src: "/images/rooms/forest/0062fb88ef43a.webp", alt: "Forest 객실 전경" },
      { src: "/images/rooms/forest/10e393b267d20.webp", alt: "Forest 객실 내부" },
      { src: "/images/rooms/forest/15fddc2a64e6c.webp", alt: "Forest 객실 테라스" },
      { src: "/images/rooms/forest/2779cfff43741.webp", alt: "Forest 객실 욕실" },
    ],
    amenities: {
      provided: [
        "스마트폰 3종 충전기",
        "전자레인지",
        "소형냉장고",
        "조리도구, 식기",
        "전기인덕션",
        "수건",
        "바디워시/샴푸/비누",
      ],
      notProvided: ["전기밥솥", "칫솔/치약", "개인 조미료"],
    },
    policies: {
      checkIn: "15:00 - 22:00",
      checkOut: "11:00",
      extraPerson: [
        "36개월 미만 아동 추가인원 요금 미부과 (인원에는 포함)",
        "36개월 이상 추가인원 포함 요금부과",
        "어른 4명, 유아 1명 추가 불가",
      ],
      refund: [
        { days: "7-9일 전", rate: "90%" },
        { days: "5-6일 전", rate: "70%" },
        { days: "3-4일 전", rate: "50%" },
        { days: "2일 전", rate: "20%" },
        { days: "1일 전 ~ 당일", rate: "환불불가" },
      ],
      notices: [
        "크린토피아 펜션 클리닝 서비스 이용",
        "애견입실 불가능",
        "보호자 동반하지 않은 미성년자 이용 불가",
        "객실 내 절대 금연",
        "삼겹살 등 육류 직화 조리 금지",
        "양초 점화 엄격히 단속",
        "목조 건물로 화재 위험 주의",
        "퇴실 시 모든 쓰레기 분리수거",
        "사용한 식기류 세척",
      ],
    },
    naverBookingUrl: "https://booking.naver.com/booking/3/bizes/608360/items/4167246/?preview=1",
  },
  {
    id: "3",
    name: "Forest Mini",
    slug: "forest-mini",
    type: "bed",
    capacity: { standard: 2, maximum: 2 },
    area: 8,
    description: "초리골 숲에서 보내는 프라이빗한 휴식. 2인만을 위한 아늑한 침대 객실입니다.",
    thumbnail: "/images/rooms/forest-mini/main.webp",
    images: [
      { src: "/images/rooms/forest-mini/022d94fa1e442.webp", alt: "Forest Mini 객실 전경" },
      { src: "/images/rooms/forest-mini/0397a69dd4d14.webp", alt: "Forest Mini 객실 내부" },
      { src: "/images/rooms/forest-mini/0c3490a0b45aa.webp", alt: "Forest Mini 객실 테라스" },
    ],
    amenities: {
      provided: [
        "스마트폰 3종 충전기",
        "전자레인지",
        "소형냉장고",
        "조리도구, 식기",
        "전기인덕션",
        "수건",
        "바디워시/샴푸/비누",
      ],
      notProvided: ["전기밥솥", "칫솔/치약", "개인 조미료"],
    },
    policies: {
      checkIn: "15:00 - 22:00",
      checkOut: "11:00",
      extraPerson: [
        "36개월 미만 아동 추가인원 요금 미부과 (인원에는 포함)",
        "36개월 이상 추가인원 포함 요금부과",
        "어른 2인, 유아 1명 추가 불가",
      ],
      refund: [
        { days: "7-9일 전", rate: "90%" },
        { days: "5-6일 전", rate: "70%" },
        { days: "3-4일 전", rate: "50%" },
        { days: "2일 전", rate: "20%" },
        { days: "1일 전 ~ 당일", rate: "환불불가" },
      ],
      notices: [
        "크린토피아 펜션 클리닝 서비스 이용",
        "애견입실 불가능",
        "보호자 동반하지 않은 미성년자 이용 불가",
        "객실 내 절대 금연",
        "삼겹살 등 육류 직화 조리 금지",
        "양초 점화 엄격히 단속",
        "목조 건물로 화재 위험 주의",
        "퇴실 시 모든 쓰레기 분리수거",
        "사용한 식기류 세척",
      ],
    },
    naverBookingUrl: "https://booking.naver.com/booking/3/bizes/608360/items/4167263/?preview=1",
  },
  {
    id: "4",
    name: "Forest 패밀리룸",
    slug: "forest-family",
    type: "ondol",
    capacity: { standard: 5, maximum: 5 },
    area: 12,
    description: "가족과 함께 즐기는 편안한 휴식. 어른 4명 + 아이 1명만 이용 가능한 온돌 객실입니다.",
    thumbnail: "/images/rooms/forest-family/main.webp",
    images: [
      { src: "/images/rooms/forest-family/20230428_131830.webp", alt: "Forest 패밀리 객실 전경" },
      { src: "/images/rooms/forest-family/20230428_131914.webp", alt: "Forest 패밀리 객실 내부" },
      { src: "/images/rooms/forest-family/20230428_132005.webp", alt: "Forest 패밀리 객실 테라스" },
      { src: "/images/rooms/forest-family/20230428_132047.webp", alt: "Forest 패밀리 객실 욕실" },
    ],
    amenities: {
      provided: [
        "스마트폰 3종 충전기",
        "전자레인지",
        "소형냉장고",
        "조리도구, 식기",
        "전기인덕션",
        "수건",
        "바디워시/샴푸/비누",
      ],
      notProvided: ["전기밥솥", "칫솔/치약", "개인 조미료"],
    },
    policies: {
      checkIn: "15:00 - 22:00",
      checkOut: "11:00",
      extraPerson: [
        "어른 4명 + 아이 1명만 이용 가능",
        "어른만 5명 이용 불가",
        "36개월 미만 아동 추가인원 요금 미부과 (인원에는 포함)",
      ],
      refund: [
        { days: "7-9일 전", rate: "90%" },
        { days: "5-6일 전", rate: "70%" },
        { days: "3-4일 전", rate: "50%" },
        { days: "2일 전", rate: "20%" },
        { days: "1일 전 ~ 당일", rate: "환불불가" },
      ],
      notices: [
        "크린토피아 펜션 클리닝 서비스 이용",
        "애견입실 불가능",
        "보호자 동반하지 않은 미성년자 이용 불가",
        "객실 내 절대 금연",
        "삼겹살 등 육류 직화 조리 금지",
        "양초 점화 엄격히 단속",
        "목조 건물로 화재 위험 주의",
        "퇴실 시 모든 쓰레기 분리수거",
        "사용한 식기류 세척",
      ],
    },
    naverBookingUrl: "https://booking.naver.com/booking/3/bizes/608360/items/5231608/?preview=1",
  },
  {
    id: "5",
    name: "Forest Mini 패밀리룸",
    slug: "forest-mini-family",
    type: "ondol",
    capacity: { standard: 3, maximum: 3 },
    area: 8,
    description: "합리적으로 쉴 수 있는 객실. 어른 2명 + 아이 1명만 이용 가능한 온돌 객실입니다.",
    thumbnail: "/images/rooms/forest-mini-family/main.webp",
    images: [
      { src: "/images/rooms/forest-mini-family/20230428_132325_1.webp", alt: "Forest Mini 패밀리 객실 전경" },
      { src: "/images/rooms/forest-mini-family/20230428_132427_1.webp", alt: "Forest Mini 패밀리 객실 내부" },
      { src: "/images/rooms/forest-mini-family/20230428_132548_1.webp", alt: "Forest Mini 패밀리 객실 테라스" },
    ],
    amenities: {
      provided: [
        "스마트폰 3종 충전기",
        "전자레인지",
        "소형냉장고",
        "조리도구, 식기",
        "전기인덕션",
        "수건",
        "바디워시/샴푸/비누",
      ],
      notProvided: ["전기밥솥", "칫솔/치약", "개인 조미료"],
    },
    policies: {
      checkIn: "15:00 - 22:00",
      checkOut: "11:00",
      extraPerson: [
        "어른 2명 + 아이 1명만 이용 가능",
        "어른만 3명 이용 불가",
        "36개월 미만 아동 추가인원 요금 미부과 (인원에는 포함)",
      ],
      refund: [
        { days: "7-9일 전", rate: "90%" },
        { days: "5-6일 전", rate: "70%" },
        { days: "3-4일 전", rate: "50%" },
        { days: "2일 전", rate: "20%" },
        { days: "1일 전 ~ 당일", rate: "환불불가" },
      ],
      notices: [
        "크린토피아 펜션 클리닝 서비스 이용",
        "애견입실 불가능",
        "보호자 동반하지 않은 미성년자 이용 불가",
        "객실 내 절대 금연",
        "삼겹살 등 육류 직화 조리 금지",
        "양초 점화 엄격히 단속",
        "목조 건물로 화재 위험 주의",
        "퇴실 시 모든 쓰레기 분리수거",
        "사용한 식기류 세척",
      ],
    },
    naverBookingUrl: "https://booking.naver.com/booking/3/bizes/608360/items/5231630/?preview=1",
  },
];

export const journals: Journal[] = [
  {
    id: "winter-notice-2025",
    category: "notice",
    title: "겨울철 이용 안내",
    excerpt: "동파 방지 물소리 및 테라스 그릴 사용 안내입니다.",
    content: \`겨울철 수도배관 동파 방지를 위해 물소리가 객실에서 들릴 수 있습니다.

초호펜션 객실 테라스는 한파에 캠핑버너그릴 착화가 안될 수 있습니다.

한파에는 별도안내 드리고 있으니 관리자 연락부탁드립니다.

문의: 010-7932-0029\`,
    createdAt: "2025-12-05",
    thumbnail: "/images/rooms/forest/main.webp",
    images: [],
  },
  {
    id: "ice-wall-2025",
    category: "notice",
    title: "2025년 12월 4일 빙벽 개시!",
    excerpt: "한파와 눈소식에 초호쉼터 빙벽이 오픈되었습니다.",
    content: \`한파와 눈소식에 초호쉼터 빙벽이 오픈되었습니다.

25년 12월 4일 현재 사진입니다.

올 겨울 초호펜션에서 특별한 빙벽 체험을 즐겨보세요!\`,
    createdAt: "2025-12-04",
    thumbnail: "/images/journal/ice-wall/ice-wall-thumb.webp",
    images: [
      "/images/journal/ice-wall/ice-wall-2.webp",
    ],
  },
];

export const bbqGuide = {
  winter: [
    "12월부터 객실 테라스 이용 중단",
    "영하 날씨에 가스버너 착화 불가",
    "객실 실내 가스버너 사용 절대 금지",
    "가스버너/캠핑그릴은 몽고텐트에서 이용",
    "겨울철 바베큐 시 야외용 개별 담요 직접 준비",
  ],
  safety: [
    "객실 내 고기굽기 절대 금지",
    "객실 테라스(데크) 흡연 절대 금지",
    "낙엽과 마른나뭇가지로 실화 위험 높음",
    "야외 바베큐 공간 저녁 10시 전체 소등",
  ],
};
`;

fs.writeFileSync('src/lib/data.ts', dataContent, 'utf8');
console.log('Updated data.ts with winter notice journal!');
