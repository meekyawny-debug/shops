import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@shops/ui",
    "@shops/api",
    "@shops/db",
    "@shops/types",
  ],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "**.cjdropshipping.com" },
      { protocol: "https", hostname: "**.alicdn.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "cdn.shopify.com" },
    ],
  },
};

export default nextConfig;
