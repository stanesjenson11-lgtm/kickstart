import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { areaServed, servicePages, site } from "@/lib/content";
import { ldJson } from "@/lib/utils";
import Footer from "@/components/chrome/Footer";
import Faq from "@/components/sections/Faq";
import Contact from "@/components/sections/Contact";

type Props = { params: Promise<{ slug: string }> };

/* Three pages, known at build time; anything else under /services is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return servicePages.map((p) => ({ slug: p.slug }));
}

const find = async (params: Props["params"]) => {
  const { slug } = await params;
  return servicePages.find((p) => p.slug === slug);
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await find(params);
  if (!p) return {};
  const url = `/services/${p.slug}`;
  return {
    title: p.metaTitle,
    description: p.description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, siteName: site.name, title: p.metaTitle, description: p.description },
    twitter: { card: "summary_large_image", title: p.metaTitle, description: p.description },
  };
}

/**
 * One landing page per search intent. Built from the home page's own parts —
 * hairlines, the cut, the FAQ and the brief form — so arriving from a search
 * result lands in the same studio, one click from sending a brief.
 *
 * Server-rendered and motion-free on purpose: these pages exist to be read by
 * people deciding and by crawlers, and the pinned scenes belong to the home page.
 */
export default async function ServicePage({ params }: Props) {
  const p = await find(params);
  if (!p) notFound();

  const url = `${site.url}/services/${p.slug}`;
  const others = servicePages.filter((o) => o.slug !== p.slug);
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: p.name,
        serviceType: p.name,
        description: p.description,
        url,
        provider: { "@id": `${site.url}/#business` },
        areaServed,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: p.name, item: url },
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
      <header className="absolute inset-x-0 top-0 z-[var(--z-nav)] flex items-center justify-between px-gutter pt-6">
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- a full
            load on purpose: the home page's pinned scroll scenes measure on load. */}
        <a href="/" aria-label={`${site.name} — home`} className="inline-block">
          <Image
            src="/logo-white.png"
            alt=""
            width={1000}
            height={182}
            sizes="180px"
            loading="eager"
            className="h-auto w-[clamp(7rem,12vw,11rem)]"
          />
        </a>
        <a href="#contact" className="cut-link u-meta">
          Send a brief
        </a>
      </header>

      <main id="main">
        <section className="relative flex min-h-[76svh] items-end overflow-hidden bg-ink">
          <Image
            src={p.image.src}
            alt={p.image.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-70"
          />
          <div aria-hidden="true" className="hero-scrim absolute inset-0" />
          <div className="relative z-[var(--z-content)] w-full px-gutter pt-32 pb-12">
            <nav aria-label="Breadcrumb" className="u-meta text-paper/75">
              <ol className="flex flex-wrap gap-x-3">
                <li>
                  {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- see the logo link. */}
                  <a href="/" className="cut-link">Home</a>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page">{p.name}</li>
              </ol>
            </nav>
            <h1 className="u-display text-h1 max-w-[20ch] pt-5" style={{ ["--wdth" as string]: 104 }}>
              {p.h1}
            </h1>
          </div>
        </section>

        <section className="px-gutter py-section-lg bar:grid bar:grid-cols-12 bar:gap-grid">
          <p className="u-measure text-[length:clamp(1.125rem,1.7vw,1.4rem)] leading-[1.6] text-paper/90 bar:col-span-7">
            {p.intro}
          </p>
          <div className="pt-12 bar:col-span-4 bar:col-start-9 bar:pt-1">
            <h2 className="u-meta text-muted-dark">What we make</h2>
            <ul className="mt-4 border-t border-[var(--rule-on-dark)]">
              {p.offer.map((o) => (
                <li key={o} className="border-b border-[var(--rule-on-dark)] py-3">
                  {o}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* A real sequence, so it is numbered. */}
        <section className="cut-top bg-paper px-gutter pb-section-lg text-ink">
          <h2 className="u-display text-h2 pt-section" style={{ ["--wdth" as string]: 106 }}>
            How it works.
          </h2>
          <ol className="mt-10 grid gap-x-grid gap-y-8 bar:mt-14 bar:grid-cols-2 wide:grid-cols-4">
            {p.steps.map((s, i) => (
              <li key={s.title} className="border-t border-[var(--rule-on-light)] pt-5">
                <span className="u-meta text-muted-light">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="u-display text-h3 pt-3" style={{ ["--wdth" as string]: 100 }}>
                  {s.title}
                </h3>
                <p className="pt-3 text-muted-light">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <Faq items={p.faq} />

        <nav aria-label="Other services" className="border-t border-[var(--rule-on-dark)] bg-ink px-gutter py-section">
          <h2 className="u-meta text-muted-dark">Also from Kickstart</h2>
          <ul className="mt-6 grid gap-4 bar:grid-cols-2">
            {others.map((o) => (
              <li key={o.slug}>
                <a href={`/services/${o.slug}`} className="cut-link u-display text-h2" style={{ ["--wdth" as string]: 104 }}>
                  {o.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <Contact />
      </main>

      <Footer home="/" />
      <script type="application/ld+json" dangerouslySetInnerHTML={ldJson(ld)} />
    </>
  );
}
