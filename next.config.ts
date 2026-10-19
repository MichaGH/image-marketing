import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Preserve the source artwork without recompression during this design conversion.
  images: { unoptimized: true },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
