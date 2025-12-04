"use client";

import { useState, useEffect } from "react";
import { Flame, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const bbqImages = [
  "/images/bbq/bbq-1.webp",
  "/images/bbq/bbq-2.webp",
  "/images/bbq/bbq-3.webp",
  "/images/bbq/bbq-4.webp",
];

const facility = {
  id: "bbq",
  title: "바베큐 시설",
  description:
    "자연 속에서 즐기는 바베큐 파티! 넓은 야외 공간에서 가족, 친구들과 함께 특별한 추억을 만들어보세요.",
  features: ["그릴 대여", "테이블 & 의자"],
  bgColor: "bg-red-500/10",
};

export function Facilities() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bbqImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

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
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-soft border border-border text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Facilities</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
            부대시설 안내
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            초호펜션에서 즐길 수 있는 특별한 시설
          </p>
        </div>

        {/* Content */}
        <div className="card-premium overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Image with Rolling */}
            <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden group">
              {bbqImages.map((image, index) => (
                <div
                  key={image}
                  className={cn(
                    "absolute inset-0 bg-cover bg-center transition-opacity duration-1000",
                    index === currentIndex ? "opacity-100" : "opacity-0"
                  )}
                  style={{ backgroundImage: `url('${image}')` }}
                />
              ))}
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Image Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {bbqImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      index === currentIndex
                        ? "bg-white w-6"
                        : "bg-white/50 hover:bg-white/70"
                    )}
                    aria-label={`이미지 ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
              {/* Icon Badge */}
              <div
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-6",
                  facility.bgColor
                )}
              >
                <Flame className="w-7 h-7 text-red-600" />
              </div>

              {/* Title */}
              <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4">
                {facility.title}
              </h3>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed mb-8">
                {facility.description}
              </p>

              {/* Features */}
              <div className="space-y-3">
                {facility.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center",
                        facility.bgColor
                      )}
                    >
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium text-neutral-700">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
