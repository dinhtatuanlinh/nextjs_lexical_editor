import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "3010",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "api.noteatext.com",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "dev-api.noteatext.com",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "ui-avatars.com",
        pathname: "/api/**",
      },
      {
        protocol: "http",
        hostname: "bff",
        port: "3010",
        pathname: "/uploads/**",
      },
    ],
    dangerouslyAllowSVG: true,
    domains: ['localhost', 'api.noteatext.com', 'dev-api.noteatext.com', 'bff'],
  },
};

export default nextConfig;
