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
  createdAt: string;
  thumbnail?: string;
}

export interface MenuItem {
  id: string;
  category: "coffee" | "latte" | "tea" | "ade" | "others";
  name: string;
  priceHot?: number;
  priceIced?: number;
  isNew?: boolean;
}
