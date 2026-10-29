import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { company, servicePages, site } from "@/lib/content";
import { allPosts } from "@/lib/blog";
import { alternates, ldJson, longDate } from "@/lib/utils";
import Nav from "@/components/chrome/Nav";
import Footer from "@/components/chrome/Footer";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return allPosts.map((p) => ({ slug: p.slug }));
}

const find = async (params: Props["params"]) => {
  const { slug } = await params;
  return allPosts.find((p) => p.slug === slug);
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await find(params);
  if (!p) return {};
  const url = `/blog/${p.slug}`;
  return {
    title: `${p.title} | Kickstart`,
    description: p.description,
    alternates: alternates(url),
    openGraph: {
      type: "article",
      url,
      siteName: site.name,
      title: p.title,
      description: p.description,
      publishedTime: p.date,
      modifiedTime: p.updated,
    },
    twitter: { card: "summary_large_image", title: p.title, description: p.description },
  };
}

/**
 * A post. The body is compiled from content/blog/<slug>.md by scripts/blog.mjs,
 * which has already passed it through the fact gate, so the HTML is our own and
 * safe to set directly. The FAQ stays inside the article as plain headings and
 * paragraphs — visible text is what answer engines quote — and is repeated as
 * FAQPage JSON-LD.
 */
export default async function PostPage({ params }: Props) {
  const p = await find(params);
  if (!p) notFound();

  const url = `${site.url}/blog/${p.slug}`;
  const service = servicePages.find((s) => s.slug === p.pillar)!;
  // Same pillar first, then the newest of the rest.
  const related = [
    ...allPosts.filter((o) => o.slug !== p.slug && o.pillar === p.pillar),
    ...allPosts.filter((o) => o.slug !== p.slug && o.pillar !== p.pillar),
  ].slice(0, 2);

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#post`,
        headline: p.title,
        description: p.description,
        url,
        mainEntityOfPage: url,
        datePublished: p.date,
        dateModified: p.updated,
        inLanguage: "en-IN",
        wordCount: p.words,
        keywords: p.keyword,
        image: `${site.url}/opengraph-image`,
        author: { "@id": `${site.url}/#business` },
        publisher: { "@id": `${site.url}/#business` },
        about: { "@id": `${site.url}/services/${service.slug}#service` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${site.url}/blog` },
          { "@type": "ListItem", position: 3, name: p.title, item: url },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: p.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <>
      <Nav home="/" />
      <main id="main" className="px-gutter pt-36 pb-section-lg">
        <article className="mx-auto max-w-[68ch]">
          <nav aria-label="Breadcrumb" className="u-meta text-muted-dark">
            <ol className="flex flex-wrap gap-x-3">
              <li>
                <a href="/" className="cut-link">Home</a>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <a href="/blog" className="cut-link">Blog</a>
              </li>
            </ol>
          </nav>

          <h1 className="u-display text-h2 pt-5" style={{ ["--wdth" as string]: 100 }}>
            {p.title}
          </h1>

          <p className="u-meta flex flex-wrap gap-x-5 gap-y-1 pt-6 text-muted-dark">
            <span>
              By <a href="/" className="cut-link text-paper">{site.name}</a>
            </span>
            <span>
              Updated <time dateTime={p.updated}>{longDate(p.updated)}</time>
            </span>
            <span>{p.minutes} min read</span>
          </p>

          <div className="prose-ks pt-10" dangerouslySetInnerHTML={{ __html: p.html }} />

          {/* Author box. The studio, not a person: a byline should be someone who
              stands behind it, and Jerry has not reviewed the posts yet. */}
          <aside className="mt-16 border-y border-[var(--rule-on-dark)] py-8">
            <h2 className="u-meta text-muted-dark">About the author</h2>
            <p className="pt-3 text-body leading-[1.65] text-paper/90">
              {site.name} is a media production and technology studio based in Bangalore, founded by{" "}
              {company.founder.name} on {company.founded}. It makes corporate films, event coverage and
              social content, and builds websites, apps, software and AI tools for businesses in
              Bangalore, Coimbatore and across India.
            </p>
          </aside>

          <aside className="mt-12">
            <h2 className="u-meta text-muted-dark">Related service</h2>
            <a
              href={`/services/${service.slug}`}
              className="cut-link u-display text-h3 mt-3"
              style={{ ["--wdth" as string]: 104 }}
            >
              {service.name}
            </a>
            <p className="pt-2 text-muted-dark">{service.line}</p>
            <a href="/#contact" className="cut-link u-meta mt-5 text-paper">
              Send a project brief
            </a>
          </aside>

          {related.length > 0 && (
            <aside className="mt-14">
              <h2 className="u-meta text-muted-dark">Read next</h2>
              <ul className="mt-3">
                {related.map((o) => (
                  <li key={o.slug} className="border-t border-[var(--rule-on-dark)] py-4 last:border-b">
                    <a href={`/blog/${o.slug}`} className="cut-link font-bold">
                      {o.title}
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </article>
      </main>
      <Footer home="/" />
      <script type="application/ld+json" dangerouslySetInnerHTML={ldJson(ld)} />
    </>
  );
}
