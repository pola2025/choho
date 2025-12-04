"use client";

import { Coffee, ExternalLink } from "lucide-react";

export default function MenuPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">카페 메뉴 관리</h1>
        <p className="text-gray-600 mt-1">
          초리골164 카페의 메뉴를 관리합니다
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <Coffee className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-gray-900 mb-2">
          기존 메뉴 관리자 사용
        </h2>
        <p className="text-gray-600 mb-6">
          카페 메뉴는 기존 HTML 기반 메뉴 관리자를 사용해주세요
        </p>
        <a
          href="/admin/menu-manager.html"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors"
        >
          메뉴 관리자 열기
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
