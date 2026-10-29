import type { MetadataRoute } from "next";
import { cities, servicePages, site } from "@/lib/content";
import { allPosts } from "@/lib/blog";

/* lastModified is a real date wherever the content carries one, so crawlers
   can trust it; pages without one report the build time. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const latest = allPosts[0]?.updated ?? now;
  return [
    { url: site.url, lastModified: now, changeFrequency: "monthly", priority: 1 },
    ...servicePages.map((p) => ({
      url: `${site.url}/services/${p.slug}`,
      lastModified: p.updated,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...cities.map((c) => ({
      url: `${site.url}/${c.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    { url: `${site.url}/blog`, lastModified: latest, changeFrequency: "weekly", priority: 0.8 },
    ...allPosts.map((p) => ({
      url: `${site.url}/blog/${p.slug}`,
      lastModified: p.updated,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    { url: `${site.url}/sitemap`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${site.url}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
