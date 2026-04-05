"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";

export function CherryBlossomStatusPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hideUntil = localStorage.getItem("cherryStatusPopupHideUntil");
    if (hideUntil && new Date() < new Date(hideUntil)) return;
    const timer = setTimeout(() => setIsOpen(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => setIsOpen(false), []);

  const handleHideToday = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    localStorage.setItem("cherryStatusPopupHideUntil", tomorrow.toISOString());
    setIsOpen(false);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[52] flex items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto p-4">
      {/* Close */}
      <button
        onClick={handleClose}
        className="fixed top-3 right-3 z-[60] w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-sm border border-stone-200"
        aria-label="닫기"
      >
        <X className="w-4 h-4 text-stone-700" />
      </button>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl w-full mx-auto animate-fade-in-up">
        <div className="h-1.5 bg-gradient-to-r from-pink-300 via-pink-200 to-pink-300" />

        <div className="p-5 md:p-7">
          {/* Header */}
          <div className="text-center mb-5">
            <p className="text-pink-400 text-xs tracking-[0.2em] uppercase mb-1">Chohopark</p>
            <h2 className="font-serif text-stone-800 text-xl md:text-2xl font-semibold mb-1">
              벚꽃 개화 현황
            </h2>
            <p className="text-stone-400 text-xs">2026.04.05(일) 기준</p>
          </div>

          {/* Photos */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="relative rounded-xl overflow-hidden">
              <img
                src="/images/spring/cherry-status-20260405.jpg"
                alt="현재 개화 상황"
                className="w-full aspect-[3/4] object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="text-white text-sm md:text-base font-semibold">현재 개화 상황</p>
                <p className="text-white/80 text-xs">2026.04.05 촬영</p>
              </div>
            </div>
            <div className="relative rounded-xl overflow-hidden">
              <img
                src="/images/spring/webp/dsc02014.webp"
                alt="만개 시 모습"
                className="w-full aspect-[3/4] object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <p className="text-white text-sm md:text-base font-semibold">만개 시 모습</p>
                <p className="text-white/80 text-xs">참고 사진</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="bg-pink-50 rounded-xl p-4 mb-4 border border-pink-100">
            <div className="space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-pink-400 flex-shrink-0" />
                <div>
                  <p className="text-stone-700 text-base font-semibold">능수벚꽃</p>
                  <p className="text-stone-500 text-sm">1/3 개화</p>
                </div>
                <div className="flex-1 ml-2">
                  <div className="h-2 bg-pink-100 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-400 rounded-full" style={{ width: "33%" }} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-stone-300 flex-shrink-0" />
                <div>
                  <p className="text-stone-700 text-base font-semibold">객실앞 벚꽃</p>
                  <p className="text-stone-500 text-sm">아직 미개화</p>
                </div>
                <div className="flex-1 ml-2">
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-stone-300 rounded-full" style={{ width: "5%" }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Forecast */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
            <p className="text-stone-700 text-base leading-relaxed text-center">
              <span className="font-semibold">다음주 벚꽃은 계속 볼 수 있을 전망입니다.</span>
            </p>
            <p className="text-stone-400 text-xs text-center mt-2">
              *기상상황에 따라 낙화시기는 달라질 수 있습니다.
            </p>
          </div>

          {/* Hide today */}
          <div className="mt-5 text-center">
            <button
              onClick={handleHideToday}
              className="px-6 py-2 text-sm text-stone-400 hover:text-stone-600 transition-colors"
            >
              오늘 하루 보지 않기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
