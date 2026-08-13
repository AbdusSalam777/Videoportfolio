import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lean standalone build for VPS deployment (see DEPLOY.md).
  output: "standalone",
};

export default nextConfig;
