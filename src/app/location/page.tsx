import { Metadata } from "next";
import { MapPin, Phone, Car, ExternalLink } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";
import { CopyButton } from "@/components/ui/CopyButton";

export const metadata: Metadata = {
  title: "찾아오시는 길 | 초호펜션",
  description: "초호펜션 오시는 길 안내. 경기도 파주시 법원읍 초리골길 134. 서울에서 1시간 거리의 힐링 공간.",
};

export default function LocationPage() {
  return (
    <main className="-mt-16">
      {/* Hero Section */}
      <section
        className="relative h-[40vh] min-h-[300px] flex items-center justify-center"
        style={{
          backgroundImage: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/images/hero/442eeb10cfffb.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "#3d4a3d",
        }}
      >
        <div className="text-center text-white px-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <MapPin className="w-6 h-6" />
            <p className="text-sm tracking-widest opacity-80">LOCATION</p>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            찾아오시는 길
          </h1>
          <p className="text-base sm:text-lg opacity-90">
            초호 펜션으로 오시는 길
          </p>
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {/* 주소 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground">주소</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs text-primary font-medium">도로명</span>
                    <p>{SITE_CONFIG.address.road}</p>
                  </div>
                  <CopyButton text={SITE_CONFIG.address.road} label="도로명 주소" />
                </li>
                <li className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs text-primary font-medium">지번</span>
                    <p>{SITE_CONFIG.address.jibun}</p>
                  </div>
                  <CopyButton text={SITE_CONFIG.address.jibun} label="지번 주소" />
                </li>
              </ul>
            </div>

            {/* 전화번호 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground">전화번호</h3>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center justify-between">
                  <a
                    href={`tel:${SITE_CONFIG.mobilePhone}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {SITE_CONFIG.mobilePhone}
                  </a>
                  <CopyButton text={SITE_CONFIG.mobilePhone || ""} label="전화번호" />
                </li>
                <li className="flex items-center justify-between">
                  <a
                    href={`tel:${SITE_CONFIG.phone}`}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {SITE_CONFIG.phone}
                  </a>
                  <CopyButton text={SITE_CONFIG.phone} label="전화번호" />
                </li>
              </ul>
            </div>

            {/* 차량 이용 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-border">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Car className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground">차량 이용 시</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 56번 국지도 (파주로) 법원읍 출구 이용</li>
                <li>• 법원도서관 옆 초리골길 진입 후 차량으로 약 600m 거리</li>
              </ul>
            </div>
          </div>

          {/* Map Section */}
          <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
            <a
              href={SITE_CONFIG.social.naverMap}
              target="_blank"
              rel="noopener noreferrer"
              className="block relative group"
            >
              {/* Map Image Placeholder */}
              <div
                className="w-full h-[400px] bg-neutral-200"
                style={{
                  backgroundImage: "url('/images/location/map.webp')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-foreground">네이버 지도에서 보기</span>
                  </div>
                </div>
              </div>

              {/* Map Info Bar */}
              <div className="p-4 bg-primary text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span className="font-medium">초호펜션</span>
                </div>
                <div className="flex items-center gap-2 text-sm opacity-90">
                  <ExternalLink className="w-4 h-4" />
                  <span>네이버 지도에서 자세히 보기</span>
                </div>
              </div>
            </a>
          </div>

          {/* Additional Info */}
          <div className="mt-8 p-6 bg-muted/30 rounded-xl">
            <h3 className="font-bold text-foreground mb-4">참고 사항</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• 내비게이션에 <strong>&quot;초호펜션&quot;</strong> 또는 <strong>&quot;초리골164&quot;</strong>를 검색하세요.</li>
              <li>• 주차장은 펜션 내 무료로 이용 가능합니다.</li>
              <li>• 도착 후 본관(카페 초리골164)에서 체크인을 진행해주세요.</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
