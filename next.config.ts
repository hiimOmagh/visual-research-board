import type { NextConfig } from "next";

const isStaticExport = process.env.VISUAL_RESEARCH_BOARD_STATIC_EXPORT === "true";
const configuredBasePath = process.env.VISUAL_RESEARCH_BOARD_BASE_PATH?.trim();
const basePath = configuredBasePath && configuredBasePath !== "/" ? configuredBasePath.replace(/\/$/, "") : undefined;

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: "export", trailingSlash: true } : {}),
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "*.wikimedia.org" },
      { protocol: "https", hostname: "*.wikimedia.commons.org" },
      { protocol: "https", hostname: "images.unsplash.com" }
    ]
  }
};

export default nextConfig;
