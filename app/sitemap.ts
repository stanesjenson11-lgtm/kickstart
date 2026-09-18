import type { MetadataRoute } from "next";
import { site } from "@/lib/content";

/* One URL: /privacy is noindex. lastModified is a fixed date — bump it when the
   page's content changes. `new Date()` stamped every fetch as just modified,
   which Google learns to ignore, and with it the one sitemap field it reads. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: site.url, lastModified: "2026-09-17", changeFrequency: "monthly", priority: 1 }];
}
