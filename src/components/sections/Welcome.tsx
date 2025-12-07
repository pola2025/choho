"use client";

import { useState, useEffect } from "react";
import { TreePine, Clock, Flower2, PawPrint, Leaf } from "lucide-react";

// YouTube 영상 ID
const YOUTUBE_VIDEO_ID = "j5gMc3QxURA";

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
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <section className="relative py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background - YouTube 영상 */}
      {!isMobile && (
        <div className="absolute inset-0 overflow-hidden">
          <iframe
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.78vh] h-[100vh] min-w-full min-h-[56.25vw] pointer-events-none"
            src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?autoplay=1&mute=1&controls=0&loop=1&playlist=${YOUTUBE_VIDEO_ID}&playsinline=1&rel=0&showinfo=0&modestbranding=1&iv_load_policy=3&disablekb=1`}
            title="Background Video"
            allow="autoplay; encrypted-media"
            allowFullScreen={false}
          />
        </div>
      )}

      {/* 어두운 오버레이 */}
      <div className="absolute inset-0 bg-black/30" />

      {/* 모바일: 기존 그라디언트 배경 */}
      {isMobile && <div className="absolute inset-0 bg-gradient-warm -z-10" />}

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 opacity-10">
        <Leaf className="w-32 h-32 text-white rotate-45" />
      </div>
      <div className="absolute bottom-20 right-10 opacity-10">
        <Leaf className="w-24 h-24 text-white -rotate-12" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Title Section */}
        <div className="text-center mb-16 sm:mb-20">
          {/* Decorative Line */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="w-12 h-[2px] bg-gradient-to-r from-transparent to-white/50" />
            <Leaf className="w-5 h-5 text-white" />
            <span className="w-12 h-[2px] bg-gradient-to-l from-transparent to-white/50" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 drop-shadow-lg">
            Welcome to{" "}
            <span className="text-green-300">초호펜션</span>
          </h2>

          <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            1947년부터 이어온 초호의 이야기가 담긴 곳,
            <br className="hidden sm:block" />
            바쁜 일상에서 벗어나 자연과 함께하는 특별한 시간을 선물합니다.
          </p>
        </div>

        {/* Features Grid - 원래 카드 디자인 복원 */}
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
          <p className="text-sm sm:text-base text-white/80 italic drop-shadow-md">
            &ldquo;자연이 주는 평온함 속에서 진정한 휴식을 경험하세요&rdquo;
          </p>
        </div>
      </div>
    </section>
  );
}
