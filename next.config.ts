import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack CSS loader config (dev only, Vercel ignores this)
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
