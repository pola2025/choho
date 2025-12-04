"use client";

import { useState } from "react";
import { UtensilsCrossed, Flame, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const facilities = [
  {
    id: "breakfast",
    label: "조식",
    icon: UtensilsCrossed,
    title: "단체 조식 서비스",
    description:
      "10인 이상 단체 예약 시 정성스러운 아침 식사를 제공해드립니다. 신선한 재료로 준비한 한식 조식으로 하루를 시작하세요.",
    features: ["10인 이상 단체", "사전 예약 필수", "한식 조식"],
    image: "https://cdn.imweb.me/thumbnail/20231227/d73522fdf8e44.jpg",
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-500/10",
  },
  {
    id: "bbq",
    label: "바베큐",
    icon: Flame,
    title: "바베큐 시설",
    description:
      "자연 속에서 즐기는 바베큐 파티! 넓은 야외 공간에서 가족, 친구들과 함께 특별한 추억을 만들어보세요.",
    features: ["그릴 대여", "테이블 & 의자", "동절기 실내 가능"],
    image: "https://cdn.imweb.me/upload/S202110067f162833b69cd/58bb12f425faa.jpg",
    color: "from-red-500 to-rose-500",
    bgColor: "bg-red-500/10",
  },
];

export function Facilities() {
  const [activeTab, setActiveTab] = useState("breakfast");

  const activeFacility = facilities.find((f) => f.id === activeTab)!;

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
            초호펜션에서 즐길 수 있는 다양한 시설
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-10 sm:mb-12">
          <div className="inline-flex p-1.5 bg-white rounded-2xl shadow-soft border border-border">
            {facilities.map((facility) => {
              const Icon = facility.icon;
              const isActive = activeTab === facility.id;
              return (
                <button
                  key={facility.id}
                  onClick={() => setActiveTab(facility.id)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-xl transition-all duration-300",
                    isActive
                      ? `bg-gradient-to-r ${facility.color} text-white shadow-md`
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{facility.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="card-premium overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Image */}
            <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden group">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `url('${activeFacility.image}')`,
                }}
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Content */}
            <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
              {/* Icon Badge */}
              <div
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center mb-6",
                  activeFacility.bgColor
                )}
              >
                <activeFacility.icon
                  className={cn(
                    "w-7 h-7",
                    activeFacility.id === "breakfast" && "text-amber-600",
                    activeFacility.id === "bbq" && "text-red-600"
                  )}
                />
              </div>

              {/* Title */}
              <h3 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-4">
                {activeFacility.title}
              </h3>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed mb-8">
                {activeFacility.description}
              </p>

              {/* Features */}
              <div className="space-y-3">
                {activeFacility.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center",
                        activeFacility.bgColor
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
