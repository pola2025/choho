"use client";

import { useState, useCallback } from "react";
import { Flame, Sparkles, X, ChevronLeft, ChevronRight, AlertCircle, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { SITE_CONFIG } from "@/lib/constants";
import Image from "next/image";

// 바베큐 시설 데이터
const bbqFacilities = [
  {
    id: "burner",
    title: "가스버너 & 캠핑그릴",
    location: "Forest 객실 테라스",
    description: "Forest 객실 테라스에서 간편하게 사용 가능한 가스버너와 캠핑그릴을 제공합니다.",
    notice: "영하권 날씨에는 착화불가로 관리자 개별연락 필요",
    images: [
      "/images/bbq/burner/burner-1.webp",
      "/images/bbq/burner/burner-2.webp",
    ],
    bgColor: "bg-orange-500/10",
    iconColor: "text-orange-600",
  },
  {
    id: "forest",
    title: "숯불바베큐",
    location: "Forest Room 지정공간",
    description: "지정된 바베큐 공간에서 본격적인 숯불바베큐를 즐길 수 있습니다. 총 5동의 바베큐장이 마련되어 있습니다.",
    notice: "객실 9개 중 숯불바베큐 5동 - 조기 예약 마감 가능",
    images: [
      "/images/bbq/forest/forest-1.webp",
      "/images/bbq/forest/forest-2.webp",
      "/images/bbq/forest/forest-3.webp",
    ],
    bgColor: "bg-red-500/10",
    iconColor: "text-red-600",
  },
  {
    id: "lakeview",
    title: "호수뷰 테라스 바베큐",
    location: "호수뷰 객실 전용",
    description: "연못에 위치한 호수뷰 객실 앞 테라스에서 숯불바베큐를 즐길 수 있습니다. 아름다운 연못 전망과 함께하는 특별한 바베큐 경험.",
    notice: "가스버너 & 캠핑그릴 사용 희망시 관리자 개별연락",
    images: [
      "/images/bbq/lakeview/lakeview-1.webp",
      "/images/bbq/lakeview/lakeview-2.webp",
      "/images/bbq/lakeview/lakeview-3.webp",
    ],
    bgColor: "bg-blue-500/10",
    iconColor: "text-blue-600",
  },
];

export function Facilities() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const currentFacility = bbqFacilities[selectedTab];

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  const nextImage = useCallback(() => {
    setLightboxIndex((prev) => (prev + 1) % currentFacility.images.length);
  }, [currentFacility.images.length]);

  const prevImage = useCallback(() => {
    setLightboxIndex((prev) => (prev - 1 + currentFacility.images.length) % currentFacility.images.length);
  }, [currentFacility.images.length]);

  // 키보드 이벤트
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") nextImage();
    if (e.key === "ArrowLeft") prevImage();
  }, [closeLightbox, nextImage, prevImage]);

  return (
    <section className="relative py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-warm" />

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-soft border border-border text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">BBQ Facilities</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
            바베큐 시설 안내
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            객실 유형에 따른 다양한 바베큐 시설을 제공합니다
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8">
          {bbqFacilities.map((facility, index) => (
            <button
              key={facility.id}
              onClick={() => setSelectedTab(index)}
              className={cn(
                "px-4 sm:px-6 py-3 rounded-xl text-sm sm:text-base font-medium transition-all duration-300",
                selectedTab === index
                  ? "bg-neutral-900 text-white shadow-lg"
                  : "bg-white text-neutral-600 hover:bg-neutral-100 border border-border"
              )}
            >
              {facility.title}
            </button>
          ))}
        </div>

        {/* Content Card */}
        <div className="card-premium overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Images Grid */}
            <div className="p-4 sm:p-6 bg-neutral-50">
              <div className="grid grid-cols-2 gap-3">
                {currentFacility.images.map((image, index) => (
                  <button
                    key={image}
                    onClick={() => openLightbox(index)}
                    className={cn(
                      "relative overflow-hidden rounded-xl group cursor-zoom-in",
                      index === 0 && currentFacility.images.length > 2 ? "col-span-2 aspect-video" : "aspect-square"
                    )}
                  >
                    <Image
                      src={image}
                      alt={`${currentFacility.title} ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        클릭하여 확대
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
              {/* Icon Badge */}
              <div
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-6",
                  currentFacility.bgColor
                )}
              >
                <Flame className={cn("w-7 h-7", currentFacility.iconColor)} />
              </div>

              {/* Title & Location */}
              <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-2">
                {currentFacility.title}
              </h3>
              <p className="text-primary font-medium mb-4">
                {currentFacility.location}
              </p>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed mb-6">
                {currentFacility.description}
              </p>

              {/* Notice */}
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200 mb-6">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
                  {currentFacility.notice}
                </p>
              </div>

              {/* Contact */}
              <a
                href={`tel:${SITE_CONFIG.mobilePhone}`}
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>문의: {SITE_CONFIG.mobilePhone}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 border border-border text-center">
            <div className="text-2xl font-bold text-primary mb-1">5동</div>
            <div className="text-sm text-muted-foreground">숯불바베큐장</div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-border text-center">
            <div className="text-2xl font-bold text-primary mb-1">9객실</div>
            <div className="text-sm text-muted-foreground">전체 객실 수</div>
          </div>
          <div className="bg-white rounded-xl p-5 border border-border text-center">
            <div className="text-2xl font-bold text-primary mb-1">3만원</div>
            <div className="text-sm text-muted-foreground">바베큐 시설 이용</div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
          role="dialog"
          aria-modal="true"
          aria-label="이미지 확대 보기"
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 p-2 text-white/70 hover:text-white transition-colors"
            aria-label="닫기"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Navigation - Previous */}
          {currentFacility.images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 z-10 p-2 text-white/70 hover:text-white transition-colors"
              aria-label="이전 이미지"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative w-full max-w-5xl max-h-[85vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={currentFacility.images[lightboxIndex]}
              alt={`${currentFacility.title} ${lightboxIndex + 1}`}
              width={1920}
              height={1280}
              className="object-contain w-full h-full max-h-[85vh]"
              priority
            />

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
              {lightboxIndex + 1} / {currentFacility.images.length}
            </div>
          </div>

          {/* Navigation - Next */}
          {currentFacility.images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 z-10 p-2 text-white/70 hover:text-white transition-colors"
              aria-label="다음 이미지"
            >
              <ChevronRight className="w-10 h-10" />
            </button>
          )}
        </div>
      )}
    </section>
  );
}
