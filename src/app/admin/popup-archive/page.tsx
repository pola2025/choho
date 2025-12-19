"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Calendar, Eye, EyeOff, Megaphone, Clock, Loader2, RefreshCw, Plus } from "lucide-react";

// 팝업 아카이브 데이터 타입
interface PopupArchive {
  id: string;
  name: string;
  description: string;
  category: "event" | "notice" | "promotion";
  status: "active" | "ended" | "scheduled";
  startDate: string;
  endDate: string | null;
  thumbnailUrl: string;
  order: number;
  isActive: boolean;
}

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
  const [popups, setPopups] = useState<PopupArchive[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "ended">("all");

  // 팝업 데이터 로드
  const loadPopups = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/popups");
      if (!response.ok) {
        throw new Error("데이터를 가져오는데 실패했습니다");
      }
      const data = await response.json();
      setPopups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPopups();
  }, []);

  const filteredPopups = popups.filter((popup) => {
    if (filter === "all") return true;
    return popup.status === filter;
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
  };

  const getDaysSinceStart = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
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
        <button
          onClick={loadPopups}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          새로고침
        </button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          {error}
        </div>
      )}

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
              ({popups.filter((p) => tab.value === "all" || p.status === tab.value).length})
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
                {popups.filter((p) => p.status === "active").length}
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
                {popups.filter((p) => p.status === "ended").length}
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
                {popups.length}
              </p>
              <p className="text-sm text-gray-500">전체 팝업</p>
            </div>
          </div>
        </div>
      </div>

      {/* 팝업 목록 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">팝업 히스토리</h2>
          <a
            href="https://airtable.com/appcA2d6nXAIkLydp/tblzLnNjgHFSkO0wT"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            에어테이블에서 추가
          </a>
        </div>

        {filteredPopups.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Megaphone className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>등록된 팝업이 없습니다</p>
            <p className="text-sm mt-1">에어테이블에서 팝업을 추가해주세요</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredPopups.map((popup) => {
              const StatusIcon = statusLabels[popup.status]?.icon || Eye;
              return (
                <div
                  key={popup.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex gap-4">
                    {/* 썸네일 */}
                    <div className="w-24 aspect-[5/7] bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                      {popup.thumbnailUrl ? (
                        <Image
                          src={popup.thumbnailUrl}
                          alt={popup.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Megaphone className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {popup.category && categoryLabels[popup.category] && (
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  categoryLabels[popup.category].color
                                }`}
                              >
                                {categoryLabels[popup.category].label}
                              </span>
                            )}
                            <div className="flex items-center gap-1">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  statusLabels[popup.status]?.color || "bg-gray-400"
                                }`}
                              />
                              <span className="text-xs text-gray-500">
                                {statusLabels[popup.status]?.label || popup.status}
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
                        {popup.status === "active" && popup.startDate && (
                          <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                            D+{getDaysSinceStart(popup.startDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 안내 */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Megaphone className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">팝업 관리 안내</h3>
            <p className="text-sm text-blue-700">
              팝업 추가/수정/삭제는{" "}
              <a
                href="https://airtable.com/appcA2d6nXAIkLydp/tblzLnNjgHFSkO0wT"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                에어테이블
              </a>
              에서 직접 관리하실 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
