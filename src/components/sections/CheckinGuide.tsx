"use client";

import { Car, Building2, Coffee, KeyRound, Clock, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Car,
    step: 1,
    title: "주차",
    description: "펜션 주차장에 주차해주세요",
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Building2,
    step: 2,
    title: "본관 방문",
    description: "본관으로 이동해주세요",
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-500/10",
  },
  {
    icon: Coffee,
    step: 3,
    title: "카페 체크인",
    description: "초리골164 카페에서 체크인",
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: KeyRound,
    step: 4,
    title: "입실",
    description: "객실 키를 받고 입실해주세요",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-500/10",
  },
];

export function CheckinGuide() {
  return (
    <section className="relative py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />

      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-accent/5 rounded-full blur-3xl" />

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

        {/* Steps - Desktop Timeline */}
        <div className="hidden lg:block relative">
          {/* Connection Line */}
          <div className="absolute top-16 left-[12.5%] right-[12.5%] h-1 bg-gradient-to-r from-blue-200 via-green-200 via-amber-200 to-purple-200 rounded-full" />

          <div className="grid grid-cols-4 gap-6">
            {steps.map((item, index) => (
              <div key={item.step} className="relative">
                {/* Step Card */}
                <div className="group card-premium p-6 text-center h-full">
                  {/* Icon Circle */}
                  <div
                    className={`relative w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <item.icon className="w-8 h-8 text-white" />
                    {/* Step Number */}
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center">
                      <span className="text-xs font-bold text-neutral-900">
                        {item.step}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="font-bold text-neutral-900 mb-2 text-lg group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>

                {/* Arrow (except last) */}
                {index < steps.length - 1 && (
                  <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 z-10 hidden xl:block">
                    <ArrowRight className="w-6 h-6 text-neutral-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Steps - Mobile/Tablet */}
        <div className="lg:hidden grid grid-cols-2 gap-4 sm:gap-6">
          {steps.map((item) => (
            <div key={item.step} className="group card-premium p-5 sm:p-6 text-center">
              {/* Icon */}
              <div
                className={`relative w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}
              >
                <item.icon className="w-7 h-7 text-white" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center">
                  <span className="text-xs font-bold text-neutral-900">
                    {item.step}
                  </span>
                </div>
              </div>

              {/* Content */}
              <h3 className="font-bold text-neutral-900 mb-1 text-base">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {item.description}
              </p>
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
