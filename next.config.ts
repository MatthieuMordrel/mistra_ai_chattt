import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
  },
  reactStrictMode: false,
};

export default nextConfig;
