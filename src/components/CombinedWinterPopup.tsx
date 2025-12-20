"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Snowflake, AlertTriangle, Phone, Coffee, Ticket, ChevronLeft, ChevronRight, Clock, Flame } from "lucide-react";

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
    setCurrentSlide((prev) => (prev + 1) % 4);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 4) % 4);
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
    <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden h-full mt-6 md:mt-7">
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
    <div className="relative bg-gradient-to-b from-sky-400 via-sky-500 to-blue-700 rounded-xl sm:rounded-2xl shadow-2xl overflow-visible h-full mt-6 md:mt-7">
      {/* 눈 내리는 효과 */}
      <div className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute w-2 h-2 bg-white rounded-full opacity-80 animate-[fall_3s_linear_infinite]" style={{left: '10%', animationDelay: '0s'}} />
        <div className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-60 animate-[fall_4s_linear_infinite]" style={{left: '25%', animationDelay: '1s'}} />
        <div className="absolute w-2 h-2 bg-white rounded-full opacity-70 animate-[fall_3.5s_linear_infinite]" style={{left: '40%', animationDelay: '0.5s'}} />
        <div className="absolute w-1 h-1 bg-white rounded-full opacity-80 animate-[fall_4.5s_linear_infinite]" style={{left: '55%', animationDelay: '2s'}} />
        <div className="absolute w-2 h-2 bg-white rounded-full opacity-60 animate-[fall_3s_linear_infinite]" style={{left: '70%', animationDelay: '1.5s'}} />
        <div className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-70 animate-[fall_4s_linear_infinite]" style={{left: '85%', animationDelay: '0.8s'}} />
        <div className="absolute w-1 h-1 bg-white rounded-full opacity-90 animate-[fall_3.2s_linear_infinite]" style={{left: '15%', animationDelay: '2.5s'}} />
        <div className="absolute w-2 h-2 bg-white rounded-full opacity-50 animate-[fall_5s_linear_infinite]" style={{left: '60%', animationDelay: '0.3s'}} />
      </div>
      {/* 산/눈썰매장 배경 */}
      <div className="absolute bottom-0 left-0 right-0 h-24 rounded-b-xl sm:rounded-b-2xl overflow-hidden">
        <div className="absolute bottom-0 left-0 w-0 h-0 border-l-[100px] border-r-[100px] border-b-[80px] border-l-transparent border-r-transparent border-b-white/30" style={{left: '-20px'}} />
        <div className="absolute bottom-0 w-0 h-0 border-l-[80px] border-r-[80px] border-b-[60px] border-l-transparent border-r-transparent border-b-white/20" style={{left: '60px'}} />
        <div className="absolute bottom-0 right-0 w-0 h-0 border-l-[120px] border-r-[120px] border-b-[90px] border-l-transparent border-r-transparent border-b-white/30" style={{right: '-40px'}} />
      </div>
      {/* 상단 중앙 아이콘 - 박스 바깥 */}
      <div className="absolute -top-6 md:-top-7 left-1/2 -translate-x-1/2 z-20">
        <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-sky-500">
          <span className="text-2xl md:text-3xl">🛷</span>
        </div>
      </div>
      <div className="relative z-10 p-4 md:p-6 pt-8 md:pt-10 h-full flex flex-col justify-between">
        <div>
          <div className="text-center mb-3 md:mb-4">
            <span className="inline-block px-2.5 py-0.5 md:px-3 md:py-1 bg-yellow-400 text-yellow-900 text-xs md:text-sm font-bold rounded-full mb-1">
              ❄️ 겨울 할인
            </span>
            <h2 className="text-lg md:text-2xl font-bold text-white leading-tight drop-shadow-lg">
              눈썰매장 입장권 할인
            </h2>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 md:p-5 mb-3 md:mb-4 shadow-lg">
            <p className="text-blue-700 font-bold text-base md:text-lg mb-2 text-center">
              🎿 초호펜션 이용고객
            </p>
            <p className="text-neutral-700 text-sm md:text-base leading-relaxed text-center font-medium">
              초리골 눈썰매장 입장권을<br/>
              <span className="text-blue-600 font-bold text-lg">할인된 가격</span>으로<br/>
              구매할 수 있습니다!
            </p>
          </div>
        </div>
        <div className="space-y-2 md:space-y-3">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2.5 md:p-3 text-center shadow">
            <p className="text-neutral-700 text-xs md:text-sm font-medium">
              ⛷️ 관리자 연락 또는 펜션 예약시<br/>신청바랍니다
            </p>
          </div>
          <button
            onClick={handleCall}
            className="w-full py-3 md:py-4 bg-white text-blue-600 font-bold rounded-xl text-center hover:bg-white/90 transition-colors flex items-center justify-center gap-2 text-sm md:text-base shadow-lg"
          >
            <Phone className="w-4 h-4 md:w-5 md:h-5" />
            지금 신청하기
          </button>
        </div>
      </div>
    </div>
  );

  const LateCheckinCard = () => (
    <div className="relative bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl sm:rounded-2xl shadow-2xl overflow-visible h-full mt-6 md:mt-7">
      {/* 배경 패턴 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.4' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      {/* 상단 중앙 아이콘 - 박스 바깥 */}
      <div className="absolute -top-6 md:-top-7 left-1/2 -translate-x-1/2 z-20">
        <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-full flex items-center justify-center shadow-lg animate-pulse border-4 border-emerald-500">
          <Clock className="w-6 h-6 md:w-7 md:h-7 text-emerald-600" />
        </div>
      </div>
      <div className="relative z-10 p-4 md:p-6 pt-8 md:pt-10 h-full flex flex-col justify-between">
        <div>
          <div className="text-center mb-3 md:mb-4">
            <span className="inline-block px-2.5 py-0.5 md:px-3 md:py-1 bg-red-500 text-white text-xs md:text-sm font-bold rounded-full mb-1">
              📢 필독
            </span>
            <h2 className="text-lg md:text-2xl font-bold text-white leading-tight">
              입실시간 안내
            </h2>
          </div>

          {/* 시간 강조 박스 */}
          <div className="bg-white rounded-xl p-4 md:p-5 mb-3 md:mb-4 text-center shadow-lg">
            <p className="text-emerald-600 text-sm md:text-base font-medium mb-1">저녁</p>
            <p className="text-5xl md:text-6xl font-black text-red-500 tracking-tight">
              18:00
            </p>
            <p className="text-neutral-600 text-sm md:text-base font-medium mt-1">이후 입실 시</p>
          </div>

          {/* 경고 박스 */}
          <div className="bg-white rounded-xl p-3 md:p-4 mb-3 md:mb-4 shadow-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-red-500" />
              <p className="text-red-600 font-bold text-lg md:text-xl">
                관리자 사전 연락 필수!
              </p>
            </div>
            <p className="text-neutral-700 text-sm md:text-base text-center font-medium leading-relaxed">
              저녁 6시 이후 입실 예정이신<br/>
              고객님께서는 반드시 사전에<br/>
              미리 연락바랍니다.
            </p>
          </div>
        </div>

        <button
          onClick={handleCall}
          className="w-full py-3 md:py-4 bg-white text-emerald-600 font-bold rounded-xl text-center hover:bg-white/90 transition-colors flex items-center justify-center gap-2 text-sm md:text-base shadow-lg"
        >
          <Phone className="w-4 h-4 md:w-5 md:h-5" />
          010-7932-0029
        </button>
      </div>
    </div>
  );

  const CafeDiscountCard = () => (
    <div className="relative bg-gradient-to-b from-sky-400 via-cyan-500 to-blue-600 rounded-xl sm:rounded-2xl shadow-2xl overflow-visible h-full mt-6 md:mt-7">
      {/* 눈 내리는 효과 */}
      <div className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute w-2 h-2 bg-white rounded-full opacity-80 animate-[fall_3s_linear_infinite]" style={{left: '15%', animationDelay: '0.2s'}} />
        <div className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-60 animate-[fall_4s_linear_infinite]" style={{left: '30%', animationDelay: '1.2s'}} />
        <div className="absolute w-2 h-2 bg-white rounded-full opacity-70 animate-[fall_3.5s_linear_infinite]" style={{left: '50%', animationDelay: '0.7s'}} />
        <div className="absolute w-1 h-1 bg-white rounded-full opacity-80 animate-[fall_4.5s_linear_infinite]" style={{left: '65%', animationDelay: '2.2s'}} />
        <div className="absolute w-2 h-2 bg-white rounded-full opacity-60 animate-[fall_3s_linear_infinite]" style={{left: '80%', animationDelay: '1.8s'}} />
        <div className="absolute w-1.5 h-1.5 bg-white rounded-full opacity-70 animate-[fall_4s_linear_infinite]" style={{left: '5%', animationDelay: '1s'}} />
      </div>
      {/* 상단 중앙 아이콘 - 박스 바깥 */}
      <div className="absolute -top-6 md:-top-7 left-1/2 -translate-x-1/2 z-20">
        <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-cyan-500">
          <span className="text-2xl md:text-3xl">☕</span>
        </div>
      </div>
      <div className="relative z-10 p-4 md:p-6 pt-8 md:pt-10 h-full flex flex-col justify-between">
        <div>
          <div className="text-center mb-3 md:mb-4">
            <span className="inline-block px-2.5 py-0.5 md:px-3 md:py-1 bg-yellow-400 text-yellow-900 text-xs md:text-sm font-bold rounded-full mb-1">
              ❄️ 카페 할인
            </span>
            <h2 className="text-lg md:text-2xl font-bold text-white leading-tight drop-shadow-lg">
              음료 & 커피 10% 할인
            </h2>
          </div>
          {/* 팔찌 디자인 */}
          <div className="bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400 rounded-full p-1 mb-3 md:mb-4 shadow-lg">
            <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 rounded-full py-3 md:py-4 px-4 md:px-6 text-center border-2 border-dashed border-white/50">
              <p className="text-white font-bold text-sm md:text-base drop-shadow">
                🎿 눈썰매장 입장 팔찌
              </p>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 md:p-5 border border-white/30 text-center">
            <p className="text-white font-medium text-base md:text-lg mb-1">
              팔찌 지참시
            </p>
            <p className="text-yellow-300 font-black text-3xl md:text-4xl drop-shadow-lg">
              10% 할인!
            </p>
            <p className="text-white/90 text-xs md:text-sm mt-2">
              초리골164 베이커리 카페
            </p>
          </div>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 md:p-4 text-center border border-white/20">
          <p className="text-white text-sm md:text-base font-medium">
            ☕ 팔찌를 보여주세요!
          </p>
        </div>
      </div>
    </div>
  );

  // 바베큐 배너 컴포넌트
  const BBQBanner = () => (
    <div className="relative w-full bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden">
      {/* 불꽃 파티클 효과 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-3 h-3 bg-yellow-400 rounded-full opacity-80 animate-[fireFloat_2s_ease-in-out_infinite]" style={{left: '5%', bottom: '20%'}} />
        <div className="absolute w-2 h-2 bg-orange-300 rounded-full opacity-70 animate-[fireFloat_2.5s_ease-in-out_infinite]" style={{left: '20%', bottom: '40%', animationDelay: '0.3s'}} />
        <div className="absolute w-2.5 h-2.5 bg-yellow-300 rounded-full opacity-60 animate-[fireFloat_1.8s_ease-in-out_infinite]" style={{left: '40%', bottom: '25%', animationDelay: '0.7s'}} />
        <div className="absolute w-2 h-2 bg-red-400 rounded-full opacity-80 animate-[fireFloat_2.2s_ease-in-out_infinite]" style={{left: '60%', bottom: '35%', animationDelay: '0.5s'}} />
        <div className="absolute w-3 h-3 bg-yellow-400 rounded-full opacity-70 animate-[fireFloat_2s_ease-in-out_infinite]" style={{left: '80%', bottom: '20%', animationDelay: '1s'}} />
        <div className="absolute w-2 h-2 bg-orange-400 rounded-full opacity-80 animate-[fireFloat_2.3s_ease-in-out_infinite]" style={{left: '95%', bottom: '30%', animationDelay: '0.8s'}} />
      </div>

      <div className="relative z-10 px-3 py-3 md:px-5 md:py-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Flame className="w-5 h-5 md:w-6 md:h-6 text-yellow-300 animate-[flicker_0.5s_ease-in-out_infinite]" />
              <Flame className="absolute top-0 left-0 w-5 h-5 md:w-6 md:h-6 text-orange-400 opacity-50 animate-[flicker_0.3s_ease-in-out_infinite_0.1s]" />
            </div>
            <h3 className="text-white font-bold text-sm md:text-base">바베큐 시설 안내</h3>
            <span className="text-yellow-300 text-[10px] md:text-xs bg-black/20 px-2 py-0.5 rounded-full">숯불 현장결제</span>
          </div>
          <a
            href="tel:010-7932-0029"
            className="flex items-center gap-1.5 bg-white text-red-600 font-bold px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-white/90 transition-colors text-xs md:text-sm"
          >
            <Phone className="w-3.5 h-3.5" />
            문의하기
          </a>
        </div>

        {/* 3가지 바베큐 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
          {/* 가스버너 & 캠핑그릴 카드 */}
          <div className="bg-white rounded-lg overflow-hidden shadow-lg">
            {/* PC 이미지 */}
            <div className="hidden md:block relative h-44">
              <Image
                src="/images/bbq/burner/burner-1.webp"
                alt="가스버너 & 캠핑그릴"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-3 md:p-4">
              <div className="flex items-start gap-2">
                <span className="text-2xl md:hidden">🔥</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-neutral-900 text-sm md:text-base">가스버너 & 캠핑그릴</h4>
                    <span className="text-orange-600 font-bold text-sm md:text-base">2만원</span>
                  </div>
                  <p className="text-neutral-600 text-xs md:text-sm">Forest 객실 테라스 전용</p>
                  <p className="text-amber-600 text-[10px] md:text-xs mt-1">※ 영하권 착화불가 → 관리자 연락</p>
                </div>
              </div>
            </div>
          </div>

          {/* 숯불바베큐 카드 */}
          <div className="bg-white rounded-lg overflow-hidden shadow-lg">
            {/* PC 이미지 */}
            <div className="hidden md:block relative h-44">
              <Image
                src="/images/bbq/forest/forest-1.webp"
                alt="숯불바베큐"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-3 md:p-4">
              <div className="flex items-start gap-2">
                <span className="text-2xl md:hidden">🍖</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-neutral-900 text-sm md:text-base">숯불바베큐 5동</h4>
                    <span className="text-red-600 font-bold text-sm md:text-base">3만원</span>
                  </div>
                  <p className="text-neutral-600 text-xs md:text-sm">Forest Room 지정 바베큐장</p>
                  <p className="text-red-500 text-[10px] md:text-xs mt-1">※ 객실 9개 중 5동 한정 → 조기마감</p>
                </div>
              </div>
            </div>
          </div>

          {/* 호수뷰 객실 카드 */}
          <div className="bg-white rounded-lg overflow-hidden shadow-lg">
            {/* PC 이미지 */}
            <div className="hidden md:block relative h-44">
              <Image
                src="/images/bbq/lakeview/lakeview-2.webp"
                alt="호수뷰 바베큐"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-3 md:p-4">
              <div className="flex items-start gap-2">
                <span className="text-2xl md:hidden">🌊</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-neutral-900 text-sm md:text-base">호수뷰 객실</h4>
                    <span className="text-blue-600 font-bold text-sm md:text-base">3만원</span>
                  </div>
                  <p className="text-neutral-600 text-xs md:text-sm">객실 앞 테라스 숯불바베큐</p>
                  <p className="text-blue-500 text-[10px] md:text-xs mt-1">※ 가스버너 희망시 관리자 연락</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS 애니메이션 정의 */}
      <style jsx>{`
        @keyframes fireFloat {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.8;
          }
          50% {
            transform: translateY(-15px) scale(1.2);
            opacity: 0.3;
          }
        }
        @keyframes flicker {
          0%, 100% {
            transform: scale(1) rotate(-3deg);
            opacity: 1;
          }
          25% {
            transform: scale(1.1) rotate(2deg);
            opacity: 0.9;
          }
          50% {
            transform: scale(0.95) rotate(-2deg);
            opacity: 1;
          }
          75% {
            transform: scale(1.05) rotate(3deg);
            opacity: 0.85;
          }
        }
      `}</style>
    </div>
  );

  const popupCards = [
    <LateCheckinCard key="late-checkin" />,
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

      {/* Desktop: 4 columns Grid + BBQ Banner */}
      <div className="hidden md:flex md:flex-col gap-6 max-w-7xl w-full animate-in fade-in zoom-in duration-300 my-auto px-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="h-[520px]">{popupCards[0]}</div>
          <div className="h-[520px]">{popupCards[1]}</div>
          <div className="h-[520px]">{popupCards[2]}</div>
          <div className="h-[520px]">{popupCards[3]}</div>
        </div>
        {/* BBQ 배너 */}
        <div className="mt-12">
          <BBQBanner />
        </div>
      </div>

      {/* Mobile: Slider */}
      <div className="md:hidden w-full max-w-sm mx-auto my-4 py-6 overflow-x-hidden overflow-y-visible">
        {/* Slide Container */}
        <div className="relative pt-8">
          <div className="overflow-visible">
            <div
              className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {popupCards.map((card, index) => (
                <div key={index} className="w-full flex-shrink-0 h-[480px]">
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
          {[0, 1, 2, 3].map((index) => (
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

        {/* BBQ 배너 - Mobile */}
        <div className="mt-4">
          <BBQBanner />
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
        className="hidden md:block fixed bottom-3 left-1/2 -translate-x-1/2 px-6 py-2 text-sm text-white/70 hover:text-white bg-black/30 hover:bg-black/50 rounded-full transition-colors backdrop-blur-sm"
      >
        오늘 하루 보지 않기
      </button>
    </div>
  );
}
