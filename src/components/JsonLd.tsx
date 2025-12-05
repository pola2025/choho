import { SITE_CONFIG } from "@/lib/constants";

const BASE_URL = "https://www.chorigol.co.kr";

// Organization 스키마
export function OrganizationJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    url: BASE_URL,
    logo: `${BASE_URL}/images/logo-main.webp`,
    description: SITE_CONFIG.description,
    telephone: SITE_CONFIG.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE_CONFIG.address.road,
      addressLocality: "파주시",
      addressRegion: "경기도",
      postalCode: "10859",
      addressCountry: "KR",
    },
    sameAs: [
      SITE_CONFIG.social.instagram,
      SITE_CONFIG.social.naver,
      SITE_CONFIG.social.naverMap,
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// LocalBusiness (LodgingBusiness) 스키마
export function LodgingBusinessJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: SITE_CONFIG.name,
    description: "서울에서 1시간, 자연 속 힐링 펜션. 호수뷰, Forest, Forest Mini 객실과 초리골164 카페가 있는 초호펜션입니다.",
    url: BASE_URL,
    telephone: SITE_CONFIG.phone,
    image: [
      `${BASE_URL}/images/gallery-1.webp`,
      `${BASE_URL}/images/rooms/lakeview/main.webp`,
      `${BASE_URL}/images/rooms/forest/main.webp`,
    ],
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE_CONFIG.address.road,
      addressLocality: "파주시",
      addressRegion: "경기도",
      postalCode: "10859",
      addressCountry: "KR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 37.8641,
      longitude: 126.9347,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      opens: "15:00",
      closes: "22:00",
    },
    checkinTime: "15:00",
    checkoutTime: "11:00",
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "무료 주차", value: true },
      { "@type": "LocationFeatureSpecification", name: "Wi-Fi", value: true },
      { "@type": "LocationFeatureSpecification", name: "바베큐 시설", value: true },
      { "@type": "LocationFeatureSpecification", name: "카페", value: true },
    ],
    priceRange: "₩₩",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// WebSite 스키마 (사이트 검색 기능)
export function WebSiteJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    url: BASE_URL,
    description: SITE_CONFIG.description,
    inLanguage: "ko-KR",
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/images/logo-main.webp`,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// BreadcrumbList 스키마
interface BreadcrumbItem {
  name: string;
  href: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.href}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// HotelRoom 스키마 (객실 정보)
interface RoomData {
  name: string;
  slug: string;
  description: string;
  capacity: { standard: number; maximum: number };
  area: number;
  thumbnail: string;
  type: "bed" | "ondol";
}

export function HotelRoomJsonLd({ room }: { room: RoomData }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HotelRoom",
    name: room.name,
    description: room.description,
    url: `${BASE_URL}/rooms/${room.slug}`,
    image: `${BASE_URL}${room.thumbnail}`,
    occupancy: {
      "@type": "QuantitativeValue",
      minValue: 1,
      maxValue: room.capacity.maximum,
    },
    bed: {
      "@type": "BedDetails",
      typeOfBed: room.type === "bed" ? "퀸사이즈 침대" : "온돌",
      numberOfBeds: 1,
    },
    floorSize: {
      "@type": "QuantitativeValue",
      value: room.area,
      unitCode: "PY",
      unitText: "평",
    },
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "전자레인지", value: true },
      { "@type": "LocationFeatureSpecification", name: "냉장고", value: true },
      { "@type": "LocationFeatureSpecification", name: "전기인덕션", value: true },
      { "@type": "LocationFeatureSpecification", name: "수건", value: true },
      { "@type": "LocationFeatureSpecification", name: "어메니티", value: true },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// 객실 목록 스키마 (rooms 페이지용)
export function RoomListJsonLd({ rooms }: { rooms: RoomData[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "초호펜션 객실 목록",
    description: "초호펜션의 모든 객실 안내",
    numberOfItems: rooms.length,
    itemListElement: rooms.map((room, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "HotelRoom",
        name: room.name,
        description: room.description,
        url: `${BASE_URL}/rooms/${room.slug}`,
        image: `${BASE_URL}${room.thumbnail}`,
        occupancy: {
          "@type": "QuantitativeValue",
          minValue: 1,
          maxValue: room.capacity.maximum,
        },
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
