"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import Image from "next/image";

export function IceWallBannerPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hideUntil = localStorage.getItem("iceWallPopupHideUntil");
    if (hideUntil && new Date() < new Date(hideUntil)) return;
    const timer = setTimeout(() => setIsOpen(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => setIsOpen(false), []);

  const handleHideToday = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    localStorage.setItem("iceWallPopupHideUntil", tomorrow.toISOString());
    setIsOpen(false);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[55] flex items-start md:items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto">
      {/* Close */}
      <button
        onClick={handleClose}
        className="fixed top-3 right-3 md:top-4 md:right-4 z-[65] w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-sm border border-stone-200"
        aria-label="닫기"
      >
        <X className="w-4 h-4 text-stone-700" />
      </button>

      {/* 팝업 본체 */}
      <div className="w-full max-w-md mx-auto my-4 px-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-stone-100 animate-fade-in-up">
          {/* 상단 그라데이션 바 */}
          <div className="h-1.5 bg-gradient-to-r from-cyan-300 via-blue-200 to-cyan-300" />

          {/* 이미지 영역 */}
          <div className="relative">
            <Image
              src="/images/icewall-banner.png"
              alt="초호쉼터 빙벽 - 2026년 3월 8일 현재 모습"
              width={1080}
              height={1080}
              className="w-full h-auto"
              priority
            />
          </div>

          {/* 텍스트 영역 */}
          <div className="p-5 md:p-6">
            {/* 아이콘 + 타이틀 */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center border border-cyan-100 flex-shrink-0">
                <span className="text-xl">&#x1F9CA;</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-stone-800">초호쉼터 빙벽</h2>
                <p className="text-xs text-stone-600 tracking-wider">Ice Wall &middot; Chohopark</p>
              </div>
            </div>

            {/* 메인 카피 */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 mb-4 border border-cyan-100">
              <p className="text-stone-800 text-base font-semibold leading-relaxed mb-2">
                이색적인 초호쉼터 빙벽,
                <br />
                3월 말까지 볼 수 있습니다.
              </p>
              <p className="text-stone-700 text-sm leading-relaxed">
                봄이 다가오고 있지만
                <br />
                빙벽은 아직까지 여전히 볼 수 있어요.
              </p>
            </div>

            {/* 현재 모습 강조 */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <p className="text-stone-800 text-sm">
                <span className="font-semibold">26년 3월 8일(일)</span> 현재 모습
              </p>
            </div>

            {/* 하단 버튼 */}
            <a
              href="https://m.place.naver.com/accommodation/1102553988/home"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-3 bg-stone-800 text-white text-base font-medium rounded-xl text-center hover:bg-stone-700 transition-colors"
            >
              객실 예약하기
            </a>
          </div>

          {/* 오늘 하루 보지 않기 */}
          <div className="border-t border-stone-100 px-5 py-3">
            <button
              onClick={handleHideToday}
              className="w-full text-center text-sm text-stone-500 hover:text-stone-700 transition-colors"
            >
              오늘 하루 보지 않기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
