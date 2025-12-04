import type { Metadata } from "next";
import "./globals.css";
import { Header, Footer } from "@/components/layout";

export const metadata: Metadata = {
  title: "초호펜션 | 초리골164",
  description: "서울에서 1시간, 자연 속 힐링 펜션. 호수뷰, Forest, Forest Mini 객실과 초리골164 카페가 있는 초호펜션입니다.",
  keywords: ["초호펜션", "초리골", "펜션", "가평", "힐링", "호수뷰", "바베큐"],
  openGraph: {
    title: "초호펜션 | 초리골164",
    description: "서울에서 1시간, 자연 속 힐링 펜션",
    url: "https://www.chorigol.co.kr",
    siteName: "초호펜션",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <Header />
        <div className="pt-16">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
