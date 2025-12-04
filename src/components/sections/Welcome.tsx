"use client";

import { TreePine, Clock, Flower2, PawPrint, Leaf } from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "서울 1시간",
    description: "도심에서 가까운 힐링 공간",
    gradient: "from-blue-500/20 to-cyan-500/20",
    iconColor: "text-blue-600",
  },
  {
    icon: TreePine,
    title: "자연 속 휴식",
    description: "호수와 숲이 어우러진 풍경",
    gradient: "from-green-500/20 to-emerald-500/20",
    iconColor: "text-green-600",
  },
  {
    icon: Flower2,
    title: "사계절 매력",
    description: "계절마다 다른 아름다움",
    gradient: "from-pink-500/20 to-rose-500/20",
    iconColor: "text-pink-600",
  },
  {
    icon: PawPrint,
    title: "동물 친구들",
    description: "거위, 알파카, 토끼와 함께",
    gradient: "from-amber-500/20 to-orange-500/20",
    iconColor: "text-amber-600",
  },
];

export function Welcome() {
  return (
    <section className="relative py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-warm" />

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 opacity-20">
        <Leaf className="w-32 h-32 text-primary rotate-45" />
      </div>
      <div className="absolute bottom-20 right-10 opacity-20">
        <Leaf className="w-24 h-24 text-primary -rotate-12" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Title Section */}
        <div className="text-center mb-16 sm:mb-20">
          {/* Decorative Line */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="w-12 h-[2px] bg-gradient-to-r from-transparent to-primary/50" />
            <Leaf className="w-5 h-5 text-primary" />
            <span className="w-12 h-[2px] bg-gradient-to-l from-transparent to-primary/50" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-6">
            Welcome to{" "}
            <span className="gradient-text">초호펜션</span>
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            1947년부터 이어온 초호의 이야기가 담긴 곳,
            <br className="hidden sm:block" />
            바쁜 일상에서 벗어나 자연과 함께하는 특별한 시간을 선물합니다.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group card-premium p-6 sm:p-8 text-center"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Icon Container */}
              <div
                className={`relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon
                  className={`w-8 h-8 sm:w-10 sm:h-10 ${feature.iconColor} transition-transform group-hover:rotate-12`}
                />
                {/* Glow Effect */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300`}
                />
              </div>

              {/* Title */}
              <h3 className="font-bold text-neutral-900 mb-2 text-base sm:text-lg group-hover:text-primary transition-colors">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Decorative Quote */}
        <div className="mt-16 sm:mt-20 text-center">
          <p className="text-sm sm:text-base text-muted-foreground italic">
            &ldquo;자연이 주는 평온함 속에서 진정한 휴식을 경험하세요&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}
