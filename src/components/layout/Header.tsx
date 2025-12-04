"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Menu, X, Calendar } from "lucide-react";
import { NAV_ITEMS, SITE_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 sm:h-24">
          <Link href="/" className="group flex items-center transition-transform hover:scale-105">
            <div className="relative h-14 w-14 sm:h-16 sm:w-16">
              <Image src="/images/logo-main.webp" alt={SITE_CONFIG.name} fill className="object-contain" priority />
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-3">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className="px-5 py-2.5 text-lg font-bold rounded-full text-neutral-700 hover:text-green-700 hover:bg-green-50 transition-colors">{item.label}</Link>
            ))}
            <Button asChild size="lg" className="ml-4 rounded-full px-8 bg-green-600 hover:bg-green-700 shadow-sm text-lg font-bold text-white">
              <a href={SITE_CONFIG.social.naver} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white">
                <Calendar className="w-5 h-5" />
                <span>예약하기</span>
              </a>
            </Button>
          </div>

          <button className="md:hidden p-2 rounded-full text-neutral-700 hover:bg-green-50 hover:text-green-700" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}>
            {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
          </button>
        </div>

        <div className={cn("md:hidden overflow-hidden transition-all duration-300", isMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0")}>
          <div className="flex flex-col gap-2 py-4 px-3 rounded-2xl mb-4 bg-neutral-50">
            {NAV_ITEMS.map((item) => (
              <Link key={item.href} href={item.href} className="px-5 py-4 text-lg font-bold rounded-xl text-neutral-700 hover:bg-green-50 hover:text-green-700 transition-colors" onClick={() => setIsMenuOpen(false)}>{item.label}</Link>
            ))}
            <Button asChild className="w-full rounded-xl mt-2 bg-green-600 hover:bg-green-700 text-lg font-bold py-4 h-auto text-white">
              <a href={SITE_CONFIG.social.naver} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 text-white">
                <Calendar className="w-5 h-5" />
                <span>예약하기</span>
              </a>
            </Button>
          </div>
        </div>
      </nav>
    </header>
  );
}
