import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Mantiene la patch per il generatore PDF
  },
};

export default nextConfig;
