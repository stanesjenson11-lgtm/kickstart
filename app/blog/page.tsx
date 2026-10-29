import type { Metadata } from "next";
import { servicePages, site } from "@/lib/content";
import { allPosts } from "@/lib/blog";
import { alternates, ldJson, longDate } from "@/lib/utils";
import Nav from "@/components/chrome/Nav";
import Footer from "@/components/chrome/Footer";

const title = "Blog: Video Production, Websites & AI Guides | Kickstart";
const description =
  "Plain-English guides from Kickstart Creative Studio on corporate video, event coverage, websites, apps and AI for businesses in Bangalore, Coimbatore and India.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { ...alternates("/blog"), types: { "application/rss+xml": "/blog/feed.xml" } },
  openGraph: { type: "website", url: "/blog", siteName: site.name, title, description },
};

const serviceName = (slug: string) => servicePages.find((s) => s.slug === slug)?.name ?? "";

export default function BlogIndex() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${site.url}/blog`,
    name: "Kickstart Creative Studio blog",
    url: `${site.url}/blog`,
    publisher: { "@id": `${site.url}/#business` },
    blogPost: allPosts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${site.url}/blog/${p.slug}`,
      datePublished: p.date,
      dateModified: p.updated,
    })),
  };

  return (
    <>
      <Nav home="/" />
      <main id="main" className="px-gutter pt-36 pb-section-lg">
        <h1 className="u-display text-h1 max-w-[16ch]" style={{ ["--wdth" as string]: 104 }}>
          Guides from the studio.
        </h1>
        <p className="u-measure pt-6 text-body leading-[1.65] text-muted-dark">
          What things cost, how projects run and how to choose, written by the team that shoots, builds and
          automates for businesses in Bangalore, Coimbatore and across India.
        </p>

        <ul className="mt-14">
          {allPosts.map((p) => (
            <li
              key={p.slug}
              className="border-t border-[var(--rule-on-dark)] py-6 last:border-b bar:grid bar:grid-cols-12 bar:gap-grid"
            >
              <p className="u-meta text-muted-dark bar:col-span-3 bar:pt-1">
                <a href={`/services/${p.pillar}`} className="cut-link">
                  {serviceName(p.pillar)}
                </a>
                <span className="block pt-1">
                  <time dateTime={p.updated}>{longDate(p.updated)}</time>
                </span>
              </p>
              <div className="pt-3 bar:col-span-9 bar:pt-0">
                <h2 className="text-h3 font-bold leading-tight">
                  <a href={`/blog/${p.slug}`} className="cut-link">
                    {p.title}
                  </a>
                </h2>
                <p className="u-measure pt-2 text-muted-dark">{p.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </main>
      <Footer home="/" />
      <script type="application/ld+json" dangerouslySetInnerHTML={ldJson(ld)} />
    </>
  );
}
