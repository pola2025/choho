"use client";

import { Settings, Info, Phone, MapPin, Clock, ExternalLink } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">설정</h1>
        <p className="text-gray-600 mt-1">
          사이트 정보 및 설정을 확인합니다
        </p>
      </div>

      {/* 사이트 정보 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Info className="w-5 h-5" />
          사이트 정보
        </h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">연락처</p>
              <p className="text-gray-600">031-584-8377</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">주소</p>
              <p className="text-gray-600">경기도 파주시 법원읍 초리골길 134</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <p className="font-medium text-gray-900">운영 시간</p>
              <p className="text-gray-600">체크인: 15:00 - 22:00</p>
              <p className="text-gray-600">체크아웃: 11:00</p>
            </div>
          </div>
        </div>
      </div>

      {/* 데이터 파일 안내 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          데이터 파일 위치
        </h2>
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900">객실 정보</p>
            <code className="text-sm text-blue-600">src/lib/data.ts</code>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900">갤러리 이미지</p>
            <code className="text-sm text-blue-600">src/components/sections/Gallery.tsx</code>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900">카페 정보</p>
            <code className="text-sm text-blue-600">src/app/cafe/page.tsx</code>
          </div>
        </div>
      </div>

      {/* 외부 링크 */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">외부 링크</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <a
            href="https://booking.naver.com/booking/3/bizes/608360"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <span className="font-medium text-green-800">네이버 예약</span>
            <ExternalLink className="w-4 h-4 text-green-600" />
          </a>
          <a
            href="https://www.instagram.com/choho_pension"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-pink-50 rounded-lg hover:bg-pink-100 transition-colors"
          >
            <span className="font-medium text-pink-800">인스타그램</span>
            <ExternalLink className="w-4 h-4 text-pink-600" />
          </a>
          <a
            href="https://map.naver.com/p/entry/place/1149332657"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <span className="font-medium text-blue-800">네이버 지도</span>
            <ExternalLink className="w-4 h-4 text-blue-600" />
          </a>
        </div>
      </div>
    </div>
  );
}
