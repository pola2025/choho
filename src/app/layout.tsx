import type { Metadata } from "next";
import "./globals.css";
import { Header, Footer } from "@/components/layout";
import {
  OrganizationJsonLd,
  LodgingBusinessJsonLd,
  WebSiteJsonLd,
} from "@/components/JsonLd";

const BASE_URL = "https://www.chorigol.co.kr";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "초호펜션 | 초리골164",
    template: "%s | 초호펜션",
  },
  description:
    "서울에서 1시간, 자연 속 힐링 펜션. 호수뷰, Forest, Forest Mini 객실과 초리골164 카페가 있는 초호펜션입니다.",
  keywords: [
    "초호펜션",
    "초리골",
    "초리골164",
    "펜션",
    "파주펜션",
    "파주숙소",
    "힐링펜션",
    "호수뷰",
    "바베큐",
    "가족여행",
    "커플여행",
  ],
  authors: [{ name: "초호펜션" }],
  creator: "초호펜션",
  publisher: "초호펜션",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "초호펜션 | 초리골164",
    description:
      "서울에서 1시간, 자연 속 힐링 펜션. 호수뷰 객실과 초리골164 카페가 있는 초호펜션입니다.",
    url: BASE_URL,
    siteName: "초호펜션",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/images/og-image.webp",
        width: 1200,
        height: 630,
        alt: "초호펜션 - 파주 초리골의 힐링 펜션",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "초호펜션 | 초리골164",
    description: "서울에서 1시간, 자연 속 힐링 펜션",
    images: ["/images/og-image.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
  verification: {
    other: {
      "naver-site-verification": "84f86e6ecd6a7a63c7262e65236afe34115c947a",
    },
  },
  category: "travel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <OrganizationJsonLd />
        <LodgingBusinessJsonLd />
        <WebSiteJsonLd />
      </head>
      <body className="antialiased">
        <Header />
        <div className="pt-16">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
