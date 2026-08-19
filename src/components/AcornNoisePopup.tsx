"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import Image from "next/image";

/**
 * 가을철 안내 팝업 슬롯(z-70 = 홈 팝업 중 최상단).
 * z 규칙: 오버레이 N / 닫기버튼 N+10. 다음으로 높은 게 FamilyCapacity(59/69)이고
 * SummerInsect·Spring의 닫기버튼이 z-60이라, 60이 아니라 70/80을 써야 안 겹친다.
 * 현재 내용: 밤·도토리가 객실 지붕으로 떨어지며 나는 소리 사전 안내 (9~10월)
 * 원본 배너: wireframes/banner-acorn-roof-noise-800.html
 * 시즌 종료 시: page.tsx에서 언마운트.
 */
export function AcornNoisePopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hideUntil = localStorage.getItem("acornNoisePopupHideUntil");
    if (hideUntil && new Date() < new Date(hideUntil)) return;
    const timer = setTimeout(() => setIsOpen(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => setIsOpen(false), []);

  const handleHideToday = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    localStorage.setItem("acornNoisePopupHideUntil", tomorrow.toISOString());
    setIsOpen(false);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto p-3 md:p-4">
      {/* Close */}
      <button
        onClick={handleClose}
        className="fixed top-3 right-3 md:top-4 md:right-4 z-[80] w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-sm border border-stone-200"
        aria-label="닫기"
      >
        <X className="w-4 h-4 text-stone-700" />
      </button>

      {/* 팝업 본체 */}
      <div className="w-full max-w-[460px] md:max-w-[min(720px,80vh)] mx-auto my-3 md:my-4">
        <div className="animate-fade-in-up">
          {/* 1600x1600 팝업 이미지 (800x800 배너의 2배 해상도) */}
          <Image
            src="/images/notice/popup-acorn-roof-1600.png"
            alt="가을철 안내 - 밤과 도토리가 객실 지붕으로 떨어지며 툭툭 소리가 납니다. 시설 이상이 아닙니다."
            width={1600}
            height={1600}
            className="w-full h-auto rounded-2xl drop-shadow-2xl"
            priority
          />

          {/* 오늘 하루 보지 않기 */}
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
