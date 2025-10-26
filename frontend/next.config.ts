import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'a0.muscache.com',
        pathname: '/pictures/**',
      },
      {
        protocol: 'https',
        hostname: '*.muscache.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
