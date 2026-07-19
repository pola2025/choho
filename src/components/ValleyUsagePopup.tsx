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
            {/* 사진 히어로 */}
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/valley/valley-popup.webp"
                alt="초호쉼터 계곡 - 충분한 수량 확보, 펜션 투숙객 전용 이용"
                className="w-full h-[280px] object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(180deg, rgba(0,0,0,.05) 40%, rgba(0,0,0,.78))",
                }}
              />
              <div className="absolute left-0 right-0 bottom-0 p-5 text-white">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="inline-block text-[11px] font-semibold bg-white/25 backdrop-blur px-2.5 py-1 rounded-full">
                    여름 계곡 오픈
                  </span>
                  <span
                    className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: "hsl(var(--accent))", color: "#3a2e00" }}
                  >
                    펜션 투숙객 전용
                  </span>
                </div>
                <h3 className="text-2xl font-extrabold leading-tight drop-shadow">
                  시원한 계곡,
                  <br />
                  이제 이용하세요
                </h3>
              </div>
            </div>

            {/* 텍스트 패널 */}
            <div className="p-5">
              <p className="text-[15px] text-neutral-700 leading-relaxed">
                충분한 수량이 확보되어 <b className="text-primary">계곡 이용이 가능</b>합니다.
                <br />
                펜션 이용 고객에 한해 시원한 계곡에서 휴식을!
              </p>
              <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-[13px] text-amber-800">
                ⚠️ 계곡 내 음주 · 의자 · 테이블 이용은 제한됩니다.
              </div>
              <a
                href={RESERVATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full mt-4 py-3 bg-primary text-white text-base font-semibold rounded-xl text-center hover:bg-primary/90 transition-colors shadow-lg"
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
