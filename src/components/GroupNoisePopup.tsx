"use client";

import { useState, useEffect, useCallback } from "react";
import { UsersRound, X } from "lucide-react";

/** 단체 이용객 소음 안내. 기존 첫 번째 홈 팝업의 z-70/80 슬롯을 사용한다. */
export function GroupNoisePopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hideUntil = localStorage.getItem("groupNoisePopupHideUntil");
    if (hideUntil && new Date() < new Date(hideUntil)) return;
    const timer = setTimeout(() => setIsOpen(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => setIsOpen(false), []);

  const handleHideToday = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    localStorage.setItem("groupNoisePopupHideUntil", tomorrow.toISOString());
    setIsOpen(false);
  }, []);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="group-noise-title"
      aria-describedby="group-noise-description"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto p-3 md:p-4"
    >
      <button
        onClick={handleClose}
        className="fixed top-3 right-3 md:top-4 md:right-4 z-[80] w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-sm border border-stone-200"
        aria-label="닫기"
      >
        <X className="w-4 h-4 text-stone-700" />
      </button>

      <div className="w-full max-w-[460px] md:max-w-[min(720px,80vh)] mx-auto my-3 md:my-4">
        <div className="animate-fade-in-up">
          <div className="min-h-[360px] md:min-h-[480px] bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div
              style={{ background: "hsl(var(--primary))" }}
              className="px-5 py-4 md:py-6 text-center text-white font-semibold"
            >
              초호펜션 이용 안내
            </div>
            <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-8 md:px-12 md:gap-8 text-center">
              <UsersRound
                style={{ color: "hsl(var(--primary))" }}
                className="w-12 h-12 md:w-16 md:h-16 shrink-0"
                aria-hidden="true"
              />
              <h2
                id="group-noise-title"
                className="text-2xl md:text-4xl font-bold text-stone-800 break-keep"
              >
                단체 이용객 소음 안내
              </h2>
              <p
                id="group-noise-description"
                className="text-xl md:text-3xl leading-relaxed text-stone-700 break-keep"
              >
                단체 이용객이 있는 경우 일부 소음이 있을 수 있습니다.
              </p>
            </div>
          </div>

          <button
            onClick={handleHideToday}
            className="w-full mt-2 py-2 text-sm text-white/60 hover:text-white/90 transition-colors text-center"
          >
            오늘 하루 보지 않기
          </button>
        </div>
      </div>
    </div>
  );
}
