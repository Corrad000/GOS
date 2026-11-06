import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Mantiene la patch per il generatore PDF
  },
  experimental: {
    turbo: {
      rules: {
        // Forza Turbopack a processare correttamente Tailwind v4
        "*.css": ["@tailwindcss/postcss"],
      },
    },
  },
};

export default nextConfig;
