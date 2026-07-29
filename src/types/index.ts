export interface RoomImage {
  src: string;
  alt: string;
}

export interface RefundPolicy {
  days: string;
  rate: string;
}

export interface Room {
  id: string;
  name: string;
  slug: string;
  type: "bed" | "ondol";
  capacity: {
    standard: number;
    maximum: number;
    /** 지정 시 "기준 N인 / 최대 N인" 대신 이 문구를 노출 (예: 패밀리룸 "정원 4명 + 유아 1명") */
    label?: string;
  };
  area: number;
  description: string;
  thumbnail: string;
  images: RoomImage[];
  amenities: {
    provided: string[];
    notProvided: string[];
  };
  policies: {
    checkIn: string;
    checkOut: string;
    extraPerson: string[];
    refund: RefundPolicy[];
    notices: string[];
  };
  naverBookingUrl: string;
}

export interface Journal {
  id: string;
  category: "notice" | "guide" | "event";
  title: string;
  excerpt: string;
  content: string;
  createdAt: string;
  thumbnail?: string;
  images?: string[];
  isPublished?: boolean; // 비공개 처리용
}

export interface MenuItem {
  id: string;
  category: "coffee" | "latte" | "tea" | "ade" | "others";
  name: string;
  priceHot?: number;
  priceIced?: number;
  isNew?: boolean;
}
