"use client";

import Image from "next/image";
import { Clock } from "lucide-react";

const steps = [
  {
    step: 1,
    title: "주차",
    description: "펜션 주차장에 주차해주세요",
    image: "/images/checkin/1.webp",
  },
  {
    step: 2,
    title: "본관 방문",
    description: "본관으로 이동해주세요",
    image: "/images/checkin/2.webp",
  },
  {
    step: 3,
    title: "카페 체크인",
    description: "초리골164 카페에서 체크인",
    image: "/images/checkin/3.webp",
  },
  {
    step: 4,
    title: "입실",
    description: "객실 키를 받고 입실해주세요",
    image: "/images/checkin/4.webp",
  },
];

export function CheckinGuide() {
  return (
    <section className="relative py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-soft border border-border text-sm font-medium mb-6">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">Check-in Guide</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
            체크인 안내
          </h2>

          {/* Time Info */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-sm sm:text-base">
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
              <span className="font-medium text-primary">체크인</span>
              <span className="text-muted-foreground">15:00 - 22:00</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full">
              <span className="font-medium text-amber-600">체크아웃</span>
              <span className="text-muted-foreground">11:00</span>
            </div>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item) => (
            <div key={item.step} className="group">
              <div className="card-premium overflow-hidden h-full">
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {/* Step Badge */}
                  <div className="absolute top-3 left-3 w-8 h-8 bg-white/95 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {item.step}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5">
                  <h3 className="font-bold text-neutral-900 mb-1 text-lg group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-12 sm:mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            문의사항이 있으시면{" "}
            <a
              href="tel:031-584-8377"
              className="font-medium text-primary hover:underline"
            >
              031-584-8377
            </a>
            로 연락주세요
          </p>
        </div>
      </div>
    </section>
  );
}
