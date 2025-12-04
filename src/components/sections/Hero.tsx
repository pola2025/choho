"use client";

import { useState, useEffect } from "react";

const heroImages = [
  "https://pub-a9d6e869ce90467d9e8967240133a847.r2.dev/hero/dsc08362.webp",
  "https://pub-a9d6e869ce90467d9e8967240133a847.r2.dev/hero/dsc08370.webp",
  "https://pub-a9d6e869ce90467d9e8967240133a847.r2.dev/hero/dsc08371.webp",
  "https://pub-a9d6e869ce90467d9e8967240133a847.r2.dev/hero/dsc08373.webp",
  "https://pub-a9d6e869ce90467d9e8967240133a847.r2.dev/hero/dsc08376.webp",
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
