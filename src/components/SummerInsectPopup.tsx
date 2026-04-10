"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Lightbulb, LayoutGrid, Sparkles } from "lucide-react";

export function SummerInsectPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hideUntil = localStorage.getItem("insectPopupHideUntil");
    if (hideUntil && new Date() < new Date(hideUntil)) return;
    const timer = setTimeout(() => setIsOpen(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => setIsOpen(false), []);

  const handleHideToday = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    localStorage.setItem("insectPopupHideUntil", tomorrow.toISOString());
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
      <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-[380px] w-full mx-auto animate-fade-in-up">
        {/* Header */}
        <div className="bg-amber-50 px-6 pt-6 pb-4 text-center border-b border-amber-100">
          <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-7 h-7 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M12 9v2m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-stone-900 tracking-tight">여름철 날벌레 안내</h2>
          <p className="text-xs text-amber-700 mt-1 font-medium">Summer Insect Notice</p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-[13.5px] text-stone-700 leading-relaxed">
            초호는 <strong className="text-stone-900">자연 속 산기슭</strong>에 위치해 있어,
            여름철에는 <strong className="text-stone-900">날벌레</strong>가 유입될 수 있습니다.
            쾌적한 숙박을 위해 아래 사항을 꼭 지켜주세요.
          </p>

          <div className="h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />

          {/* Checklist */}
          <div className="space-y-3">
            {/* 외등 */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center mt-0.5">
                <Lightbulb className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-stone-900">취침 전 테라스 외등 OFF</p>
                <p className="text-[12px] text-stone-500 mt-0.5 leading-relaxed">
                  외등 불빛에 날벌레가 몰려옵니다.
                  <br />
                  취침 시 반드시 꺼주세요.
                </p>
              </div>
            </div>

            {/* 창문 */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-9 h-9 bg-sky-50 rounded-lg flex items-center justify-center mt-0.5">
                <LayoutGrid className="w-5 h-5 text-sky-500" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-stone-900">창문 및 출입문 닫기</p>
                <p className="text-[12px] text-stone-500 mt-0.5 leading-relaxed">
                  환기 후에는 창문과 출입문을
                  <br />꼭 닫아주세요.
                </p>
              </div>
            </div>

            {/* 자연환경 */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center mt-0.5">
                <Sparkles className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-stone-900">자연환경 특성 안내</p>
                <p className="text-[12px] text-stone-500 mt-0.5 leading-relaxed">
                  산 속 객실 특성상 소량의 날벌레가
                  <br />
                  객실 내에 유입될 수 있으며,
                  <br />
                  이는 자연환경에 의한 것입니다.
                </p>
              </div>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent" />

          {/* Footer */}
          <div className="bg-stone-50 -mx-6 -mb-5 px-6 py-4">
            <p className="text-[11.5px] text-stone-400 text-center leading-relaxed">
              쾌적한 숙박을 위해 협조 부탁드립니다.
              <br />
              불편사항은 언제든 문의해 주세요.
            </p>
            <button
              onClick={handleClose}
              className="w-full mt-3 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors"
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
    </div>
  );
}
