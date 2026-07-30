import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['itchy-bats-roll.loca.lt', '*.loca.lt', '*.lhr.life', 'localhost.run'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_API_URL || 'http://localhost:4500';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
