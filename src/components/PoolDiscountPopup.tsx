"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import Image from "next/image";

/**
 * 수영장 팝업 슬롯(z-70 = 홈 팝업 중 최상단).
 * z 규칙: 오버레이 N / 닫기버튼 N+10. 다음으로 높은 게 FamilyCapacity(59/69)이고
 * SummerInsect·Spring의 닫기버튼이 z-60이라, 60이 아니라 70/80을 써야 안 겹친다.
 * 현재 내용: 2026 시원한 여름 프로모션 — 8/3(월)~8/16(일) 입실 고객
 *            무료입장권 2매 + 추가 인원 50% 할인권 (기존 투숙객 50% 할인 혜택 통합)
 * 프로모션 종료 시: 이미지를 /images/pool/popup-pool-discount-800.png (상시 50% 할인, 800×800)
 *                  으로 되돌리거나 page.tsx에서 언마운트.
 */
export function PoolDiscountPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hideUntil = localStorage.getItem("summerPoolPromoPopupHideUntil");
    if (hideUntil && new Date() < new Date(hideUntil)) return;
    const timer = setTimeout(() => setIsOpen(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => setIsOpen(false), []);

  const handleHideToday = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    localStorage.setItem("summerPoolPromoPopupHideUntil", tomorrow.toISOString());
    setIsOpen(false);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto p-4">
      {/* Close */}
      <button
        onClick={handleClose}
        className="fixed top-3 right-3 md:top-4 md:right-4 z-[80] w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-sm border border-stone-200"
        aria-label="닫기"
      >
        <X className="w-4 h-4 text-stone-700" />
      </button>

      {/* 팝업 본체 */}
      <div className="w-full max-w-[420px] md:max-w-[588px] mx-auto my-4">
        <div className="animate-fade-in-up">
          {/* 800x800 팝업 이미지 */}
          <Image
            src="/images/pool/popup-summer-promo-800.png"
            alt="시원한 여름 프로모션 - 8월 3일부터 8월 16일 입실 고객 대상 더초리골 수영장 무료입장권 2매, 추가 인원 50% 할인권"
            width={800}
            height={1120}
            className="w-full h-auto drop-shadow-2xl"
            priority
          />

          {/* 예약 버튼 */}
          <a
            href="https://pcmap.place.naver.com/accommodation/1149332657/room?bk_query=%EC%B4%88%ED%98%B8%ED%8E%9C%EC%85%98&entry=pbl&from=map&fromNxList=true&fromPanelNum=2&timestamp=202605312206&locale=ko&svcName=map_pcv5&searchText=%EC%B4%88%ED%98%B8%ED%8E%9C%EC%85%98&businessCategory=pension"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full mt-4 py-3 bg-cyan-600 text-white text-base font-semibold rounded-xl text-center hover:bg-cyan-700 transition-colors shadow-lg"
          >
            객실 예약하기
          </a>

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
