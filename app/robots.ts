import type { MetadataRoute } from "next";
import { site } from "@/lib/content";

/**
 * Search engines and AI crawlers are all welcome. The `*` group already lets
 * every one of them in; the named groups say so explicitly, so a crawler that
 * only reads its own group (and anyone auditing the file) sees the same answer.
 * Covers training crawlers, search indexers and on-demand fetchers for ChatGPT,
 * Claude, Perplexity, Gemini, Apple and Bing/Copilot.
 *
 * Cloudflare can also block AI bots at the edge, outside this file: keep
 * "Block AI bots" and the managed robots.txt off in the dashboard.
 */
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bingbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/api/" },
      { userAgent: AI_BOTS, allow: "/", disallow: "/api/" },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
