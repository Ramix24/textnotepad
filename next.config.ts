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
  // Force fresh builds to resolve deployment issues
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
