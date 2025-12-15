import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.convex.cloud",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      // add other auth/avatar providers here if you use them later
      // {
      //   protocol: "https",
      //   hostname: "avatars.githubusercontent.com",
      //   pathname: "/**",
      // },
    ],
  },
};

export default nextConfig;
