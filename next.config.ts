import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Deployed from source on the VPS (git pull → npm ci → build → pm2 restart),
  // so `next start` is the entry point. Standalone output is deliberately not
  // used: it expects .next/standalone/server.js and does not copy public/ or
  // .next/static into place on its own.
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
