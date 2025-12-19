"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Snowflake, AlertTriangle, Phone, Coffee, Ticket, ChevronLeft, ChevronRight } from "lucide-react";

export function CombinedWinterPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const hideUntil = localStorage.getItem("combinedWinterPopupHideUntil");
    if (hideUntil) {
      const hideDate = new Date(hideUntil);
      if (new Date() < hideDate) {
        return;
      }
    }
    const timer = setTimeout(() => setIsOpen(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleHideToday = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    localStorage.setItem("combinedWinterPopupHideUntil", tomorrow.toISOString());
    setIsOpen(false);
  };

  const handleCall = () => {
    window.location.href = "tel:010-7932-0029";
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 3);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 3) % 3);
  };

  if (!isOpen) return null;

  // 팝업 카드 컴포넌트들
  const IceWallCard = () => (
    <div className="relative bg-neutral-900 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden h-full">
      <div className="relative aspect-[5/7] h-full">
        <Image
          src="/images/journal/ice-wall/ice-wall-2.webp"
          alt="초호쉼터 빙벽"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 bg-blue-500/90 text-white text-[10px] sm:text-xs font-semibold rounded-full backdrop-blur-sm">
          <Snowflake className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          <span>겨울 시즌</span>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5">
          <h2 className="text-base sm:text-xl font-bold text-white mb-1">
            빙벽 시즌 오픈!
          </h2>
          <p className="text-xs sm:text-sm text-white/80 mb-2 sm:mb-4 leading-relaxed">
            한파와 함께 초호펜션 빙벽이 아름답게 얼어붙었습니다.
          </p>
          <Link
            href="/about/journal/ice-wall-2025"
            className="block w-full py-2 sm:py-3 bg-white text-neutral-900 font-medium rounded-lg sm:rounded-xl text-center hover:bg-white/90 transition-colors text-xs sm:text-sm"
            onClick={handleClose}
          >
            자세히 보기
          </Link>
        </div>
      </div>
    </div>
  );

  const WinterNoticeCard = () => (
    <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden h-full">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "url('/images/rooms/forest/main.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="relative z-10 p-4 md:p-6 h-full flex flex-col">
        <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
          </div>
          <div>
            <h2 className="text-lg md:text-2xl font-bold text-neutral-900">
              겨울철 이용 안내
            </h2>
            <p className="text-xs md:text-sm text-muted-foreground">
              이용에 참고 부탁드립니다
            </p>
          </div>
        </div>
        <div className="space-y-2 md:space-y-3 flex-1">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 md:p-3">
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <div>
                <h3 className="font-semibold text-blue-900 text-sm md:text-base">동파 예방을 위한 물소리 발생</h3>
                <p className="text-xs md:text-sm text-blue-700">수도배관 동파 방지로 물소리가 들릴 수 있습니다.</p>
              </div>
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 md:p-3">
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <div>
                <h3 className="font-semibold text-amber-900 text-sm md:text-base">영하권 한파에 테라스 그릴 사용 불가</h3>
                <p className="text-xs md:text-sm text-amber-700">버너그릴은 한파에 착화가 안 됩니다.</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-2.5 md:p-3">
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <div>
                <h3 className="font-semibold text-purple-900 text-sm md:text-base">조설기 작동소음 안내</h3>
                <p className="text-xs md:text-sm text-purple-700">겨울축제장 소음이 들릴 수 있습니다.</p>
              </div>
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 md:p-3">
            <div className="flex items-start gap-2">
              <Coffee className="flex-shrink-0 w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="font-semibold text-emerald-900 text-sm md:text-base">초리골164 음료 무료쿠폰 제공</h3>
                <p className="text-xs md:text-sm text-emerald-700">기준인원 + 추가인원에게 제공</p>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={handleCall}
          className="w-full py-2.5 md:py-3 mt-3 bg-primary text-white font-medium rounded-lg text-center hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
        >
          <Phone className="w-4 h-4 md:w-5 md:h-5" />
          문의하기
        </button>
      </div>
    </div>
  );

  const SledTicketCard = () => (
    <div className="relative bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden h-full">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      <div className="relative z-10 p-4 md:p-6 h-full flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Ticket className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div className="flex-1">
              <span className="inline-block px-2.5 py-0.5 md:px-3 md:py-1 bg-yellow-400 text-yellow-900 text-xs md:text-sm font-bold rounded-full mb-1">
                할인 혜택
              </span>
              <h2 className="text-lg md:text-2xl font-bold text-white leading-tight">
                눈썰매장 입장권 할인
              </h2>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-5 mb-3 md:mb-4">
            <p className="text-white font-medium text-base md:text-lg mb-2">
              초호펜션 이용고객
            </p>
            <p className="text-white/90 text-sm md:text-base leading-relaxed">
              초리골 눈썰매장 입장권을<br/>
              <span className="text-yellow-300 font-bold">할인된 가격</span>으로 구매하실 수 있습니다!
            </p>
          </div>
        </div>
        <div className="space-y-2 md:space-y-3">
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2.5 md:p-3 text-center">
            <p className="text-white/90 text-xs md:text-sm">
              관리자 연락 또는 펜션예약시 신청바랍니다
            </p>
          </div>
          <button
            onClick={handleCall}
            className="w-full py-3 md:py-4 bg-white text-blue-600 font-bold rounded-xl text-center hover:bg-white/90 transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <Phone className="w-4 h-4 md:w-5 md:h-5" />
            지금 신청하기
          </button>
        </div>
      </div>
    </div>
  );

  const CafeDiscountCard = () => (
    <div className="relative bg-gradient-to-br from-amber-600 to-orange-700 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden h-full">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='52' height='26' viewBox='0 0 52 26' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M10 10c0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6h2c0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4 3.314 0 6 2.686 6 6 0 2.21 1.79 4 4 4v2c-3.314 0-6-2.686-6-6 0-2.21-1.79-4-4-4-3.314 0-6-2.686-6-6zm25.464-1.95l8.486 8.486-1.414 1.414-8.486-8.486 1.414-1.414z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      <div className="relative z-10 p-4 md:p-6 h-full flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Coffee className="w-6 h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div className="flex-1">
              <span className="inline-block px-2.5 py-0.5 md:px-3 md:py-1 bg-yellow-400 text-yellow-900 text-xs md:text-sm font-bold rounded-full mb-1">
                카페 할인
              </span>
              <h2 className="text-lg md:text-2xl font-bold text-white leading-tight">
                음료 & 커피 10% 할인
              </h2>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 md:p-5 mb-3 md:mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Snowflake className="w-5 h-5 text-white/80" />
              <p className="text-white font-medium text-base md:text-lg">
                눈내리는 초리골 눈썰매장
              </p>
            </div>
            <p className="text-white/90 text-sm md:text-base leading-relaxed">
              눈썰매장 <span className="text-yellow-300 font-bold">팔찌 지참</span>시<br/>
              초리골164베이커리 카페에서<br/>
              음료&커피 <span className="text-yellow-300 font-bold text-xl md:text-2xl">10% 할인!</span>
            </p>
          </div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 md:p-4 text-center">
          <p className="text-white text-sm md:text-base font-medium">
            🎿 눈썰매장 팔찌를 보여주세요!
          </p>
          <p className="text-white/80 text-xs md:text-sm mt-1">
            초리골164베이커리 카페에서 사용 가능
          </p>
        </div>
      </div>
    </div>
  );

  const popupCards = [
    <SledTicketCard key="sled-ticket" />,
    <CafeDiscountCard key="cafe-discount" />,
    <WinterNoticeCard key="winter-notice" />,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="fixed top-3 right-3 md:top-4 md:right-4 z-50 w-10 h-10 bg-white hover:bg-neutral-100 rounded-full flex items-center justify-center transition-colors shadow-lg"
        aria-label="닫기"
      >
        <X className="w-5 h-5 text-neutral-700" />
      </button>

      {/* Desktop: 3 columns Grid */}
      <div className="hidden md:grid md:grid-cols-3 gap-5 max-w-7xl w-full animate-in fade-in zoom-in duration-300 my-auto px-4">
        <div className="h-[520px]">{popupCards[0]}</div>
        <div className="h-[520px]">{popupCards[1]}</div>
        <div className="h-[520px]">{popupCards[2]}</div>
      </div>

      {/* Mobile: Slider */}
      <div className="md:hidden w-full max-w-sm mx-auto my-auto">
        {/* Slide Container */}
        <div className="relative">
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {popupCards.map((card, index) => (
                <div key={index} className="w-full flex-shrink-0 h-[420px]">
                  {card}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
            aria-label="이전"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors"
            aria-label="다음"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-3">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentSlide === index ? "bg-white" : "bg-white/40"
              }`}
              aria-label={`슬라이드 ${index + 1}`}
            />
          ))}
        </div>

        {/* Hide Today Button - Mobile */}
        <button
          onClick={handleHideToday}
          className="w-full mt-3 py-2 text-sm text-white/80 hover:text-white bg-black/40 hover:bg-black/60 rounded-full transition-colors text-center"
        >
          오늘 하루 보지 않기
        </button>
      </div>

      {/* Hide Today Button - Desktop */}
      <button
        onClick={handleHideToday}
        className="hidden md:block fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 text-sm text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-colors backdrop-blur-sm"
      >
        오늘 하루 보지 않기
      </button>
    </div>
  );
}
