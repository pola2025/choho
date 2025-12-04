"use client";

import Link from "next/link";

interface ComingSoonProps {
  title?: string;
  message?: string;
}

export default function ComingSoon({
  title = "페이지 준비중",
  message = "더 나은 서비스로 찾아뵙겠습니다.",
}: ComingSoonProps) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-neutral-50 to-white">
      <div className="text-center px-4 py-16 max-w-lg">
        {/* 아이콘 */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* 텍스트 */}
        <h1 className="text-3xl font-bold text-neutral-800 mb-4">{title}</h1>
        <p className="text-lg text-neutral-600 mb-2">{message}</p>
        <p className="text-neutral-500 mb-8">
          빠른 시일 내에 준비하여 선보이겠습니다.
        </p>

        {/* 버튼 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-green-700 text-white font-medium rounded-lg hover:bg-green-800 transition-colors"
          >
            홈으로 돌아가기
          </Link>
          <a
            href="tel:033-461-7225"
            className="inline-flex items-center justify-center px-6 py-3 border border-green-700 text-green-700 font-medium rounded-lg hover:bg-green-50 transition-colors"
          >
            전화 문의하기
          </a>
        </div>

        {/* 추가 안내 */}
        <div className="mt-12 p-4 bg-neutral-100 rounded-lg">
          <p className="text-sm text-neutral-600">
            <span className="font-medium">초호펜션</span> | 강원도 인제군 북면 원통로 164
          </p>
          <p className="text-sm text-neutral-500 mt-1">
            문의: 033-461-7225
          </p>
        </div>
      </div>
    </div>
  );
}
