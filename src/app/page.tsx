import { Metadata } from "next";
import {
  Hero,
  Welcome,
  RoomList,
  CheckinGuide,
  Facilities,
  JournalPreview,
} from "@/components/sections";
import { ValleyUsagePopup } from "@/components/ValleyUsagePopup";
import { PoolDiscountPopup } from "@/components/PoolDiscountPopup";
import { SpringPopup } from "@/components/SpringPopup";
import { SummerInsectPopup } from "@/components/SummerInsectPopup";
import { SummerInsectIndividualPopup } from "@/components/SummerInsectIndividualPopup";
import { AnimalStrip } from "@/components/WanderingAnimals";
import { FAQJsonLd } from "@/components/JsonLd";

export const metadata: Metadata = {
  title: "초호펜션 | 초리골164 - 파주 힐링 펜션",
  description:
    "서울에서 1시간, 파주 초리골에서 만나는 자연 속 힐링 펜션. 호수뷰, Forest, Forest Mini 객실과 초리골164 카페에서 특별한 휴식을 경험하세요.",
  keywords: [
    "초호펜션",
    "파주펜션",
    "파주숙소",
    "힐링펜션",
    "호수뷰펜션",
    "커플펜션",
    "가족펜션",
    "바베큐펜션",
    "초리골",
    "초리골164",
  ],
  openGraph: {
    title: "초호펜션 | 초리골164 - 파주 힐링 펜션",
    description:
      "서울에서 1시간, 파주 초리골에서 만나는 자연 속 힐링 펜션. 호수뷰 객실과 카페에서 특별한 휴식을 경험하세요.",
    url: "https://www.chorigol.co.kr",
    type: "website",
    images: [
      {
        url: "/images/gallery-1.webp",
        width: 1200,
        height: 630,
        alt: "초호펜션 전경",
      },
    ],
  },
  alternates: {
    canonical: "https://www.chorigol.co.kr",
  },
};

export default function Home() {
  return (
    <>
      <FAQJsonLd />
      <main className="-mt-16">
        <Hero />
        <Welcome />
        <AnimalStrip animals={["black-rabbit", "alpaca"]} />
        <RoomList />
        <AnimalStrip animals={["white-rabbit", "goose"]} />
        <CheckinGuide />
        <AnimalStrip animals={["gray-rabbit", "alpaca", "goose"]} />
        <Facilities />
        <AnimalStrip animals={["black-rabbit", "white-rabbit"]} />
        <JournalPreview />
        {/* 팝업 노출 순서: 계곡 이용안내(58) → 수영장(56) → 날벌레 안내(53) → 여름벌레 체크리스트(52) → 이용안내 와이드(51, SpringPopup=입실/음료/레이트체크아웃/바베큐) (z-index로 제어) */}
        <ValleyUsagePopup />
        <PoolDiscountPopup />
        <SummerInsectIndividualPopup />
        <SummerInsectPopup />
        <SpringPopup />
      </main>
    </>
  );
}
