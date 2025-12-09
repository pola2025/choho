"use client";

import { useState } from "react";
import { RoomCard } from "./RoomCard";
import { rooms } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Home, Users, Sparkles, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_CONFIG } from "@/lib/constants";

const filters = [
  { id: "all", label: "전체", icon: Sparkles },
  { id: "2", label: "2인", icon: Users },
  { id: "3", label: "3인", icon: Users },
  { id: "4", label: "4인+", icon: Home },
];

export function RoomList() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredRooms = rooms.filter((room) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "4") return room.capacity.maximum >= 4;
    return room.capacity.maximum >= parseInt(activeFilter);
  });

  return (
    <section id="rooms" className="relative py-20 scroll-mt-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-section" />

      {/* Decorative Circle */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          {/* Decorative Element */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
            <Home className="w-4 h-4" />
            <span>Rooms</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
            객실 안내
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
            자연과 함께하는 편안한 휴식 공간,
            <br className="hidden sm:block" />
            당신만의 특별한 시간을 선물합니다
          </p>

          {/* CTA Button */}
          <div className="flex justify-center mt-8">
            <a
                href={SITE_CONFIG.social.naver}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 sm:gap-3 px-5 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg font-bold text-green-800 bg-green-100/80 backdrop-blur-md border border-green-200/50 rounded-full shadow-lg hover:bg-green-200/90 hover:shadow-xl hover:scale-105 transition-all duration-300 whitespace-nowrap"
              >
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 group-hover:rotate-12 transition-transform" />
                <span>실시간 예약 확인</span>
              </a>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex justify-center mb-10 sm:mb-12">
          <div className="inline-flex p-1.5 bg-neutral-100 rounded-full shadow-soft border border-neutral-200">
            {filters.map((filter) => {
              const Icon = filter.icon;
              return (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-full transition-all duration-300",
                    activeFilter === filter.id
                      ? "bg-green-600 text-white shadow-md"
                      : "text-neutral-700 hover:text-green-700 hover:bg-green-50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{filter.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Room Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredRooms.map((room, index) => (
            <div
              key={room.id}
              className="animate-fade-in-up opacity-0"
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: "forwards",
              }}
            >
              <RoomCard room={room} />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredRooms.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground">
              해당 조건에 맞는 객실이 없습니다.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
