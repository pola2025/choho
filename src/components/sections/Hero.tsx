"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/lib/constants";
import { ChevronDown, Calendar, Home } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
        style={{
          backgroundImage: "url('https://cdn.imweb.me/thumbnail/20231227/534aa65eac23d.jpg')",
        }}
      />

      {/* Gradient Overlay - 다층 그라디언트 */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
      <div className="absolute bottom-1/3 right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl animate-pulse-soft delay-500" />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 sm:px-6 max-w-4xl mx-auto">
        {/* SINCE Badge */}
        <div className="animate-fade-in-up opacity-0" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
          <div className="inline-flex items-center gap-3 mb-6">
            <span className="w-8 h-[1px] bg-white/50" />
            <span className="text-xs sm:text-sm tracking-[0.3em] text-white/80 font-light uppercase">
              Since 1947
            </span>
            <span className="w-8 h-[1px] bg-white/50" />
          </div>
        </div>

        {/* Main Title - 草湖 */}
        <div className="animate-fade-in-up opacity-0" style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}>
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold mb-2 text-shadow-lg">
            <span className="gradient-text-gold">草湖</span>
          </h1>
        </div>

        {/* Subtitle */}
        <div className="animate-fade-in-up opacity-0" style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}>
          <p className="text-xl sm:text-2xl md:text-3xl mb-3 font-light tracking-wide text-shadow">
            {SITE_CONFIG.name}
          </p>
        </div>

        {/* Tagline */}
        <div className="animate-fade-in-up opacity-0" style={{ animationDelay: "0.7s", animationFillMode: "forwards" }}>
          <p className="text-sm sm:text-base md:text-lg mb-10 sm:mb-12 text-white/70 max-w-md mx-auto font-light">
            서울에서 1시간, 자연 속 프리미엄 힐링 공간
          </p>
        </div>

        {/* CTA Buttons */}
        <div
          className="animate-fade-in-up opacity-0 flex flex-col sm:flex-row gap-4 justify-center"
          style={{ animationDelay: "0.9s", animationFillMode: "forwards" }}
        >
          <Button
            asChild
            size="lg"
            className="group bg-white text-neutral-900 hover:bg-white/90 text-base px-8 py-6 rounded-full shadow-elevated hover:shadow-glow-gold transition-all duration-300"
          >
            <a
              href={SITE_CONFIG.social.naver}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>실시간 예약 확인</span>
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="group border-white/50 text-white hover:bg-white/10 hover:border-white text-base px-8 py-6 rounded-full backdrop-blur-sm transition-all duration-300"
          >
            <Link href="/rooms" className="flex items-center gap-2">
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>객실 둘러보기</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in opacity-0" style={{ animationDelay: "1.2s", animationFillMode: "forwards" }}>
        <span className="text-xs text-white/50 tracking-widest uppercase">Scroll</span>
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2 hover:border-white/50 transition-colors">
          <ChevronDown className="w-4 h-4 text-white/60 animate-bounce" />
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
