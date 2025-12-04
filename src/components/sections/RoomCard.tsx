"use client";

import Link from "next/link";
import { Users, Maximize, ArrowRight, Calendar, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Room } from "@/types";

interface RoomCardProps {
  room: Room;
}

// Helper to extract warning from extraPerson policies
function getWarning(room: Room): string | null {
  // Prioritize "불가" warnings over "이용 가능"
  const notAllowed = room.policies.extraPerson.find((p) => p.includes("어른만") && p.includes("불가"));
  if (notAllowed) return notAllowed;

  const adultNotAllowed = room.policies.extraPerson.find((p) => p.includes("어른") && p.includes("불가"));
  if (adultNotAllowed) return adultNotAllowed;

  const onlyAllowed = room.policies.extraPerson.find((p) => p.includes("이용 가능"));
  if (onlyAllowed) return onlyAllowed;

  return null;
}

export function RoomCard({ room }: RoomCardProps) {
  const warning = getWarning(room);

  return (
    <div className="group card-premium overflow-hidden bg-white">
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
        <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2 group-hover:text-green-700 transition-colors">
          {room.name}
        </h3>

        {/* Description */}
        <p className="text-sm text-neutral-600 mb-4 line-clamp-2 leading-relaxed">
          {room.description}
        </p>

        {/* Notice - Subtle Design */}
        {warning && (
          <div className="flex items-center gap-1.5 mb-3 text-xs text-neutral-500">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <span>{warning}</span>
          </div>
        )}

        {/* Room Info - Visual Hierarchy */}
        <div className="space-y-2 mb-5">
          {/* Capacity - Primary Info */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
              <Users className="w-4 h-4 text-green-600" />
              <span className="text-sm font-bold text-green-800">
                기준 {room.capacity.standard}인
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 bg-neutral-100 border border-neutral-200 rounded-lg">
              <span className="text-sm font-medium text-neutral-600">
                최대 {room.capacity.maximum}인
              </span>
            </div>
          </div>

          {/* Area - Secondary Info */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-neutral-50 rounded-lg w-fit">
            <Maximize className="w-4 h-4 text-neutral-500" />
            <span className="text-sm text-neutral-600">{room.area}평</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            asChild
            variant="outline"
            className="flex-1 rounded-full hover:bg-neutral-100 border-neutral-300 transition-colors"
          >
            <Link href={`/rooms/${room.slug}`}>상세보기</Link>
          </Button>
          <Button
            asChild
            className="flex-1 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow-md transition-all group/btn"
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
