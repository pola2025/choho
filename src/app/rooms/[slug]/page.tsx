import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Users, Maximize, Check, X, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { rooms } from "@/lib/data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return rooms.map((room) => ({ slug: room.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const room = rooms.find((r) => r.slug === slug);
  if (!room) return { title: "객실을 찾을 수 없습니다" };

  return {
    title: `${room.name} | 초호펜션`,
    description: room.description,
  };
}

export default async function RoomDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const room = rooms.find((r) => r.slug === slug);

  if (!room) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] flex items-end bg-neutral-900">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{ backgroundImage: `url('${room.thumbnail}')`, backgroundColor: "#374151" }}
        />
        <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8 pb-8">
          <div className="max-w-6xl mx-auto">
            <Link
              href="/rooms"
              className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm mb-4 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              객실 목록
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full">
                {room.type === "bed" ? "침대" : "온돌"}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">
              {room.name}
            </h1>
            <p className="text-white/80 text-sm sm:text-base max-w-xl">
              {room.description}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Room Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    객실 정보
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-neutral-50 rounded-lg">
                      <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">인원</p>
                      <p className="font-semibold">
                        기준 {room.capacity.standard}인 / 최대 {room.capacity.maximum}인
                      </p>
                    </div>
                    <div className="text-center p-4 bg-neutral-50 rounded-lg">
                      <Maximize className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">면적</p>
                      <p className="font-semibold">{room.area}평</p>
                    </div>
                    <div className="text-center p-4 bg-neutral-50 rounded-lg col-span-2 sm:col-span-1">
                      <Clock className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground">체크인/아웃</p>
                      <p className="font-semibold text-sm">
                        {room.policies.checkIn} / {room.policies.checkOut}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card>
                <CardHeader>
                  <CardTitle>비품 안내</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-green-700 mb-3 flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        제공되는 물품
                      </h4>
                      <ul className="space-y-2">
                        {room.amenities.provided.map((item) => (
                          <li
                            key={item}
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                          >
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-amber-700 mb-3 flex items-center gap-2">
                        <X className="w-4 h-4" />
                        가져오셔야 할 물품
                      </h4>
                      <ul className="space-y-2">
                        {room.amenities.notProvided.map((item) => (
                          <li
                            key={item}
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                          >
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Accordion Info */}
              <Card>
                <CardHeader>
                  <CardTitle>이용 안내</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="extra-person">
                      <AccordionTrigger>추가인원 안내</AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2">
                          {room.policies.extraPerson.map((item, i) => (
                            <li key={i} className="text-sm text-muted-foreground">
                              • {item}
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="refund">
                      <AccordionTrigger>환불 규정</AccordionTrigger>
                      <AccordionContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2 font-medium">취소 시점</th>
                                <th className="text-right py-2 font-medium">환불율</th>
                              </tr>
                            </thead>
                            <tbody>
                              {room.policies.refund.map((item, i) => (
                                <tr key={i} className="border-b last:border-0">
                                  <td className="py-2 text-muted-foreground">{item.days}</td>
                                  <td className="py-2 text-right font-medium">{item.rate}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="notices">
                      <AccordionTrigger>유의사항</AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2">
                          {room.policies.notices.map((item, i) => (
                            <li key={i} className="text-sm text-muted-foreground">
                              • {item}
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Sticky Booking Card */}
            <div className="lg:col-span-1">
              <div className="sticky top-20">
                <Card className="shadow-lg">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2">{room.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      기준 {room.capacity.standard}인 / 최대 {room.capacity.maximum}인
                    </p>
                    <div className="space-y-3">
                      <Button asChild className="w-full" size="lg">
                        <a
                          href={room.naverBookingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          네이버 예약하기
                        </a>
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        실시간 예약 현황 및 가격 확인
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Floating CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t lg:hidden z-40">
        <Button asChild className="w-full" size="lg">
          <a href={room.naverBookingUrl} target="_blank" rel="noopener noreferrer">
            예약하기
          </a>
        </Button>
      </div>
    </main>
  );
}
