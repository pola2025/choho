"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Snowflake, AlertTriangle, Phone } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative flex flex-col md:flex-row gap-4 max-w-4xl w-full animate-in fade-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 z-30 w-10 h-10 bg-white hover:bg-neutral-100 rounded-full flex items-center justify-center transition-colors shadow-lg"
          aria-label="닫기"
        >
          <X className="w-5 h-5 text-neutral-700" />
        </button>

        {/* Left: Ice Wall Popup */}
        <div className="relative bg-neutral-900 rounded-2xl shadow-2xl flex-1 overflow-hidden">
          {/* Vertical Image - 3:4 ratio */}
          <div className="relative aspect-[3/4] md:aspect-[3/4]">
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
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/90 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
              <Snowflake className="w-3.5 h-3.5" />
              <span>겨울 시즌</span>
            </div>

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h2 className="text-xl font-bold text-white mb-1.5">
                빙벽 시즌 오픈!
              </h2>
              <p className="text-sm text-white/80 mb-4 leading-relaxed">
                한파와 함께 초호펜션 빙벽이<br />
                아름답게 얼어붙었습니다.
              </p>

              <Link
                href="/about/journal/ice-wall-2025"
                className="block w-full py-3 bg-white text-neutral-900 font-medium rounded-xl text-center hover:bg-white/90 transition-colors text-sm"
                onClick={handleClose}
              >
                자세히 보기
              </Link>
            </div>
          </div>
        </div>

        {/* Right: Winter Notice Popup */}
        <div className="relative bg-white rounded-2xl shadow-2xl flex-1 overflow-hidden">
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
          <div className="relative z-10 p-5 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-900">
                  겨울철 이용 안내
                </h2>
                <p className="text-xs text-muted-foreground">
                  이용에 참고 부탁드립니다
                </p>
              </div>
            </div>

            {/* Notice Items */}
            <div className="space-y-3 flex-1">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <div>
                    <h3 className="font-semibold text-blue-900 text-sm mb-0.5">
                      동파 예방을 위한 물소리 발생
                    </h3>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      겨울철 수도배관 동파 방지를 위해 물소리가 객실에서 들릴 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <div>
                    <h3 className="font-semibold text-amber-900 text-sm mb-0.5">
                      영하권 한파에 테라스 그릴사용 불가
                    </h3>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      버너그릴은 한파에 착화가 안 됩니다.
                      <br />
                      한파에는 별도 안내드립니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <div>
                    <h3 className="font-semibold text-purple-900 text-sm mb-0.5">
                      조설기(눈만드는기계) 작동소음 안내
                    </h3>
                    <p className="text-xs text-purple-700 leading-relaxed">
                      초리골 겨울축제장에서 소음이 골짜기를 따라 들려올 수 있습니다.
                      <br />
                      <span className="text-purple-500">* 펜션시설 내 아닌 마을 내 소음</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Button */}
            <div className="mt-4">
              <button
                onClick={handleCall}
                className="w-full py-3 bg-primary text-white font-medium rounded-xl text-center hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Phone className="w-4 h-4" />
                객실관리자 문의하기
              </button>
              <p className="text-center text-xs text-muted-foreground mt-1.5">
                010-7932-0029
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hide Today Button - Bottom */}
      <button
        onClick={handleHideToday}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 text-sm text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-colors backdrop-blur-sm"
      >
        오늘 하루 보지 않기
      </button>
    </div>
  );
}
