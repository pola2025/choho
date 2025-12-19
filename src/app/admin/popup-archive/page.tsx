"use client";

import { useState } from "react";
import Image from "next/image";
import { Calendar, Eye, EyeOff, Megaphone, Clock, ExternalLink } from "lucide-react";

// 팝업 아카이브 데이터 타입
interface PopupArchive {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string | null; // null이면 현재 진행중
  status: "active" | "ended" | "scheduled";
  thumbnail: string;
  category: "event" | "notice" | "promotion";
}

// 팝업 아카이브 데이터
const popupArchives: PopupArchive[] = [
  {
    id: "sled-ticket-2025",
    name: "눈썰매장 입장권 할인",
    description: "초호펜션 이용고객 대상 초리골 눈썰매장 입장권 할인판매",
    startDate: "2025-12-19",
    endDate: null,
    status: "active",
    thumbnail: "/images/popup-archive/sled-ticket.png",
    category: "promotion",
  },
  {
    id: "cafe-discount-2025",
    name: "카페 음료 10% 할인",
    description: "눈썰매장 팔찌 지참시 초리골164베이커리 카페 음료&커피 10% 할인",
    startDate: "2025-12-19",
    endDate: null,
    status: "active",
    thumbnail: "/images/popup-archive/cafe-discount.png",
    category: "promotion",
  },
  {
    id: "winter-notice-2025",
    name: "겨울철 이용 안내",
    description: "동파 예방, 테라스 그릴, 조설기 소음, 음료쿠폰 안내",
    startDate: "2025-12-01",
    endDate: null,
    status: "active",
    thumbnail: "/images/popup-archive/winter-notice.png",
    category: "notice",
  },
  {
    id: "ice-wall-2025",
    name: "빙벽 시즌 오픈",
    description: "한파와 함께 초호펜션 빙벽이 아름답게 얼어붙었습니다",
    startDate: "2025-12-10",
    endDate: "2025-12-18",
    status: "ended",
    thumbnail: "/images/journal/ice-wall/ice-wall-2.webp",
    category: "event",
  },
  {
    id: "free-drink-coupon-2025",
    name: "음료 무료쿠폰 안내",
    description: "초리골164 베이커리 카페 음료 무료쿠폰 제공 안내",
    startDate: "2025-11-20",
    endDate: "2025-12-10",
    status: "ended",
    thumbnail: "/images/popup-archive/drink-coupon.png",
    category: "promotion",
  },
];

const categoryLabels = {
  event: { label: "이벤트", color: "bg-blue-100 text-blue-700" },
  notice: { label: "안내", color: "bg-amber-100 text-amber-700" },
  promotion: { label: "프로모션", color: "bg-green-100 text-green-700" },
};

const statusLabels = {
  active: { label: "진행중", color: "bg-green-500", icon: Eye },
  ended: { label: "종료", color: "bg-gray-400", icon: EyeOff },
  scheduled: { label: "예정", color: "bg-blue-500", icon: Clock },
};

export default function PopupArchivePage() {
  const [filter, setFilter] = useState<"all" | "active" | "ended">("all");

  const filteredPopups = popupArchives.filter((popup) => {
    if (filter === "all") return true;
    return popup.status === filter;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
  };

  return (
    <div className="max-w-6xl">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">팝업 아카이브</h1>
            <p className="text-sm text-gray-500">
              사이트에 표시된 팝업 히스토리를 관리합니다
            </p>
          </div>
        </div>
      </div>

      {/* 필터 탭 */}
      <div className="flex gap-2 mb-6">
        {[
          { value: "all", label: "전체" },
          { value: "active", label: "진행중" },
          { value: "ended", label: "종료" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value as typeof filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.value
                ? "bg-green-600 text-white"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-70">
              ({popupArchives.filter((p) => tab.value === "all" || p.status === tab.value).length})
            </span>
          </button>
        ))}
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {popupArchives.filter((p) => p.status === "active").length}
              </p>
              <p className="text-sm text-gray-500">현재 진행중</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <EyeOff className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {popupArchives.filter((p) => p.status === "ended").length}
              </p>
              <p className="text-sm text-gray-500">종료된 팝업</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {popupArchives.length}
              </p>
              <p className="text-sm text-gray-500">전체 팝업</p>
            </div>
          </div>
        </div>
      </div>

      {/* 팝업 목록 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <h2 className="font-semibold text-gray-900">팝업 히스토리</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {filteredPopups.map((popup) => {
            const StatusIcon = statusLabels[popup.status].icon;
            return (
              <div
                key={popup.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex gap-4">
                  {/* 썸네일 */}
                  <div className="w-32 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                    <Image
                      src={popup.thumbnail}
                      alt={popup.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/placeholder.png";
                      }}
                    />
                  </div>

                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              categoryLabels[popup.category].color
                            }`}
                          >
                            {categoryLabels[popup.category].label}
                          </span>
                          <div className="flex items-center gap-1">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                statusLabels[popup.status].color
                              }`}
                            />
                            <span className="text-xs text-gray-500">
                              {statusLabels[popup.status].label}
                            </span>
                          </div>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {popup.name}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-1">
                          {popup.description}
                        </p>
                      </div>
                    </div>

                    {/* 기간 */}
                    <div className="flex items-center gap-2 mt-3 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        {formatDate(popup.startDate)}
                        {" ~ "}
                        {popup.endDate ? formatDate(popup.endDate) : "진행중"}
                      </span>
                      {popup.status === "active" && (
                        <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                          D+{Math.floor((Date.now() - new Date(popup.startDate).getTime()) / (1000 * 60 * 60 * 24))}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 안내 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <ExternalLink className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">팝업 관리 안내</h3>
            <p className="text-sm text-blue-700">
              팝업 추가/수정은 <code className="px-1.5 py-0.5 bg-blue-100 rounded text-xs">src/components/CombinedWinterPopup.tsx</code> 파일에서 직접 수정하거나,
              개발자에게 요청해주세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
