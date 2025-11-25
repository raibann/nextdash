import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    DATABASE_URL: "DATABASE_URL",
    BETTER_AUTH_SECRET: "BETTER_AUTH_SECRET",
    BETTER_AUTH_URL: "BETTER_AUTH_URL",
  },
};

export default nextConfig;
