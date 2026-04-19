"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Phone, ArrowRight, Clock } from "lucide-react";

export function HolidayReservationPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hideUntil = localStorage.getItem("holidayReservationPopupHideUntil");
    if (hideUntil && new Date() < new Date(hideUntil)) return;
    const timer = setTimeout(() => setIsOpen(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => setIsOpen(false), []);

  const handleHideToday = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    localStorage.setItem("holidayReservationPopupHideUntil", tomorrow.toISOString());
    setIsOpen(false);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[52] flex items-center justify-center bg-black/75 backdrop-blur-md overflow-y-auto p-4">
      {/* Close */}
      <button
        onClick={handleClose}
        className="fixed top-3 right-3 z-[60] w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-sm border border-stone-200"
        aria-label="닫기"
      >
        <X className="w-4 h-4 text-stone-700" />
      </button>

      {/* Card */}
      <div
        className="bg-white max-w-[400px] w-full mx-auto overflow-hidden animate-fade-in-up shadow-2xl"
        style={{ fontFeatureSettings: '"lnum"' }}
      >
        {/* Top tag line */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-stone-200">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <p className="text-[10px] tracking-[0.3em] text-stone-500 uppercase font-medium">
              Notice · 2026
            </p>
          </div>
          <p className="text-[10px] tracking-[0.2em] text-stone-400 uppercase">No. 05</p>
        </div>

        {/* Large date display */}
        <div className="px-6 pt-8 pb-6 text-center">
          <p className="text-[11px] tracking-[0.3em] text-stone-400 uppercase mb-4">
            Golden Holiday Season
          </p>

          <div className="flex items-center justify-center gap-1 md:gap-2 mb-2">
            <p
              className="text-[56px] md:text-[64px] text-stone-900 font-bold leading-none"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              5
            </p>
            <p
              className="text-[20px] md:text-[24px] text-stone-900 font-light leading-none self-start mt-2"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              .
            </p>
            <p
              className="text-[56px] md:text-[64px] text-stone-900 font-bold leading-none"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              1
            </p>
            <p className="text-stone-300 text-2xl md:text-3xl font-extralight mx-1 md:mx-2">—</p>
            <p
              className="text-[56px] md:text-[64px] text-stone-900 font-bold leading-none"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              5
            </p>
            <p
              className="text-[20px] md:text-[24px] text-stone-900 font-light leading-none self-start mt-2"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              .
            </p>
            <p
              className="text-[56px] md:text-[64px] text-stone-900 font-bold leading-none"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              6
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 mt-3">
            <div className="h-px w-8 bg-stone-300" />
            <p className="text-[10px] tracking-[0.25em] text-stone-500 uppercase">Six Days</p>
            <div className="h-px w-8 bg-stone-300" />
          </div>
        </div>

        {/* Title */}
        <div className="px-6 pb-5 text-center">
          <h2 className="text-[19px] font-bold text-stone-900 leading-snug mb-2">
            연휴 기간 예약 안내
          </h2>
          <p className="text-[12px] text-stone-500 leading-relaxed">
            어린이날 · 부처님오신날 · 대체공휴일
            <br />
            <span className="text-stone-400">금요일부터 수요일까지 6일간</span>
          </p>
        </div>

        {/* Status strip */}
        <div className="mx-6 border-t border-b border-stone-200 py-4 flex items-center">
          <div className="flex-1 flex items-center gap-3">
            <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0" />
            <div>
              <p className="text-[10px] text-stone-400 uppercase tracking-wider">Status</p>
              <p className="text-[13px] text-stone-900 font-semibold">네이버 예약 오픈 전</p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
            <div>
              <p className="text-[10px] text-stone-400 uppercase tracking-wider">Method</p>
              <p className="text-[13px] text-stone-900 font-semibold">전화 개별 문의</p>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="px-6 py-5 text-center">
          <p className="text-[12.5px] text-stone-700 leading-relaxed">
            연휴 기간 예약 문의는
            <br />
            <strong className="text-stone-900">아래 번호로 개별 연락</strong> 부탁드립니다.
          </p>
        </div>

        {/* Phone CTA */}
        <a
          href="tel:010-7932-0029"
          className="block mx-6 mb-5 bg-stone-900 hover:bg-stone-800 transition-colors relative overflow-hidden group"
        >
          <div className="px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-white" strokeWidth={1.8} />
              <div>
                <p className="text-[9px] text-white/60 tracking-[0.3em] uppercase">Call Now</p>
                <p className="text-white text-[20px] md:text-[22px] font-semibold tracking-wide leading-none mt-1 tabular-nums">
                  010·7932·0029
                </p>
              </div>
            </div>
            <ArrowRight
              className="w-5 h-5 text-white/60 group-hover:translate-x-1 transition-transform"
              strokeWidth={2}
            />
          </div>
        </a>

        {/* Hours */}
        <div className="px-6 pb-5 flex items-center justify-center gap-2">
          <Clock className="w-3 h-3 text-stone-400" strokeWidth={2} />
          <p className="text-[10.5px] text-stone-500 tracking-wide">AM 09:00 — PM 21:00</p>
        </div>

        {/* Footer */}
        <div className="border-t border-stone-200 flex">
          <button
            onClick={handleHideToday}
            className="flex-1 py-3.5 text-[11px] text-stone-500 hover:bg-stone-50 transition-colors border-r border-stone-200"
          >
            오늘 하루 보지 않기
          </button>
          <button
            onClick={handleClose}
            className="flex-1 py-3.5 text-[11px] text-stone-900 font-semibold hover:bg-stone-50 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
