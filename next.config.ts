import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  eslint: {
    // Only run ESLint on build if not in CI (it runs separately in CI)
    ignoreDuringBuilds: process.env.CI === 'true',
  },
  webpack: (config, { isServer }) => {
    // Enable Web Workers support for client-side builds
    if (!isServer) {
      config.output.globalObject = 'self'
    }

    return config
  },
};

export default nextConfig;
