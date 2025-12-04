"use client";

import Link from "next/link";
import { Phone, MapPin, Instagram, ChevronUp, Mail, Clock } from "lucide-react";
import { NAV_ITEMS, SITE_CONFIG } from "@/lib/constants";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-gradient-to-b from-[#0d3320] to-[#071a10] text-neutral-300 overflow-hidden">
      {/* Wave SVG Divider */}
      <div className="absolute top-0 left-0 right-0 -translate-y-[99%]">
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path
            d="M0 60L60 55C120 50 240 40 360 35C480 30 600 30 720 33.3C840 36.7 960 43.3 1080 45C1200 46.7 1320 43.3 1380 41.7L1440 40V60H1380C1320 60 1200 60 1080 60C960 60 840 60 720 60C600 60 480 60 360 60C240 60 120 60 60 60H0Z"
            fill="#0d3320"
          />
        </svg>
      </div>

      {/* Decorative Gradient */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
              <span className="text-3xl font-bold text-white group-hover:text-primary transition-colors">
                草湖
              </span>
              <span className="text-sm text-neutral-400 group-hover:text-neutral-300 transition-colors">
                {SITE_CONFIG.name}
              </span>
            </Link>
            <p className="text-sm text-neutral-400 leading-relaxed mb-6">
              서울에서 1시간, 자연 속 힐링 공간.
              <br />
              1947년부터 이어온 초호의 이야기가 담긴 곳입니다.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/choho_pension"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-gradient-to-br hover:from-purple-500 hover:via-pink-500 hover:to-orange-500 flex items-center justify-center transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-white/70 hover:text-white" />
              </a>
              <a
                href={`tel:${SITE_CONFIG.phone}`}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-emerald-500 flex items-center justify-center transition-all duration-300"
                aria-label="전화"
              >
                <Phone className="w-5 h-5 text-white/70 hover:text-white" />
              </a>
              <a
                href={SITE_CONFIG.social.naverMap}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-emerald-500 flex items-center justify-center transition-all duration-300"
                aria-label="위치"
              >
                <MapPin className="w-5 h-5 text-white/70 hover:text-white" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-5 uppercase tracking-wider">
              바로가기
            </h3>
            <ul className="space-y-3">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-neutral-400 hover:text-white hover:pl-2 transition-all duration-200"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-5 uppercase tracking-wider">
              연락처
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href={`tel:${SITE_CONFIG.phone}`}
                  className="flex items-center gap-3 text-sm text-white/70 hover:text-white transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-white/10 group-hover:bg-emerald-500/30 flex items-center justify-center transition-colors">
                    <Phone className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span>{SITE_CONFIG.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={SITE_CONFIG.social.naverMap}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-sm text-white/70 hover:text-white transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-white/10 group-hover:bg-emerald-500/30 flex items-center justify-center shrink-0 transition-colors">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="pt-2">{SITE_CONFIG.address.road}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-5 uppercase tracking-wider">
              운영 시간
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm text-white/70">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white font-medium">체크인</p>
                  <p>15:00 - 22:00</p>
                </div>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/70">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-white font-medium">체크아웃</p>
                  <p>11:00</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-white/50">
              © {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.
            </p>
            <p className="text-xs text-white/50">
              Made with{" "}
              <span className="text-red-400">♥</span>
              {" "}by{" "}
              <a
                href="https://polarad.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors"
              >
                Polarad
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 w-12 h-12 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:-translate-y-1 z-40"
        aria-label="맨 위로"
      >
        <ChevronUp className="w-6 h-6" />
      </button>
    </footer>
  );
}
