"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Snowflake, AlertTriangle, Phone, Coffee } from "lucide-react";

export function CombinedWinterPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hideUntil = localStorage.getItem("combinedWinterPopupHideUntil");
    if (hideUntil) {
      const hideDate = new Date(hideUntil);
      if (new Date() < hideDate) {
        return;
      }
    }
    const timer = setTimeout(() => setIsOpen(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleHideToday = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    localStorage.setItem("combinedWinterPopupHideUntil", tomorrow.toISOString());
    setIsOpen(false);
  };

  const handleCall = () => {
    window.location.href = "tel:010-7932-0029";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative flex flex-col md:flex-row gap-2 sm:gap-4 max-w-4xl w-full animate-in fade-in zoom-in duration-300 my-auto">
        {/* Close Button - 모바일에서 항상 보이도록 위치 조정 */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 md:-top-2 md:-right-2 z-30 w-9 h-9 sm:w-10 sm:h-10 bg-white hover:bg-neutral-100 rounded-full flex items-center justify-center transition-colors shadow-lg"
          aria-label="닫기"
        >
          <X className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-700" />
        </button>

        {/* Left: Ice Wall Popup */}
        <div className="relative bg-neutral-900 rounded-xl sm:rounded-2xl shadow-2xl flex-1 overflow-hidden">
          {/* Vertical Image - 모바일에서는 더 짧은 비율 */}
          <div className="relative aspect-[4/3] sm:aspect-[3/4]">
            <Image
              src="/images/journal/ice-wall/ice-wall-2.webp"
              alt="초호쉼터 빙벽"
              fill
              className="object-cover"
              priority
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

            {/* Badge */}
            <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-blue-500/90 text-white text-[10px] sm:text-xs font-semibold rounded-full backdrop-blur-sm">
              <Snowflake className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>겨울 시즌</span>
            </div>

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5">
              <h2 className="text-base sm:text-xl font-bold text-white mb-1">
                빙벽 시즌 오픈!
              </h2>
              <p className="text-xs sm:text-sm text-white/80 mb-2 sm:mb-4 leading-relaxed">
                한파와 함께 초호펜션 빙벽이 아름답게 얼어붙었습니다.
              </p>

              <Link
                href="/about/journal/ice-wall-2025"
                className="block w-full py-2 sm:py-3 bg-white text-neutral-900 font-medium rounded-lg sm:rounded-xl text-center hover:bg-white/90 transition-colors text-xs sm:text-sm"
                onClick={handleClose}
              >
                자세히 보기
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Winter Notice Popup */}
        <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl flex-1 overflow-hidden">
          {/* Background Image with dark overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "url('/images/rooms/forest/main.webp')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          {/* Content */}
          <div className="relative z-10 p-3 sm:p-5 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-sm sm:text-lg font-bold text-neutral-900">
                  겨울철 이용 안내
                </h2>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  이용에 참고 부탁드립니다
                </p>
              </div>
            </div>

            {/* Notice Items */}
            <div className="space-y-1.5 sm:space-y-3 flex-1">
              <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-2 sm:p-3">
                <div className="flex items-start gap-1.5 sm:gap-2">
                  <span className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold">
                    1
                  </span>
                  <div>
                    <h3 className="font-semibold text-blue-900 text-xs sm:text-sm mb-0.5">
                      동파 예방을 위한 물소리 발생
                    </h3>
                    <p className="text-[10px] sm:text-xs text-blue-700 leading-relaxed">
                      수도배관 동파 방지로 물소리가 들릴 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg sm:rounded-xl p-2 sm:p-3">
                <div className="flex items-start gap-1.5 sm:gap-2">
                  <span className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold">
                    2
                  </span>
                  <div>
                    <h3 className="font-semibold text-amber-900 text-xs sm:text-sm mb-0.5">
                      영하권 한파에 테라스 그릴 사용 불가
                    </h3>
                    <p className="text-[10px] sm:text-xs text-amber-700 leading-relaxed">
                      버너그릴은 한파에 착화가 안 됩니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg sm:rounded-xl p-2 sm:p-3">
                <div className="flex items-start gap-1.5 sm:gap-2">
                  <span className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold">
                    3
                  </span>
                  <div>
                    <h3 className="font-semibold text-purple-900 text-xs sm:text-sm mb-0.5">
                      조설기 작동소음 안내
                    </h3>
                    <p className="text-[10px] sm:text-xs text-purple-700 leading-relaxed">
                      겨울축제장 소음이 들릴 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-lg sm:rounded-xl p-2 sm:p-3">
                <div className="flex items-start gap-1.5 sm:gap-2">
                  <Coffee className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                  <div>
                    <h3 className="font-semibold text-emerald-900 text-xs sm:text-sm mb-0.5">
                      초리골164 음료 무료쿠폰 제공
                    </h3>
                    <p className="text-[10px] sm:text-xs text-emerald-700 leading-relaxed">
                      기준인원 + 추가인원에게 제공
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Button */}
            <div className="mt-2 sm:mt-4">
              <button
                onClick={handleCall}
                className="w-full py-2 sm:py-3 bg-primary text-white font-medium rounded-lg sm:rounded-xl text-center hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
              >
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                문의하기
              </button>
              <p className="text-center text-[10px] sm:text-xs text-muted-foreground mt-1">
                010-7932-0029
              </p>
            </div>
          </div>
        </div>

        {/* Hide Today Button - 모바일에서도 잘 보이도록 */}
        <button
          onClick={handleHideToday}
          className="w-full py-2 text-xs sm:text-sm text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-lg sm:rounded-full transition-colors text-center md:hidden"
        >
          오늘 하루 보지 않기
        </button>
      </div>

      {/* Hide Today Button - Desktop Only (기존 위치) */}
      <button
        onClick={handleHideToday}
        className="hidden md:block absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 text-sm text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-colors backdrop-blur-sm"
      >
        오늘 하루 보지 않기
      </button>
    </div>
  );
}
