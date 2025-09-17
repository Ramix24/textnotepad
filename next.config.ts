import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  webpack: (config, { isServer }) => {
    // Enable Web Workers support for client-side builds
    if (!isServer) {
      config.output.globalObject = 'self'
    }

    return config
  },
};

export default nextConfig;
