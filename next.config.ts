import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/little-thing",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
