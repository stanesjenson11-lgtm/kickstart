import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { areaServed, cities, servicePages, site } from "@/lib/content";
import { alternates, ldJson } from "@/lib/utils";
import Nav from "@/components/chrome/Nav";
import Footer from "@/components/chrome/Footer";
import Contact from "@/components/sections/Contact";

type Props = { params: Promise<{ city: string }> };

/* /bangalore and /coimbatore only. Every other single-segment path falls
   through to the 404, and real routes (/about, /blog…) always win. */
export const dynamicParams = false;

export function generateStaticParams() {
  return cities.map((c) => ({ city: c.slug }));
}

const find = async (params: Props["params"]) => {
  const { city } = await params;
  return cities.find((c) => c.slug === city);
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = await find(params);
  if (!c) return {};
  return {
    title: c.metaTitle,
    description: c.description,
    alternates: alternates(`/${c.slug}`),
    openGraph: { type: "website", url: `/${c.slug}`, siteName: site.name, title: c.metaTitle, description: c.description },
  };
}

/**
 * What Kickstart does for one city, said honestly: Bangalore is home,
 * Coimbatore is served remotely and visited for shoots. Each page links to
 * every service, so it is a hub for that city's searches, not a doorway.
 */
export default async function CityPage({ params }: Props) {
  const c = await find(params);
  if (!c) notFound();

  const url = `${site.url}/${c.slug}`;
  const place = areaServed.find((a) => a.name === c.name || ("alternateName" in a && a.alternateName === c.name));
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: c.metaTitle,
        description: c.description,
        about: [{ "@id": `${site.url}/#business` }, ...(place ? [place] : [])],
        isPartOf: { "@id": `${site.url}/#website` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: c.name, item: url },
        ],
      },
    ],
  };

  return (
    <>
      <Nav home="/" />
      <main id="main">
        <section className="relative flex min-h-[70svh] items-end overflow-hidden bg-ink">
          <Image src={c.image.src} alt={c.image.alt} fill priority sizes="100vw" className="object-cover opacity-70" />
          <div aria-hidden="true" className="hero-scrim absolute inset-0" />
          <div className="relative z-[var(--z-content)] w-full px-gutter pt-32 pb-12">
            <h1 className="u-display text-display" style={{ ["--wdth" as string]: 104 }}>
              {c.h1}
            </h1>
          </div>
        </section>

        <section className="px-gutter py-section-lg bar:grid bar:grid-cols-12 bar:gap-grid">
          <div className="bar:col-span-7">
            <p className="u-measure text-[length:clamp(1.125rem,1.7vw,1.4rem)] leading-[1.6] text-paper/90">
              {c.intro}
            </p>
            {c.paragraphs.map((t) => (
              <p key={t} className="u-measure pt-5 text-body leading-[1.75] text-muted-dark">
                {t}
              </p>
            ))}
          </div>
          <nav aria-label={`Services in ${c.name}`} className="pt-12 bar:col-span-4 bar:col-start-9 bar:pt-1">
            <h2 className="u-display text-h3" style={{ ["--wdth" as string]: 100 }}>
              What we do in {c.name}
            </h2>
            <ul className="mt-4 border-t border-[var(--rule-on-dark)]">
              {servicePages.map((s) => (
                <li key={s.slug} className="border-b border-[var(--rule-on-dark)] py-3">
                  <a href={`/services/${s.slug}`} className="cut-link">
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </section>

        <Contact />
      </main>
      <Footer home="/" />
      <script type="application/ld+json" dangerouslySetInnerHTML={ldJson(ld)} />
    </>
  );
}
