"use client";

import Script from "next/script";
import { GA_MEASUREMENT_ID } from "@/lib/constants";

export function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}

// 이벤트 추적 함수
export function trackEvent(eventName: string, eventParams?: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, eventParams);
  }
}

// 전환 이벤트 추적
export function trackConversion(conversionType: "inquiry" | "phone_call" | "reservation") {
  trackEvent(conversionType, {
    event_category: "conversion",
    event_label: conversionType,
  });
}

// Window 타입 확장
declare global {
  interface Window {
    gtag: (
      command: string,
      targetId: string,
      config?: Record<string, unknown>
    ) => void;
    dataLayer: unknown[];
  }
}
