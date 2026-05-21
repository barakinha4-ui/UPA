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
};

export default withNextIntl(nextConfig);

