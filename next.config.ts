import type { NextConfig } from "next";

/**
 * GitHub Pages：CI 里设 STATIC_EXPORT=true + BASE_PATH=/little-thing
 * 本地预览静态包：只设 STATIC_EXPORT=true（不要 BASE_PATH），再在 out 目录起 http.server，打开站点根路径即可
 */
const staticExport = process.env.STATIC_EXPORT === "true";
const rawBase = process.env.BASE_PATH?.trim();
const basePath =
  rawBase && rawBase !== "/"
    ? rawBase.replace(/\/$/, "")
    : undefined;

const nextConfig: NextConfig = {
  ...(staticExport && {
    output: "export",
  }),
  ...(basePath ? { basePath } : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
