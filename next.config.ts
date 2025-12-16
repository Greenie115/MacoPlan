import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "edamam-product-images.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "www.edamam.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "dxhfjhprhxylnhufzaiu.supabase.co",
      },
      {
        // FatSecret recipe images
        protocol: "https",
        hostname: "www.fatsecret.com",
      },
      {
        // FatSecret CDN images
        protocol: "https",
        hostname: "m.fatsecret.com",
      },
      {
        // FatSecret static CDN (m.ftscrt.com)
        protocol: "https",
        hostname: "m.ftscrt.com",
      },
      {
        // FatSecret static images
        protocol: "https",
        hostname: "static.fatsecret.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
