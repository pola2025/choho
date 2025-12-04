import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/main', destination: '/', permanent: true },
      { source: '/about/notice', destination: '/about/journal', permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.imweb.me',
      },
    ],
  },
};

export default nextConfig;
