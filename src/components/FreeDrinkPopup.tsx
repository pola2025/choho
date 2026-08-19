"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

/**
 * 카페 혜택 팝업 슬롯(z-58 = 기존 ValleyUsagePopup이 쓰던 자리).
 * z 규칙: 오버레이 N / 닫기버튼 N+10.
 * 현재 내용: 초리골164 베이커리 카페 무료 음료 제공(아메리카노·아이스티 택 1)
 *            + 그 외 음료 20% 할인 / 호수뷰 객실은 무료 음료 제외, 20% 할인만 적용
 * 원본 배너: wireframes/banner-free-drink-800.html
 */
export function FreeDrinkPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hideUntil = localStorage.getItem("freeDrinkPopupHideUntil");
    if (hideUntil && new Date() < new Date(hideUntil)) return;
    const timer = setTimeout(() => setIsOpen(true), 700);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => setIsOpen(false), []);

  const handleHideToday = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    localStorage.setItem("freeDrinkPopupHideUntil", tomorrow.toISOString());
    setIsOpen(false);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[58] flex items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto p-4">
      {/* Close */}
      <button
        onClick={handleClose}
        className="fixed top-3 right-3 md:top-4 md:right-4 z-[68] w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-sm border border-stone-200"
        aria-label="닫기"
      >
        <X className="w-4 h-4 text-stone-700" />
      </button>

      {/* 팝업 본체 */}
      <div className="w-full max-w-[420px] md:max-w-[520px] mx-auto my-4">
        <div className="animate-fade-in-up">
          {/* 1600x1600 팝업 이미지 (800x800 배너의 2배 해상도) */}
          <Image
            src="/images/cafe/popup-free-drink-1600.png"
            alt="객실 이용 고객 무료 음료 제공 - 아메리카노 또는 아이스티 택 1, 그 외 음료 20% 할인. 호수뷰 객실은 무료 음료 제외, 20% 할인만 적용."
            width={1600}
            height={1600}
            className="w-full h-auto rounded-2xl drop-shadow-2xl"
            priority
          />

          {/* 카페 메뉴 보기 */}
          <Link
            href="/cafe"
            onClick={handleClose}
            className="block w-full mt-4 py-3 bg-[#c24458] text-white text-base font-semibold rounded-xl text-center hover:bg-[#a33548] transition-colors shadow-lg"
          >
            카페 메뉴 보기
          </Link>

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
