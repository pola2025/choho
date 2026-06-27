"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";

export function SummerInsectIndividualPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hideUntil = localStorage.getItem("summerInsectNoticeHideUntil");
    if (hideUntil && new Date() < new Date(hideUntil)) return;
    const timer = setTimeout(() => setIsOpen(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => setIsOpen(false), []);

  const handleHideToday = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    localStorage.setItem("summerInsectNoticeHideUntil", tomorrow.toISOString());
    setIsOpen(false);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[53] flex items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto p-4">
      {/* Close */}
      <button
        onClick={handleClose}
        className="fixed top-3 right-3 z-[61] w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-sm border border-stone-200"
        aria-label="닫기"
      >
        <X className="w-4 h-4 text-stone-700" />
      </button>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-[360px] w-full mx-auto animate-fade-in-up">
        {/* 숲 일러스트 헤더 */}
        <div className="relative bg-gradient-to-b from-emerald-50 to-green-50 pt-8 pb-6 overflow-hidden">
          <svg viewBox="0 0 280 120" className="w-full h-auto px-6" aria-hidden="true">
            {/* 언덕 */}
            <ellipse cx="140" cy="118" rx="150" ry="20" fill="#d7ebd9" />
            {/* 나무 왼쪽 */}
            <rect x="62" y="74" width="6" height="28" rx="2" fill="#a98467" />
            <path d="M65 26 L88 70 L42 70 Z" fill="#6aa56e" />
            <path d="M65 40 L84 76 L46 76 Z" fill="#7bb87f" />
            {/* 나무 오른쪽 */}
            <rect x="210" y="80" width="5" height="24" rx="2" fill="#a98467" />
            <path d="M212 38 L230 76 L194 76 Z" fill="#74b178" />
            <path d="M212 50 L227 80 L197 80 Z" fill="#86c389" />
            {/* 가운데 큰 잎 */}
            <g transform="translate(140 60)">
              <ellipse cx="0" cy="0" rx="34" ry="20" fill="#8fcf93" />
              <path d="M-34 0 Q0 -4 34 0" stroke="#5d9e62" strokeWidth="1.5" fill="none" />
              <path d="M0 -18 Q4 0 0 18" stroke="#5d9e62" strokeWidth="1.2" fill="none" />
            </g>
            {/* 날벌레 */}
            <g stroke="#9aa0a6" strokeWidth="1" fill="none">
              <g>
                <circle cx="100" cy="34" r="2.4" fill="#6b7280" />
                <path d="M97 32 q-4 -3 -7 0 M103 32 q4 -3 7 0" />
              </g>
              <g>
                <circle cx="186" cy="46" r="2" fill="#6b7280" />
                <path d="M183 44 q-3 -2 -6 0 M189 44 q3 -2 6 0" />
              </g>
              <g>
                <circle cx="150" cy="24" r="1.8" fill="#6b7280" />
                <path d="M147 22 q-3 -2 -5 0 M153 22 q3 -2 5 0" />
              </g>
            </g>
          </svg>
        </div>

        {/* 본문 */}
        <div className="px-7 pt-5 pb-6 text-center">
          <span className="inline-block text-[11px] font-semibold tracking-wider text-emerald-700 bg-emerald-50 rounded-full px-3 py-1 mb-3">
            SUMMER NOTICE · 여름철 안내
          </span>
          <h2 className="font-serif text-[19px] font-bold text-stone-900 leading-snug mb-3">
            객실 주변으로
            <br />
            여름철 날벌레가 많습니다
          </h2>
          <p className="text-[13.5px] text-stone-500 leading-relaxed">
            초호는 자연 속 <strong className="text-stone-700">산기슭 숲</strong>에 위치해 있어,
            <br />
            여름철에는 날벌레가 많은 편입니다.
            <br />
            이용에 참고 부탁드립니다.
          </p>

          <button
            onClick={handleClose}
            className="w-full mt-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            확인했습니다
          </button>
          <button
            onClick={handleHideToday}
            className="w-full mt-2 py-2 text-xs text-stone-400 hover:text-stone-600 transition-colors"
          >
            오늘 하루 보지 않기
          </button>
        </div>
      </div>
    </div>
  );
}
