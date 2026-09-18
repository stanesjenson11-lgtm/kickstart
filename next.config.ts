import type { NextConfig } from "next";
import { WIDTHS } from "./lib/image-loader";

const isDev = process.env.NODE_ENV === "development";

/**
 * 'unsafe-inline' scripts are the static-site option in Next's CSP guide: nonces
 * need every request rendered on the server, which would give up the cached
 * page and the Workers free plan's 10 ms CPU budget. Every other source is still
 * pinned to this origin. challenges.cloudflare.com is Turnstile on the brief form.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "media-src 'self'",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-src https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // The brief email inlines the logo from disk; without this the file is not
  // traced into the serverless bundle and the email falls back to a wordmark.
  outputFileTracingIncludes: {
    "/api/brief": ["./public/email-*.png"],
  },
  images: {
    // Every size is already a file in public/_img, so nothing resizes per request.
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    deviceSizes: WIDTHS.filter((w) => w >= 640),
    imageSizes: WIDTHS.filter((w) => w < 640),
    // Matches nothing. OpenNext's worker answers /_next/image whatever the
    // loader, and an open resizer would let anyone spend the Images quota.
    localPatterns: [{ pathname: "/__no-image-optimizer__/**", search: "" }],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
          },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          // Browser-enforced hotlink protection: another site embedding our
          // images or showreel as a subresource gets a blocked load. Social
          // previews are unaffected — crawlers fetch the OG image server-side,
          // where CORP does not apply.
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
