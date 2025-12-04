"use client";

import { useState } from "react";
import { X, ChevronLeft, ChevronRight, Images, ZoomIn } from "lucide-react";

const galleryImages = [
  { src: "https://cdn.imweb.me/thumbnail/20231227/b3d0b94aaf2aa.jpg", alt: "초호펜션 전경", category: "exterior" },
  { src: "https://cdn.imweb.me/thumbnail/20231227/c261f180ed066.jpg", alt: "호수 풍경", category: "nature" },
  { src: "https://cdn.imweb.me/thumbnail/20231227/b9733eaa5602c.jpg", alt: "객실 내부", category: "room" },
  { src: "https://cdn.imweb.me/thumbnail/20231227/967a2c566530a.jpg", alt: "카페 외관", category: "cafe" },
  { src: "https://cdn.imweb.me/upload/S202110067f162833b69cd/58bb12f425faa.jpg", alt: "바베큐장", category: "facility" },
  { src: "https://cdn.imweb.me/thumbnail/20231227/bf5138ddec73a.jpg", alt: "정원", category: "nature" },
  { src: "https://cdn.imweb.me/thumbnail/20231227/e78fdb82a45e7.jpg", alt: "동물 친구들", category: "nature" },
  { src: "https://cdn.imweb.me/thumbnail/20231227/659a296632931.jpg", alt: "야경", category: "exterior" },
];

export function Gallery() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = "unset";
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="relative py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-warm" />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-soft border border-border text-sm font-medium mb-6">
            <Images className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Gallery</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
            갤러리
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            초호펜션의 아름다운 순간들
          </p>
        </div>

        {/* Masonry-style Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {galleryImages.map((image, index) => {
            // 첫 번째와 다섯 번째 이미지는 2행 차지
            const isLarge = index === 0 || index === 4;

            return (
              <button
                key={index}
                onClick={() => openLightbox(index)}
                className={`group relative overflow-hidden rounded-2xl cursor-pointer ${
                  isLarge ? "row-span-2" : ""
                }`}
                style={{
                  aspectRatio: isLarge ? "3/4" : "1/1",
                }}
              >
                {/* Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                  style={{
                    backgroundImage: `url('${image.src}')`,
                    backgroundColor: "#e5e7eb",
                  }}
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                      <ZoomIn className="w-5 h-5 text-neutral-700" />
                    </div>
                  </div>
                </div>

                {/* Caption on Hover */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-sm font-medium">{image.alt}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/95 backdrop-blur-sm" />

          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="닫기"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Navigation Buttons */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
            className="absolute left-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="이전"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-4 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="다음"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          {/* Image Container */}
          <div
            className="relative max-w-5xl max-h-[85vh] mx-4 sm:mx-16"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={galleryImages[currentIndex].src}
              alt={galleryImages[currentIndex].alt}
              className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
            />

            {/* Caption */}
            <div className="absolute -bottom-12 left-0 right-0 text-center">
              <p className="text-white/80 text-sm font-medium">
                {galleryImages[currentIndex].alt}
              </p>
            </div>
          </div>

          {/* Counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 rounded-full">
            <span className="text-white/80 text-sm font-medium">
              {currentIndex + 1} / {galleryImages.length}
            </span>
          </div>

          {/* Thumbnail Navigation */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2">
            {galleryImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-white w-6"
                    : "bg-white/40 hover:bg-white/60"
                }`}
                aria-label={`이미지 ${index + 1}`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
