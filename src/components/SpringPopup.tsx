"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Phone } from "lucide-react";

function CherryBlossoms() {
  const [petals, setPetals] = useState<
    { id: number; size: number; left: number; duration: number; delay: number }[]
  >([]);

  useEffect(() => {
    setPetals(
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        size: Math.random() * 8 + 5,
        left: Math.random() * 100,
        duration: Math.random() * 5 + 5,
        delay: Math.random() * 10,
      }))
    );
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[51]">
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            top: -10,
            background:
              "radial-gradient(ellipse at 30% 30%, rgba(232,191,174,0.7), rgba(210,150,122,0.4))",
            borderRadius: "50% 0 50% 50%",
            animation: `petal-fall ${p.duration}s linear ${p.delay}s infinite`,
            pointerEvents: "none",
          }}
        />
      ))}
    </div>
  );
}

/* ===== 카드 1: 입실시간 ===== */
function CheckinCard() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full border border-stone-100">
      <div className="h-1.5 bg-gradient-to-r from-brand-300 via-brand-200 to-brand-300" />
      <div className="p-5 md:p-6 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4 md:mb-5">
          <div className="w-9 h-9 md:w-10 md:h-10 bg-brand-50 rounded-xl flex items-center justify-center border border-brand-100">
            <svg
              className="w-4 h-4 md:w-5 md:h-5 text-brand-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <h2 className="text-base md:text-lg font-semibold text-stone-800">입실시간 안내</h2>
            <p className="text-[10px] md:text-xs text-stone-500">Check-in Notice</p>
          </div>
        </div>

        <div className="bg-brand-50 rounded-xl p-4 md:p-5 text-center mb-4 md:mb-5 border border-brand-100">
          <p className="text-brand-400 text-xs md:text-sm mb-1">저녁</p>
          <p className="text-4xl md:text-5xl font-bold text-stone-800 tracking-tight font-serif">
            18:00
          </p>
          <p className="text-stone-500 text-xs md:text-sm mt-1">이후 입실 시</p>
        </div>

        <div className="bg-red-50 rounded-xl p-3 md:p-4 mb-4 md:mb-5 border border-red-100">
          <p className="text-red-700 font-semibold text-sm md:text-base text-center mb-1 md:mb-2">
            관리자 사전 연락 필수
          </p>
          <p className="text-stone-600 text-xs md:text-sm text-center leading-relaxed">
            저녁 6시 이후 입실 예정이신
            <br />
            고객님께서는 반드시 사전에
            <br />
            미리 연락 바랍니다.
          </p>
        </div>

        <div className="mt-auto">
          <a
            href="tel:010-7932-0029"
            className="block w-full py-2.5 md:py-3 bg-stone-800 text-white text-sm font-medium rounded-xl text-center hover:bg-stone-700 transition-colors"
          >
            010-7932-0029
          </a>
        </div>
      </div>
    </div>
  );
}

