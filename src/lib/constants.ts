export const SITE_CONFIG = {
  name: "초호펜션",
  description: "서울에서 1시간, 자연 속 힐링 펜션",
  url: "https://www.chorigol.co.kr",
  phone: "031-584-8377",
  mobilePhone: "010-7932-0029",
  address: {
    road: "경기도 파주시 법원읍 초리골길 134",
    jibun: "경기도 파주시 법원읍 법원리 168",
  },
  social: {
    instagram: "https://instagram.com/choho_pension",
    naver: "https://booking.naver.com/booking/3/bizes/608360",
    naverMap: "https://map.naver.com/p/entry/place/1149332657",
  },
};

export const NAV_ITEMS = [
  { label: "초호펜션", href: "/" },
  { label: "객실정보", href: "/rooms" },
  { label: "초리골164카페", href: "/cafe" },
  { label: "초호역사", href: "/about" },
  { label: "오시는길", href: "/location" },
] as const;

export const ROOM_TYPES = [
  { id: "lakeview", name: "호수뷰 객실", capacity: { standard: 2, max: 4 } },
  { id: "forest", name: "Forest", capacity: { standard: 2, max: 4 } },
  { id: "forest-mini", name: "Forest Mini", capacity: { standard: 2, max: 3 } },
] as const;
