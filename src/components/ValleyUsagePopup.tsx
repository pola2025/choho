"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";

const RESERVATION_URL =
  "https://pcmap.place.naver.com/accommodation/1149332657/room?bk_query=%EC%B4%88%ED%98%B8%ED%8E%9C%EC%85%98&entry=pbl&from=map&fromNxList=true&fromPanelNum=2&timestamp=202605312206&locale=ko&svcName=map_pcv5&searchText=%EC%B4%88%ED%98%B8%ED%8E%9C%EC%85%98&businessCategory=pension";

export function ValleyUsagePopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hideUntil = localStorage.getItem("valleyUsagePopupHideUntil");
    if (hideUntil && new Date() < new Date(hideUntil)) return;
    const timer = setTimeout(() => setIsOpen(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => setIsOpen(false), []);

  const handleHideToday = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    localStorage.setItem("valleyUsagePopupHideUntil", tomorrow.toISOString());
    setIsOpen(false);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[58] flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto p-4">
      {/* Close */}
      <button
        onClick={handleClose}
        className="fixed top-3 right-3 md:top-4 md:right-4 z-[68] w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-sm border border-stone-200"
        aria-label="닫기"
      >
        <X className="w-4 h-4 text-stone-700" />
      </button>

      {/* 팝업 본체 */}
      <div className="w-full max-w-[420px] mx-auto my-6">
        <div className="animate-fade-in-up">
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
            {/* 계곡 물높이 안내 그래픽 */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/valley/valley-smartplace-depth.webp"
              alt="초호쉼터 계곡 이용 안내 - 평상시 수심 20~40cm, 깊은 곳 60~70cm, 펜션 투숙객 전용"
              className="block w-full h-auto"
            />

            {/* 텍스트 패널 */}
            <div className="p-5">
              <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-[13px] text-amber-800 leading-relaxed">
                ⚠️ 기상상황에 따라 안전을 위해 계곡 출입이 제한될 수 있습니다.
              </div>
              <a
                href={RESERVATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: "hsl(var(--primary))" }}
                className="block w-full mt-3 py-3 text-white text-base font-semibold rounded-xl text-center hover:brightness-95 transition-all shadow-lg"
              >
                객실 예약하기
              </a>
            </div>
          </div>

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
