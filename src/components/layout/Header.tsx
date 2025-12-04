"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Menu, X, Calendar } from "lucide-react";
import { NAV_ITEMS, SITE_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-white/95 backdrop-blur-xl border-b border-primary/10 shadow-lg shadow-primary/5"
          : "bg-gradient-to-b from-black/50 to-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2 transition-transform hover:scale-105"
          >
            <div className="relative h-10 w-10 sm:h-12 sm:w-12">
              {/* White logo for transparent header */}
              <Image
                src="/images/logo-white.webp"
                alt={SITE_CONFIG.name}
                fill
                className={cn(
                  "object-contain transition-opacity duration-300",
                  isScrolled ? "opacity-0" : "opacity-100"
                )}
                priority
              />
              {/* Main logo for scrolled header */}
              <Image
                src="/images/logo-main.webp"
                alt={SITE_CONFIG.name}
                fill
                className={cn(
                  "object-contain transition-opacity duration-300",
                  isScrolled ? "opacity-100" : "opacity-0"
                )}
                priority
              />
            </div>
            <span
              className={cn(
                "text-sm font-medium hidden sm:inline transition-colors duration-300",
                isScrolled ? "text-muted-foreground" : "text-white/80"
              )}
            >
              {SITE_CONFIG.name}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-colors duration-300 rounded-full",
                  isScrolled
                    ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                )}
              >
                {item.label}
              </Link>
            ))}
            <Button
              asChild
              size="sm"
              className={cn(
                "ml-4 rounded-full px-5 transition-all duration-300",
                isScrolled
                  ? "bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md"
                  : "bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30"
              )}
            >
              <a
                href={SITE_CONFIG.social.naver}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>예약하기</span>
              </a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className={cn(
              "md:hidden p-2 rounded-full transition-colors",
              isScrolled
                ? "text-foreground hover:bg-muted"
                : "text-white hover:bg-white/10"
            )}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            isMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
          )}
        >
          <div
            className={cn(
              "flex flex-col gap-1 py-4 px-2 rounded-2xl mb-4",
              isScrolled ? "bg-muted/50" : "bg-black/20 backdrop-blur-md"
            )}
          >
            {NAV_ITEMS.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300",
                  "animate-fade-in-up opacity-0",
                  isScrolled
                    ? "text-foreground hover:bg-white"
                    : "text-white hover:bg-white/10"
                )}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: "forwards",
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div
              className="animate-fade-in-up opacity-0 pt-2"
              style={{ animationDelay: "250ms", animationFillMode: "forwards" }}
            >
              <Button
                asChild
                className={cn(
                  "w-full rounded-xl",
                  isScrolled
                    ? "bg-primary hover:bg-primary/90"
                    : "bg-white text-neutral-900 hover:bg-white/90"
                )}
              >
                <a
                  href={SITE_CONFIG.social.naver}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>예약하기</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
