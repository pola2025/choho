"use client";

import { useState, useEffect } from "react";
import { X, AlertTriangle, Phone } from "lucide-react";

export function WinterNoticePopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hideUntil = localStorage.getItem("winterNoticePopupHideUntil");
    if (hideUntil) {
      const hideDate = new Date(hideUntil);
      if (new Date() < hideDate) {
        return;
      }
    }
    // Show after ice wall popup (delay 1.5s)
    const timer = setTimeout(() => setIsOpen(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleHideToday = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    localStorage.setItem("winterNoticePopupHideUntil", tomorrow.toISOString());
    setIsOpen(false);
  };

  const handleCall = () => {
    window.location.href = "tel:010-7932-0029";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Background Image with dark overlay */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: "url('/images/rooms/forest/main.webp')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 bg-neutral-100 hover:bg-neutral-200 rounded-full flex items-center justify-center transition-colors"
          aria-label="닫기"
        >
          <X className="w-5 h-5 text-neutral-600" />
        </button>

        {/* Content */}
        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                겨울철 이용 안내
              </h2>
              <p className="text-xs text-muted-foreground">
                이용에 참고 부탁드립니다
              </p>
            </div>
          </div>

          {/* Notice Items */}
          <div className="space-y-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">
                    동파 예방을 위한 물소리 발생
                  </h3>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    겨울철 수도배관 동파 방지를 위해 물소리가 객실에서 들릴 수 있습니다.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                <div>
                  <h3 className="font-semibold text-amber-900 mb-1">
                    영하권 한파에 테라스 그릴사용 불가
                  </h3>
                  <p className="text-sm text-amber-700 leading-relaxed">
                    버너그릴은 한파에 착화가 안 됩니다.
                    <br />
                    한파에는 별도 안내 드리고 있습니다.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Button */}
          <button
            onClick={handleCall}
            className="w-full py-3 bg-primary text-white font-medium rounded-xl text-center hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4" />
            객실관리자 문의하기
          </button>
          <p className="text-center text-xs text-muted-foreground mt-2">
            010-7932-0029
          </p>

          {/* Hide Today Button */}
          <button
            onClick={handleHideToday}
            className="w-full py-2.5 mt-3 text-xs text-muted-foreground hover:text-neutral-600 transition-colors"
          >
            오늘 하루 보지 않기
          </button>
        </div>
      </div>
    </div>
  );
}
