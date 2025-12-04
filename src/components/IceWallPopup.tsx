"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Snowflake } from "lucide-react";

export function IceWallPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hideUntil = localStorage.getItem("iceWallPopupHideUntil");
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
    localStorage.setItem("iceWallPopupHideUntil", tomorrow.toISOString());
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative bg-neutral-900 rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Vertical Image - 3:4 ratio */}
        <div className="relative aspect-[3/4]">
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

            {/* Buttons */}
            <div className="flex flex-col gap-2">
              <Link
                href="/about/journal/ice-wall-2024"
                className="w-full py-3 bg-white text-neutral-900 font-medium rounded-xl text-center hover:bg-white/90 transition-colors text-sm"
                onClick={handleClose}
              >
                자세히 보기
              </Link>
              <button
                onClick={handleHideToday}
                className="w-full py-2.5 text-xs text-white/60 hover:text-white/80 transition-colors"
              >
                오늘 하루 보지 않기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
