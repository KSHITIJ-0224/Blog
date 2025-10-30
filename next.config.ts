import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/login",
        permanent: false, // set to false for temporary, true for permanent
      },
    ];
  },
  // Add other config options here if needed
};

export default nextConfig;