/* ===== 카드 2: 커피쿠폰 제공 ===== */
function CoffeeCard() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full border border-stone-100">
      <div className="h-1.5 bg-gradient-to-r from-brand-300 via-brand-200 to-brand-300" />
      <div className="p-5 md:p-6 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4 md:mb-5">
          <div className="w-9 h-9 md:w-10 md:h-10 bg-brand-50 rounded-xl flex items-center justify-center border border-brand-100">
            <svg
              className="w-4 h-4 md:w-5 md:h-5 text-brand-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3" />
            </svg>
          </div>
          <div>
            <h2 className="text-base md:text-lg font-semibold text-stone-800">커피쿠폰 제공</h2>
            <p className="text-[10px] md:text-xs text-stone-500">Coffee Coupon</p>
          </div>
        </div>

        <div className="bg-brand-50 rounded-xl p-4 md:p-5 text-center mb-3 md:mb-4 border border-brand-100 relative overflow-hidden">
          <div className="absolute top-1 right-2 md:top-2 md:right-3 text-brand-200 text-xl md:text-2xl opacity-80">
            &#10047;
          </div>
          <div className="absolute bottom-2 left-2 md:bottom-3 md:left-3 text-brand-200 text-base md:text-lg opacity-40">
            &#10047;
          </div>
          <p className="text-stone-500 text-xs md:text-sm mb-1">객실 이용 고객</p>
          <p className="text-stone-800 font-bold text-lg md:text-xl font-serif mb-1.5">
            커피쿠폰 제공
          </p>
          <div className="w-10 md:w-12 h-px bg-brand-300 mx-auto my-1.5 md:my-2" />
          <p className="text-brand-500 text-[11px] md:text-xs font-medium">
            초리골164 베이커리 카페
          </p>
        </div>

        {/* 카페 운영시간 */}
        <div className="bg-stone-50 rounded-xl p-3 md:p-3.5 mb-3 md:mb-4 border border-stone-100">
          <p className="text-stone-500 text-[10px] md:text-xs text-center mb-2 tracking-wider">
            카페 운영시간
          </p>
          <div className="space-y-1 md:space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-stone-500 text-[10px] md:text-xs">주말</span>
              <span className="text-stone-800 font-bold text-xs md:text-sm font-serif">
                10:30 <span className="text-brand-400 font-normal mx-0.5">–</span> 19:00
              </span>
            </div>
            <div className="flex items-center justify-between px-1">
              <span className="text-stone-500 text-[10px] md:text-xs">평일</span>
              <span className="text-stone-800 font-bold text-xs md:text-sm font-serif">
                11:00 <span className="text-brand-400 font-normal mx-0.5">–</span> 19:00
              </span>
            </div>
          </div>
          <p className="text-red-600 text-[10px] md:text-xs text-center mt-2 pt-2 border-t border-stone-200 font-semibold">
            매주 수요일 휴무
          </p>
        </div>

        <div className="space-y-1.5 md:space-y-2 flex-1">
          {[
            "입실 시 카페에서 이용 가능",
            "퇴실 전 오전 11시 이전까지 이용 가능",
            "기준인원 + 추가인원 모두 제공",
          ].map((text) => (
            <div key={text} className="flex items-center gap-2 md:gap-2.5">
              <span className="w-4 h-4 md:w-5 md:h-5 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-[9px] md:text-[10px] font-bold flex-shrink-0">
                &#10003;
              </span>
              <p className="text-stone-600 text-[11px] md:text-xs">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===== 카드 3: 레이트 체크아웃 ===== */
function LateCheckoutCard() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full border border-stone-100">
      <div className="h-1.5 bg-gradient-to-r from-brand-300 via-brand-200 to-brand-300" />
      <div className="p-5 md:p-6 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4 md:mb-5">
          <div className="w-9 h-9 md:w-10 md:h-10 bg-brand-50 rounded-xl flex items-center justify-center border border-brand-100">
            <svg
              className="w-4 h-4 md:w-5 md:h-5 text-brand-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base md:text-lg font-semibold text-stone-800">레이트 체크아웃</h2>
            <p className="text-[10px] md:text-xs text-stone-500">Late Check-out</p>
          </div>
        </div>

        {/* 시간 변경 */}
        <div className="bg-brand-50 rounded-xl p-4 md:p-5 mb-4 md:mb-5 border border-brand-100">
          <div className="flex items-center justify-center gap-3 md:gap-4">
            <div className="text-center">
              <p className="text-stone-500 text-[10px] md:text-xs mb-1">기본 퇴실</p>
              <p className="text-stone-400 font-bold text-2xl md:text-3xl line-through font-serif">
                11:00
              </p>
            </div>
            <svg
              className="w-5 h-5 md:w-6 md:h-6 text-brand-400"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <div className="text-center">
              <p className="text-brand-500 text-[10px] md:text-xs mb-1 font-semibold">연장 퇴실</p>
              <p className="text-stone-800 font-bold text-3xl md:text-4xl font-serif">12:00</p>
            </div>
          </div>
        </div>

        {/* 조건 */}
        <div className="space-y-2 md:space-y-3 flex-1">
          <div className="bg-stone-50 rounded-xl p-3 md:p-4 border border-stone-100">
            <div className="flex items-center gap-2 md:gap-2.5 mb-1 md:mb-2">
              <div className="w-6 h-6 md:w-7 md:h-7 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-[10px] md:text-xs">N</span>
              </div>
              <h3 className="font-semibold text-stone-700 text-xs md:text-sm">
                네이버 예약 리뷰 작성
              </h3>
            </div>
            <p className="text-stone-500 text-[10px] md:text-xs leading-relaxed ml-8 md:ml-[38px]">
              리뷰 작성 후 캡쳐이미지를
              <br />
              관리자 문자로 전달해주세요.
            </p>
          </div>

          <div className="bg-stone-50 rounded-xl p-3 md:p-4 border border-stone-100">
            <div className="flex items-start gap-2 md:gap-2.5">
              <div className="w-6 h-6 md:w-7 md:h-7 bg-brand-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-brand-600 text-xs md:text-sm">&#x1F4DD;</span>
              </div>
              <div>
                <h3 className="font-semibold text-stone-700 text-xs md:text-sm mb-1">
                  예약자 메모 필수
                </h3>
                <p className="text-stone-500 text-[10px] md:text-xs leading-relaxed">
                  예약 시 메모에{" "}
                  <span className="font-semibold text-stone-700 bg-brand-100 px-0.5 md:px-1 py-0.5 rounded">
                    &quot;레이트체크아웃 신청&quot;
                  </span>{" "}
                  기재
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-3 md:pt-4">
          <a
            href="sms:010-7932-0029"
            className="block w-full py-2.5 md:py-3 bg-stone-800 text-white text-sm font-medium rounded-xl text-center hover:bg-stone-700 transition-colors"
          >
            리뷰 캡쳐 문자 보내기
          </a>
          <p className="text-center text-[10px] md:text-xs text-stone-500 mt-1.5 md:mt-2">
            010-7932-0029
          </p>
        </div>
      </div>
    </div>
  );
}

/* ===== 카드 4: 카페 추가 음료 할인 ===== */
function CafeDiscountCard() {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full border border-stone-100">
      <div className="h-1.5 bg-gradient-to-r from-brand-300 via-brand-200 to-brand-300" />
      <div className="p-5 md:p-6 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4 md:mb-5">
          <div className="w-9 h-9 md:w-10 md:h-10 bg-brand-50 rounded-xl flex items-center justify-center border border-brand-100">
            <svg
              className="w-4 h-4 md:w-5 md:h-5 text-brand-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base md:text-lg font-semibold text-stone-800">카페 음료 할인</h2>
            <p className="text-[10px] md:text-xs text-stone-500">Cafe Drink Discount</p>
          </div>
        </div>

        <div className="bg-brand-50 rounded-xl p-5 md:p-6 text-center mb-4 md:mb-5 border border-brand-100 relative overflow-hidden">
          <div className="absolute top-1 right-2 md:top-2 md:right-3 text-brand-200 text-xl md:text-2xl opacity-80">
            &#9749;
          </div>
          <p className="text-stone-500 text-xs md:text-sm mb-2">추가 음료 구매 시</p>
          <p className="text-stone-800 font-bold text-3xl md:text-4xl font-serif mb-1">
            20% <span className="text-xl md:text-2xl">할인</span>
          </p>
          <div className="w-10 md:w-12 h-px bg-brand-300 mx-auto my-2 md:my-3" />
          <p className="text-brand-500 text-xs md:text-sm font-medium">초리골164 베이커리 카페</p>
        </div>

        <div className="space-y-2 md:space-y-3 flex-1">
          {[
            "객실 이용 고객 커피쿠폰 기본 제공",
            "추가 음료 주문 시 20% 할인 적용",
            "체크인 시 카페에서 바로 이용",
          ].map((text) => (
            <div key={text} className="flex items-center gap-2 md:gap-2.5">
              <span className="w-4 h-4 md:w-5 md:h-5 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-[9px] md:text-[10px] font-bold flex-shrink-0">
                &#10003;
              </span>
              <p className="text-stone-600 text-xs md:text-sm">{text}</p>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-3 md:pt-4">
          <div className="bg-brand-50 rounded-xl p-3 text-center border border-brand-100">
            <p className="text-brand-600 text-xs md:text-sm font-medium">
              펜션 손님 전용 특별 혜택
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== BBQ 배너 ===== */
function BBQBanner() {
  const items = [
    {
      name: "가스버너 & 캠핑그릴",
      price: "2만원",
      desc: "Forest 객실 테라스 전용",
      note: "※ 영하권 착화불가 → 관리자 연락",
      noteColor: "text-amber-600",
    },
    {
      name: "숯불바베큐 5동",
      price: "3만원",
      desc: "Forest Room 지정 바베큐장",
      note: "※ 5동 한정 → 조기마감",
      noteColor: "text-red-500",
    },
    {
      name: "호수뷰 객실",
      price: "3만원",
      desc: "객실 앞 테라스 숯불바베큐",
      note: "※ 가스버너 희망시 관리자 연락",
      noteColor: "text-blue-500",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-stone-100">
      <div className="h-1 md:h-1.5 bg-gradient-to-r from-amber-700 via-orange-600 to-amber-700" />
      <div className="p-4 md:p-5">
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-orange-50 rounded-xl flex items-center justify-center border border-orange-100">
              <span className="text-lg md:text-xl">&#x1F525;</span>
            </div>
            <div>
              <h3 className="font-semibold text-stone-800 text-sm md:text-base">
                바베큐 시설 안내
              </h3>
              <p className="text-[10px] md:text-xs text-stone-500">
                BBQ Facilities &middot; 숯불 현장결제
              </p>
            </div>
          </div>
          <a
            href="tel:010-7932-0029"
            className="flex items-center gap-1.5 bg-stone-800 text-white font-medium px-3 py-1.5 md:px-4 md:py-2 rounded-xl hover:bg-stone-700 transition-colors text-xs md:text-sm"
          >
            <Phone className="w-3 h-3 md:w-3.5 md:h-3.5" />
            문의하기
          </a>
        </div>

        {/* Desktop grid / Mobile stack */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4">
          {items.map((item) => (
            <div
              key={item.name}
              className="bg-stone-50 rounded-xl p-3 md:p-4 border border-stone-100"
            >
              <div className="flex items-center justify-between mb-1 md:mb-2">
                <h4 className="font-semibold text-stone-700 text-xs md:text-sm">{item.name}</h4>
                <span className="text-brand-500 font-bold text-xs md:text-sm">{item.price}</span>
              </div>
              <p className="text-stone-500 text-[10px] md:text-xs">{item.desc}</p>
              <p className={`${item.noteColor} text-[10px] mt-1`}>{item.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===== 메인 팝업 ===== */
export function SpringPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const hideUntil = localStorage.getItem("springPopupHideUntil");
    if (hideUntil && new Date() < new Date(hideUntil)) return;
    const timer = setTimeout(() => setIsOpen(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => setIsOpen(false), []);

  const handleHideToday = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    localStorage.setItem("springPopupHideUntil", tomorrow.toISOString());
    setIsOpen(false);
  }, []);

  const nextSlide = useCallback(() => setCurrentSlide((p) => (p + 1) % 4), []);
  const prevSlide = useCallback(() => setCurrentSlide((p) => (p - 1 + 4) % 4), []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start xl:items-center justify-center bg-black/70 backdrop-blur-sm overflow-y-auto">
      <CherryBlossoms />

      {/* Close */}
      <button
        onClick={handleClose}
        className="fixed top-3 right-3 md:top-4 md:right-4 z-[60] w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center transition-all shadow-sm border border-stone-200"
        aria-label="닫기"
      >
        <X className="w-4 h-4 text-stone-700" />
      </button>

      {/* ========== Desktop ========== */}
      <div className="hidden md:flex md:flex-col gap-5 max-w-[1400px] w-full my-6 xl:my-auto px-6">
        <div className="text-center pt-2">
          <p className="text-white/50 text-xs tracking-[0.3em] uppercase mb-1">Chohopark</p>
          <h1 className="font-serif text-white text-2xl font-semibold tracking-wide">이용 안내</h1>
        </div>

        <div className="grid grid-cols-4 gap-5">
          <div className="animate-fade-in-up">
            <CheckinCard />
          </div>
          <div className="animate-fade-in-up delay-200">
            <CoffeeCard />
          </div>
          <div className="animate-fade-in-up delay-400">
            <CafeDiscountCard />
          </div>
          <div className="animate-fade-in-up delay-400">
            <LateCheckoutCard />
          </div>
        </div>

        <BBQBanner />

        <div className="text-center pb-4">
          <button
            onClick={handleHideToday}
            className="px-6 py-2 text-sm text-white/50 hover:text-white/80 transition-colors"
          >
            오늘 하루 보지 않기
          </button>
        </div>
      </div>

      {/* ========== Mobile ========== */}
      <div className="md:hidden w-full max-w-sm mx-auto my-4 py-4 overflow-x-hidden">
        <div className="text-center mb-4">
          <p className="text-white/40 text-[10px] tracking-[0.3em] uppercase mb-0.5">Chohopark</p>
          <h1 className="font-serif text-white text-lg font-semibold tracking-wide">이용 안내</h1>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              <div className="w-full flex-shrink-0 px-2">
                <CheckinCard />
              </div>
              <div className="w-full flex-shrink-0 px-2">
                <CoffeeCard />
              </div>
              <div className="w-full flex-shrink-0 px-2">
                <CafeDiscountCard />
              </div>
              <div className="w-full flex-shrink-0 px-2">
                <LateCheckoutCard />
              </div>
            </div>
          </div>

          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-sm z-30 -ml-1"
            aria-label="이전"
          >
            <ChevronLeft className="w-4 h-4 text-stone-700" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-sm z-30 -mr-1"
            aria-label="다음"
          >
            <ChevronRight className="w-4 h-4 text-stone-700" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-3">
          {[0, 1, 2, 3].map((i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === currentSlide ? "bg-white w-4" : "bg-white/30 w-1.5"
              }`}
              aria-label={`슬라이드 ${i + 1}`}
            />
          ))}
        </div>

        {/* Mobile BBQ */}
        <div className="mt-4 px-2">
          <BBQBanner />
        </div>

        <button
          onClick={handleHideToday}
          className="w-full mt-4 py-2 text-xs text-white/40 hover:text-white/70 transition-colors text-center"
        >
          오늘 하루 보지 않기
        </button>
      </div>
    </div>
  );
}
