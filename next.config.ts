import type { NextConfig } from "next";

const isTauriExport = process.env.NEXT_PUBLIC_TAURI_EXPORT === 'true';

const nextConfig: NextConfig = {
  output: isTauriExport ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
