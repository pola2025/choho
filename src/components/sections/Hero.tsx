"use client";

import { useState, useEffect } from "react";

const heroImages = [
  "/images/spring/webp/dsc01999.webp",
  "/images/spring/webp/dsc02005.webp",
  "/images/spring/webp/dsc02010.webp",
  "/images/spring/webp/dsc02038.webp",
  "/images/spring/webp/dsc02077.webp",
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

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
