"use client";

import { Instagram, Heart, ExternalLink } from "lucide-react";

const instagramTags = [
  {
    tag: "초호",
    url: "https://www.instagram.com/explore/tags/초호/",
    description: "초호펜션",
  },
  {
    tag: "초리골164",
    url: "https://www.instagram.com/explore/tags/초리골164/",
    description: "카페 초리골164",
  },
  {
    tag: "초호쉼터",
    url: "https://www.instagram.com/explore/tags/초호쉼터/",
    description: "초호쉼터",
  },
];

export function InstagramTags() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Instagram Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50" />

      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-48 h-48 bg-gradient-to-br from-purple-300/20 to-pink-300/20 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-56 h-56 bg-gradient-to-br from-orange-300/20 to-yellow-300/20 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto text-center">
        {/* Header */}
        <div className="mb-10">
          {/* Instagram Icon with Gradient */}
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 shadow-lg">
            <Instagram className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
            인스타그램에서 만나요
          </h2>

          <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto">
            해시태그를 클릭하면 초호펜션의
            <br className="sm:hidden" />
            다양한 순간들을 만나볼 수 있어요
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {instagramTags.map((item) => (
            <a
              key={item.tag}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative"
            >
              <div className="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl shadow-soft border border-white hover:border-pink-200 hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                {/* Hashtag Icon */}
                <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 text-white font-bold text-lg">
                  #
                </span>

                {/* Tag Text */}
                <span className="text-lg font-semibold text-neutral-800 group-hover:text-pink-600 transition-colors">
                  {item.tag}
                </span>

                {/* External Link Icon */}
                <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-pink-500 transition-colors" />
              </div>

              {/* Glow Effect on Hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
            </a>
          ))}
        </div>

        {/* Follow Button */}
        <a
          href="https://www.instagram.com/choho_pension"
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          <Instagram className="w-5 h-5" />
          <span>@choho_pension 팔로우하기</span>
          <Heart className="w-4 h-4 group-hover:scale-125 group-hover:text-red-200 transition-all" />
        </a>

        {/* Decorative Text */}
        <p className="mt-8 text-sm text-muted-foreground">
          소중한 순간을 공유해주세요
        </p>
      </div>
    </section>
  );
}
