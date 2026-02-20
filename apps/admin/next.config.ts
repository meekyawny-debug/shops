import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@shops/ui",
    "@shops/api",
    "@shops/db",
    "@shops/types",
    "@shops/suppliers",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "**.cjdropshipping.com" },
      { protocol: "https", hostname: "**.alicdn.com" },
    ],
  },
};

export default nextConfig;
