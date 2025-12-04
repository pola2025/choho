"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  Image,
  Coffee,
  Settings,
  ChevronLeft,
  LayoutDashboard,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "대시보드", icon: LayoutDashboard },
  { href: "/admin/images", label: "이미지 관리", icon: Image },
  { href: "/admin/menu", label: "카페 메뉴", icon: Coffee },
  { href: "/admin/settings", label: "설정", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // 관리자 페이지에서는 메인 사이트 헤더/푸터 숨기기
  useEffect(() => {
    const header = document.querySelector("body > div > header");
    const footer = document.querySelector("body > div > footer");
    const mainWrapper = document.querySelector("body > div > div.pt-16");

    if (header) (header as HTMLElement).style.display = "none";
    if (footer) (footer as HTMLElement).style.display = "none";
    if (mainWrapper) (mainWrapper as HTMLElement).style.paddingTop = "0";

    return () => {
      if (header) (header as HTMLElement).style.display = "";
      if (footer) (footer as HTMLElement).style.display = "";
      if (mainWrapper) (mainWrapper as HTMLElement).style.paddingTop = "";
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 fixed inset-0 z-[100] overflow-auto">
      {/* 상단 헤더 */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">사이트로 돌아가기</span>
            </Link>
          </div>
          <h1 className="text-lg font-bold text-gray-900">
            초호펜션 관리자
          </h1>
          <div className="w-32" /> {/* 균형을 위한 빈 공간 */}
        </div>
      </header>

      <div className="flex">
        {/* 사이드바 */}
        <aside className="w-56 bg-white border-r border-gray-200 min-h-[calc(100vh-56px)] sticky top-14">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-green-50 text-green-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
