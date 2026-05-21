import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.war.gov',
        pathname: '/portals/**',
      },
    ],
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/proxy-war/:path*',
        destination: 'https://www.war.gov/:path*',
      },
    ];
  },
};

export default withNextIntl(nextConfig);

