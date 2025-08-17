import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["ioiqyiwkmcotlopwtjsu.supabase.co"], // <-- your Supabase storage host
  },
};

export default nextConfig;
