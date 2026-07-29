"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";

const RESERVATION_URL =
  "https://pcmap.place.naver.com/accommodation/1149332657/room?bk_query=%EC%B4%88%ED%98%B8%ED%8E%9C%EC%85%98&entry=pbl&from=map&fromNxList=true&fromPanelNum=2&timestamp=202605312206&locale=ko&svcName=map_pcv5&searchText=%EC%B4%88%ED%98%B8%ED%8E%9C%EC%85%98&businessCategory=pension";

/** 인원 아이콘 — 이모지(👤)는 CSS 색이 먹지 않아 플랫폼 기본 보라색으로 렌더되므로 SVG 사용 */
function PersonIcon({ className }: { className: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.4" />
      <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
    </svg>
  );
}

function AdultDot() {
  return (
    <span
      style={{ background: "hsl(var(--primary))" }}
      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white"
    >
      <PersonIcon className="w-[18px] h-[18px]" />
    </span>
  );
}

function BabyDot() {
  return (
    <span className="w-7 h-7 rounded-full bg-amber-100 border border-dashed border-amber-400 flex items-center justify-center shrink-0 text-amber-700">
      <PersonIcon className="w-[14px] h-[14px]" />
    </span>
  );
}

type RoomRule = {
  name: string;
  max: string;
  adults: number;
  summary: string;
  ok: string[];
  no: string[];
};

const ROOMS: RoomRule[] = [
  {
    name: "Forest Mini 패밀리룸",
    max: "총 3명",
    adults: 2,
    summary: "정원 2명 + 유아 1명",
    ok: ["어른 2명", "어른 2명 + 유아 1명"],
    no: ["어른 3명", "어른 2명 + 어린이 1명"],
  },
  {
    name: "Forest 패밀리룸",
    max: "총 5명",
    adults: 4,
    summary: "정원 4명 + 유아 1명",
    ok: ["어른 4명 + 유아 1명", "어른 2명 + 어린이 2명"],
    no: ["어른 5명", "어른 2명 + 어린이 3명"],
  },
];

export function FamilyCapacityPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hideUntil = localStorage.getItem("familyCapacityPopupHideUntil");
    if (hideUntil && new Date() < new Date(hideUntil)) return;
    const timer = setTimeout(() => setIsOpen(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => setIsOpen(false), []);

  const handleHideToday = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    localStorage.setItem("familyCapacityPopupHideUntil", tomorrow.toISOString());
    setIsOpen(false);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[59] flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto p-4">
      {/* Close */}
      <button
        onClick={handleClose}
        className="fixed top-3 right-3 md:top-4 md:right-4 z-[69] w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-sm border border-stone-200"
        aria-label="닫기"
      >
        <X className="w-4 h-4 text-stone-700" />
      </button>

      {/* 팝업 본체 */}
      <div className="w-full max-w-[420px] mx-auto my-6">
        <div className="animate-fade-in-up">
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
            {/* 헤더 */}
            <div style={{ background: "hsl(var(--primary))" }} className="px-5 py-4 text-center">
              <p className="text-white/70 text-[11px] tracking-[0.2em] font-medium">FAMILY ROOM</p>
              <h2 className="text-white text-[19px] font-bold mt-1">패밀리 객실 이용인원 안내</h2>
            </div>

            {/* 핵심 규정 */}
            <div className="px-5 pt-5">
              <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3.5">
                <p className="text-[13px] font-bold text-amber-900 break-keep leading-relaxed">
                  정원은 나이와 관계없이 계산되고,
                  <br />
                  <span className="underline decoration-amber-400 decoration-2 underline-offset-2">
                    36개월 미만 유아 1명
                  </span>
                  만 추가할 수 있습니다.
                </p>
                <p className="text-[12.5px] text-amber-800/90 mt-2 break-keep leading-relaxed">
                  36개월이 지나면 어린이·청소년도 <b>어른과 똑같이 정원 1명</b>입니다. 추가되는 유아
                  1명도 <b>인원에는 포함</b>되며 요금만 부과되지 않습니다.
                </p>
              </div>
            </div>

            {/* 객실별 규정 */}
            {ROOMS.map((room, idx) => (
              <div key={room.name} className={idx === 0 ? "px-5 pt-5" : "px-5 pt-3"}>
                <div className="rounded-xl border border-stone-200 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-stone-50 border-b border-stone-200">
                    <span className="text-[14px] font-bold text-stone-800">{room.name}</span>
                    <span
                      style={{ color: "hsl(var(--primary))" }}
                      className="text-[11.5px] font-semibold bg-white border border-stone-200 rounded-full px-2.5 py-0.5"
                    >
                      {room.max}
                    </span>
                  </div>

                  {/* 인원 도식 */}
                  <div className="px-4 py-3.5 flex items-center gap-2 flex-wrap">
                    <div className="flex gap-1.5">
                      {Array.from({ length: room.adults }, (_, i) => (
                        <AdultDot key={i} />
                      ))}
                    </div>
                    <span className="text-stone-400 text-sm font-bold">+</span>
                    <BabyDot />
                    <span className="ml-1 text-[11.5px] text-stone-500 break-keep">
                      {room.summary}
                    </span>
                  </div>

                  {/* 가능 / 불가 */}
                  <div className="grid grid-cols-2 border-t border-stone-200 text-[12px]">
                    <div className="px-4 py-3 border-r border-stone-200">
                      <p className="text-[11px] font-bold text-emerald-700 mb-1.5">가능</p>
                      <p className="text-stone-600 leading-relaxed break-keep">
                        {room.ok.map((line) => (
                          <span key={line} className="block">
                            {line}
                          </span>
                        ))}
                      </p>
                    </div>
                    <div className="px-4 py-3 bg-red-50/40">
                      <p className="text-[11px] font-bold text-red-600 mb-1.5">불가</p>
                      <p className="text-stone-600 leading-relaxed break-keep">
                        {room.no.map((line) => (
                          <span key={line} className="block">
                            {line}
                          </span>
                        ))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* 오해하기 쉬운 사례 */}
            <div className="px-5 pt-4">
              <div className="rounded-xl bg-stone-50 border border-stone-200 px-4 py-3">
                <p className="text-[12px] font-bold text-stone-700 mb-2">
                  Forest 패밀리룸 기준 사례
                </p>
                <div className="space-y-1.5 text-[12px] text-stone-600 break-keep leading-relaxed">
                  <p>
                    <span className="text-emerald-600 font-bold">✓</span> 부부 + 어린이 2명 + 유아
                    1명 <span className="text-stone-400">→ 정원 4명 + 유아 1명</span>
                  </p>
                  <p>
                    <span className="text-red-500 font-bold">✕</span> 부부 + 어린이 3명{" "}
                    <span className="text-stone-400">→ 어린이도 정원 인원이라 정원 5명</span>
                  </p>
                  <p>
                    <span className="text-red-500 font-bold">✕</span> 어른 3명 + 어린이 1명 + 유아
                    2명{" "}
                    <span className="text-stone-400">→ 이미 정원 4명, 유아도 인원이라 총 6명</span>
                  </p>
                </div>
              </div>
            </div>

            {/* 하단 안내 */}
            <div className="px-5 pt-4 pb-5">
              <p className="text-[11.5px] text-stone-500 leading-relaxed break-keep">
                · 36개월 미만 유아도 <b className="text-stone-700">인원에는 포함</b>되며, 요금만
                부과되지 않습니다.
                <br />· 예약 인원과 실제 입실 인원이 다를 경우 입실이 제한될 수 있습니다.
              </p>
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
