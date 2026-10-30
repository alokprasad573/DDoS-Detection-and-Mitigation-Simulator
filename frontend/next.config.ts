import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/mitigation",
        destination: "/protection",
        permanent: true,
      },
      {
        source: "/threats",
        destination: "/detection",
        permanent: true,
      },
      {
        source: "/threat",
        destination: "/detection",
        permanent: true,
      },
      {
        source: "/alerts",
        destination: "/detection",
        permanent: true,
      },
      {
        source: "/history",
        destination: "/health",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
