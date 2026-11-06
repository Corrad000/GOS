import type { NextConfig } from "next";
import tailwindcss from '@tailwindcss/next'; // <-- Aggiungi questo import

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true, // Mantiene attiva la patch precedente sui tipi
  },
  plugins: [
    tailwindcss(), // <-- Aggiungi il plugin qui per far digerire @theme a Turbopack
  ],
};

export default nextConfig;
