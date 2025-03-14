import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
  },
  // experimental: {
  //   staleTimes: {
  //     dynamic: 300,
  //     static: 300,
  //   },
  // },
  reactStrictMode: false,
};

export default nextConfig;
