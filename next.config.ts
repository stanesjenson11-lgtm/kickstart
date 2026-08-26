import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The brief email inlines the logo from disk; without this the file is not
  // traced into the serverless bundle and the email falls back to a wordmark.
  outputFileTracingIncludes: {
    "/api/brief": ["./public/logo-email.png"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
