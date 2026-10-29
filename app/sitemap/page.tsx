import type { Metadata } from "next";
import { cities, servicePages, site } from "@/lib/content";
import { allPosts } from "@/lib/blog";
import { alternates } from "@/lib/utils";
import Nav from "@/components/chrome/Nav";
import Footer from "@/components/chrome/Footer";

export const metadata: Metadata = {
  title: `Sitemap | ${site.name}`,
  description: `Every page on the ${site.name} website: services, city pages, blog posts and company information.`,
  alternates: alternates("/sitemap"),
};

/**
 * The human-readable sitemap. Every page on the site in one list, one click
 * from the footer of every page — which caps crawl depth at two. Built from the
 * same data as sitemap.xml, so the two cannot disagree.
 */
export default function HtmlSitemap() {
  const groups: { title: string; links: { href: string; label: string }[] }[] = [
    {
      title: "Studio",
      links: [
        { href: "/", label: "Home" },
        { href: "/#contact", label: "Send a project brief" },
        { href: "/privacy", label: "Privacy policy" },
      ],
    },
    {
      title: "Services",
      links: [
        ...servicePages.map((s) => ({ href: `/services/${s.slug}`, label: s.name })),
      ],
    },
    { title: "Cities", links: cities.map((c) => ({ href: `/${c.slug}`, label: c.name })) },
    {
      title: "Blog",
      links: [{ href: "/blog", label: "All posts" }, ...allPosts.map((p) => ({ href: `/blog/${p.slug}`, label: p.title }))],
    },
  ];

  return (
    <>
      <Nav home="/" />
      <main id="main" className="px-gutter pt-36 pb-section-lg">
        <h1 className="u-display text-h1" style={{ ["--wdth" as string]: 104 }}>
          Sitemap.
        </h1>
        <div className="grid gap-x-grid gap-y-12 pt-14 bar:grid-cols-2 wide:grid-cols-4">
          {groups.map((g) => (
            <section key={g.title}>
              <h2 className="u-meta text-muted-dark">{g.title}</h2>
              <ul className="mt-4 border-t border-[var(--rule-on-dark)]">
                {g.links.map((l) => (
                  <li key={l.href} className="border-b border-[var(--rule-on-dark)] py-3">
                    <a href={l.href} className="cut-link">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
      <Footer home="/" />
    </>
  );
}
