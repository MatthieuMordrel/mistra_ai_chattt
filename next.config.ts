import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
  },
  experimental: {
    //   staleTimes: {
    //     dynamic: 300,
    //     static: 300,
    //   },
    // nodeMiddleware: true, //Only in canary version...
  },
  reactStrictMode: false,
};

export default nextConfig;
