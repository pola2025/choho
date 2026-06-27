import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/main", destination: "/", permanent: true },
      { source: "/about/notice", destination: "/about/journal", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.imweb.me",
      },
      {
        protocol: "https",
        hostname: "www.chorigol.co.kr",
      },
      {
        protocol: "https",
        hostname: "pub-a9d6e869ce90467d9e8967240133a847.r2.dev",
      },
    ],
  },
};

export default nextConfig;
