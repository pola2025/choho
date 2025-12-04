import { Metadata } from "next";
import Link from "next/link";
import { Users, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { rooms } from "@/lib/data";

export const metadata: Metadata = {
  title: "객실 안내 | 초호펜션",
  description: "초호펜션의 객실을 소개합니다. 호수뷰 객실, Forest, Forest Mini 등 자연과 함께하는 편안한 휴식 공간을 만나보세요.",
};

export default function RoomsPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center bg-neutral-900">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: "url('/images/hero/04a35b7640f54.webp')" }}
        />
        <div className="relative z-10 text-center text-white px-4">
          <p className="text-sm tracking-widest mb-2 opacity-80">SINCE 1947</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">객실 안내</h1>
          <p className="text-sm sm:text-base opacity-80">
            자연과 함께하는 편안한 휴식 공간
          </p>
        </div>
      </section>

      {/* Room List */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid gap-8 md:gap-12">
            {rooms.map((room, index) => (
              <Card
                key={room.id}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div
                  className={`grid md:grid-cols-2 ${
                    index % 2 === 1 ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Image */}
                  <div
                    className={`relative aspect-[4/3] md:aspect-auto bg-neutral-200 ${
                      index % 2 === 1 ? "md:order-2" : ""
                    }`}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{
                        backgroundImage: `url('${room.thumbnail}')`,
                        backgroundColor: "#d1d5db",
                      }}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-sm font-medium rounded-full">
                        {room.type === "bed" ? "침대" : "온돌"}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <CardContent
                    className={`p-6 sm:p-8 flex flex-col justify-center ${
                      index % 2 === 1 ? "md:order-1" : ""
                    }`}
                  >
                    <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 mb-3">
                      {room.name}
                    </h2>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {room.description}
                    </p>

                    {/* Info */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>
                          기준 {room.capacity.standard}인 / 최대{" "}
                          {room.capacity.maximum}인
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Maximize className="w-4 h-4" />
                        <span>{room.area}평</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Button asChild variant="outline">
                        <Link href={`/rooms/${room.slug}`}>상세보기</Link>
                      </Button>
                      <Button asChild>
                        <a
                          href={room.naverBookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          예약하기
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
