import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverComponentsExternalPackages: ['sharp'],
    // Aumentar límite de body para App Router
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  // Configuraciones para manejar archivos grandes
  images: {
    domains: [],
    unoptimized: true,
  },
};

export default nextConfig;
