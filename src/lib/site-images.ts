// 사이트에서 사용되는 이미지 정의
// 이 파일의 URL을 수정하면 사이트에 바로 반영됩니다

export interface SiteImage {
  id: string;
  name: string;
  src: string;
  usedIn: string[];
  description?: string;
  room?: string;
}

export interface SiteImages {
  hero: SiteImage[];
  gallery: SiteImage[];
  rooms: SiteImage[];
  facilities: SiteImage[];
}

// 기본 이미지 데이터 (현재 사이트에서 사용 중인 이미지)
export const defaultSiteImages: SiteImages = {
  hero: [
    {
      id: "hero-main",
      name: "메인 히어로",
      src: "https://cdn.imweb.me/thumbnail/20231227/534aa65eac23d.jpg",
      usedIn: ["Hero.tsx", "rooms/page.tsx"],
      description: "메인 페이지 히어로 배경",
    },
  ],
  gallery: [
    { id: "gallery-0", name: "초호펜션 전경", src: "https://cdn.imweb.me/thumbnail/20231227/b3d0b94aaf2aa.jpg", usedIn: ["Gallery.tsx"] },
    { id: "gallery-1", name: "호수 풍경", src: "https://cdn.imweb.me/thumbnail/20231227/c261f180ed066.jpg", usedIn: ["Gallery.tsx"] },
    { id: "gallery-2", name: "객실 내부", src: "https://cdn.imweb.me/thumbnail/20231227/b9733eaa5602c.jpg", usedIn: ["Gallery.tsx"] },
    { id: "gallery-3", name: "카페 외관", src: "https://cdn.imweb.me/thumbnail/20231227/967a2c566530a.jpg", usedIn: ["Gallery.tsx"] },
    { id: "gallery-4", name: "바베큐장", src: "https://cdn.imweb.me/upload/S202110067f162833b69cd/58bb12f425faa.jpg", usedIn: ["Gallery.tsx"] },
    { id: "gallery-5", name: "정원", src: "https://cdn.imweb.me/thumbnail/20231227/bf5138ddec73a.jpg", usedIn: ["Gallery.tsx"] },
    { id: "gallery-6", name: "동물 친구들", src: "https://cdn.imweb.me/thumbnail/20231227/e78fdb82a45e7.jpg", usedIn: ["Gallery.tsx"] },
    { id: "gallery-7", name: "야경", src: "https://cdn.imweb.me/thumbnail/20231227/659a296632931.jpg", usedIn: ["Gallery.tsx"] },
  ],
  rooms: [
    { id: "room-lakeview-thumb", name: "호수뷰 썸네일", src: "https://cdn.imweb.me/upload/S202110067f162833b69cd/04e7f9566ee81.jpg", usedIn: ["data.ts"], room: "호수뷰 객실" },
    { id: "room-lakeview-0", name: "호수뷰 전경", src: "https://cdn.imweb.me/thumbnail/20231227/33b7b5a1c1d9c.jpg", usedIn: ["data.ts"], room: "호수뷰 객실" },
    { id: "room-lakeview-1", name: "호수뷰 내부", src: "https://cdn.imweb.me/thumbnail/20231227/5813e8a445dcd.jpg", usedIn: ["data.ts"], room: "호수뷰 객실" },
    { id: "room-lakeview-2", name: "호수뷰 침실", src: "https://cdn.imweb.me/thumbnail/20231227/ec404e547ee96.jpg", usedIn: ["data.ts"], room: "호수뷰 객실" },
    { id: "room-lakeview-3", name: "호수뷰 거실", src: "https://cdn.imweb.me/thumbnail/20231227/969b5f7afc30b.jpg", usedIn: ["data.ts"], room: "호수뷰 객실" },
    { id: "room-lakeview-4", name: "호수뷰 욕실", src: "https://cdn.imweb.me/thumbnail/20231227/cd1a71ba83636.jpg", usedIn: ["data.ts"], room: "호수뷰 객실" },
    { id: "room-forest-thumb", name: "Forest 썸네일", src: "https://cdn.imweb.me/thumbnail/20240722/8527defd0b7fc.jpg", usedIn: ["data.ts"], room: "Forest" },
    { id: "room-forest-0", name: "Forest 전경", src: "https://cdn.imweb.me/thumbnail/20240722/47296e2b83ada.jpg", usedIn: ["data.ts"], room: "Forest" },
    { id: "room-forest-1", name: "Forest 내부", src: "https://cdn.imweb.me/thumbnail/20240722/33431c681c979.jpg", usedIn: ["data.ts"], room: "Forest" },
    { id: "room-forest-2", name: "Forest 테라스", src: "https://cdn.imweb.me/thumbnail/20240722/58b3a64dfaa81.jpg", usedIn: ["data.ts"], room: "Forest" },
    { id: "room-forest-3", name: "Forest 욕실", src: "https://cdn.imweb.me/thumbnail/20240722/91d0c190c02f6.jpg", usedIn: ["data.ts"], room: "Forest" },
    { id: "room-forestmini-thumb", name: "Forest Mini 썸네일", src: "https://cdn.imweb.me/thumbnail/20240722/15b8624e8ed80.jpg", usedIn: ["data.ts"], room: "Forest Mini" },
    { id: "room-forestmini-0", name: "Forest Mini 전경", src: "https://cdn.imweb.me/thumbnail/20240722/36cf4885a8137.jpg", usedIn: ["data.ts"], room: "Forest Mini" },
    { id: "room-forestmini-1", name: "Forest Mini 내부", src: "https://cdn.imweb.me/thumbnail/20240722/ed6d714929445.jpg", usedIn: ["data.ts"], room: "Forest Mini" },
    { id: "room-forestmini-2", name: "Forest Mini 테라스", src: "https://cdn.imweb.me/thumbnail/20240722/3872552ba3257.jpg", usedIn: ["data.ts"], room: "Forest Mini" },
  ],
  facilities: [
    { id: "facility-breakfast", name: "조식", src: "https://cdn.imweb.me/thumbnail/20231227/d73522fdf8e44.jpg", usedIn: ["Facilities.tsx"] },
    { id: "facility-bbq", name: "바베큐", src: "https://cdn.imweb.me/upload/S202110067f162833b69cd/58bb12f425faa.jpg", usedIn: ["Facilities.tsx"] },
  ],
};

// 이미지 ID로 특정 이미지 찾기
export function findImageById(images: SiteImages, id: string): SiteImage | null {
  for (const category of Object.values(images)) {
    const found = category.find((img: SiteImage) => img.id === id);
    if (found) return found;
  }
  return null;
}

// 이미지 URL 업데이트
export function updateImageSrc(images: SiteImages, id: string, newSrc: string): SiteImages {
  const updated = JSON.parse(JSON.stringify(images)) as SiteImages;

  for (const category of Object.keys(updated) as (keyof SiteImages)[]) {
    const idx = updated[category].findIndex((img) => img.id === id);
    if (idx !== -1) {
      updated[category][idx].src = newSrc;
      break;
    }
  }

  return updated;
}
