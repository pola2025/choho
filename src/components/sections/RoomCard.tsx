"use client";

import Link from "next/link";
import { Users, Maximize, ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Room } from "@/types";

interface RoomCardProps {
  room: Room;
}

export function RoomCard({ room }: RoomCardProps) {
  return (
    <div className="group card-premium overflow-hidden">
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
          style={{
            backgroundImage: `url('${room.thumbnail}')`,
            backgroundColor: "#e5e7eb",
          }}
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Room Type Badge */}
        <div className="absolute top-4 right-4">
          <span
            className={`px-3 py-1.5 text-xs font-semibold rounded-full backdrop-blur-md shadow-lg transition-all duration-300 ${
              room.type === "bed"
                ? "bg-blue-500/90 text-white"
                : "bg-amber-500/90 text-white"
            }`}
          >
            {room.type === "bed" ? "침대" : "온돌"}
          </span>
        </div>

        {/* Quick View Button on Hover */}
        <div className="absolute bottom-4 left-4 right-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <Link
            href={`/rooms/${room.slug}`}
            className="inline-flex items-center gap-2 text-white text-sm font-medium hover:underline"
          >
            <span>자세히 보기</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6">
        {/* Title */}
        <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-2 group-hover:text-primary transition-colors">
          {room.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
          {room.description}
        </p>

        {/* Room Info */}
        <div className="flex flex-wrap items-center gap-3 text-sm mb-5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-full">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              기준 {room.capacity.standard}인 / 최대 {room.capacity.maximum}인
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-full">
            <Maximize className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{room.area}평</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            asChild
            variant="outline"
            className="flex-1 rounded-full hover:bg-muted transition-colors"
          >
            <Link href={`/rooms/${room.slug}`}>상세보기</Link>
          </Button>
          <Button
            asChild
            className="flex-1 rounded-full bg-primary hover:bg-primary/90 shadow-sm hover:shadow-md transition-all group/btn"
          >
            <a
              href={room.naverBookingUrl}
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
  );
}
