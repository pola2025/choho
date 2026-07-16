"use client";

import { useState, useEffect } from "react";
import { WeatherBadge } from "./WeatherBadge";

const heroImages = [
  "/images/summer/webp/dsc05705.webp",
  "/images/summer/webp/dsc05685.webp",
  "/images/summer/webp/dsc05689.webp",
  "/images/summer/webp/dsc05704.webp",
  "/images/summer/webp/dsc05683.webp",
];

export function Hero() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      {/* Background Images with Crossfade */}
      {heroImages.map((image, index) => (
        <div
          key={image}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${index === currentIndex ? "opacity-100" : "opacity-0"}`}
          style={{ backgroundImage: `url(${image})` }}
        />
      ))}

      {/* 실시간 날씨 (기상청 실황) */}
      <WeatherBadge />

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
