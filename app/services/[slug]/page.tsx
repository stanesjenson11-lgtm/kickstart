import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { areaServed, servicePages, site } from "@/lib/content";
import { alternates, ldJson, longDate } from "@/lib/utils";
import SmoothScroll from "@/components/chrome/SmoothScroll";
import Nav from "@/components/chrome/Nav";
import Footer from "@/components/chrome/Footer";
import Plate from "@/components/ui/Plate";

type Props = { params: Promise<{ slug: string }> };

/** "Video production" → "video production", but "AI agents" and "API" keep their capitals. */
const midSentence = (s: string) => (/^[A-Z]{2}/.test(s) ? s : s[0].toLowerCase() + s.slice(1));

/* Known at build time; anything else under /services is a 404. */
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
    alternates: alternates(url),
    openGraph: { type: "website", url, siteName: site.name, title: p.metaTitle, description: p.description },
    twitter: { card: "summary_large_image", title: p.metaTitle, description: p.description },
  };
}

/**
 * One landing page per search intent, built from the home page's own parts —
 * its navbar, hairlines and the cut — so arriving from a search result lands in
 * the same studio. Two screens and the footer, nothing more.
 *
 * Answer-first: the opening paragraph says who does what, where, before
 * anything else, and the section headings are the questions people search.
 * The content is server-rendered, so crawlers and no-JS readers get all of it.
 * The first two sections are one-screen frames the page snaps to, like About on
 * the home page; the pinned scenes and scroll animation stay on the home page.
 */
export default async function ServicePage({ params }: Props) {
  const p = await find(params);
  if (!p) notFound();

  const url = `${site.url}/services/${p.slug}`;
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
        "@type": "WebPage",
        "@id": url,
        url,
        name: p.metaTitle,
        dateModified: p.updated,
        isPartOf: { "@id": `${site.url}/#website` },
        about: { "@id": `${url}#service` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: site.url },
          { "@type": "ListItem", position: 2, name: p.name, item: url },
        ],
      },
    ],
  };

  return (
    <>
      {/* The home page's own navbar: flat over the picture, the liquid-glass
          pill once scrolled. */}
      <SmoothScroll />
      <Nav home="/" />

      <main id="main">
        {/* Frame one: the picture and the title, exactly one screen. The padding
            lives on the inner box, not the section: the snap measures a frame
            from its section's own padding. */}
        <section data-frame className="relative flex min-h-[100svh] items-end overflow-hidden bg-ink">
          <Image
            src={p.image.src}
            alt={p.image.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-70"
          />
          <div aria-hidden="true" className="hero-scrim absolute inset-0" />
          {/* The foot clears the cut that frame two rides up over this one. */}
          <div className="relative z-[var(--z-content)] flex w-full items-end justify-between gap-6 px-gutter pt-32 pb-[calc(var(--cut-drop)+1.5rem)]">
            <div>
              <nav aria-label="Breadcrumb" className="u-meta text-paper/75">
                <ol className="flex flex-wrap gap-x-3">
                  <li>
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
            <p aria-hidden="true" className="u-meta hidden shrink-0 items-center gap-3 text-paper/75 bar:flex">
              Scroll
              <span className="block h-px w-10 bg-current" />
            </p>
          </div>
        </section>

        {/* Frame two: what the service is and what it covers, landed flush by
            the snap. 100svh PLUS the cut, like About, because a frame lands
            below the diagonal. Film grain moves over it, as over the brief form
            on the home page.

            From `bar` up it is a grid exactly one screen tall: the intro and the
            stack take what they need on the left, and the photograph takes the
            rest of the column (the 1fr row), unmasking along the cut as it
            arrives and pushing in slowly as the page moves. The list runs down
            the right.

            A phone gets two screens instead, each a frame of its own, over the
            same photograph held still behind both: the intro set large over the
            picture, then the list and the stack on an ink wash, so the words
            scroll past the picture like subtitles. The two screen wrappers are
            `display: contents` from `bar` up, so the same elements fall back
            into the grid and nothing is written twice. */}
        <section
          data-frame
          className="grain cut-top relative min-h-[calc(100svh+var(--cut-drop))] bg-ink bar:flex bar:items-center"
        >
          {/* The held photograph. Sticky inside a layer the height of the
              section, so it rides in with the cut, then stays put while both
              screens pass over it. overflow: clip on .grain, not hidden, keeps
              sticky working. */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bar:hidden">
            <div className="sticky top-0 h-[100svh] overflow-hidden">
              <Image src={p.detail.src} alt="" fill sizes="100vw" className="object-cover opacity-75" />
              <div className="absolute inset-0 bg-[linear-gradient(to_bottom,oklch(0.145_0_0/0.55),oklch(0.145_0_0/0.1)_30%,oklch(0.145_0_0/0.55)_58%,var(--color-ink)_92%)]" />
            </div>
          </div>

          <div className="relative z-[var(--z-content)] w-full px-gutter bar:grid bar:min-h-[100svh] bar:grid-cols-12 bar:grid-rows-[auto_auto_minmax(10rem,1fr)] bar:gap-x-grid bar:gap-y-8 bar:pt-[4.5rem] bar:pb-6">
            {/* Phone screen one: the intro, set at reading size on the picture. */}
            <div className="flex min-h-[100svh] flex-col justify-end pt-[5.5rem] pb-12 bar:contents">
              <div className="bar:col-span-7">
                <p className="u-measure text-[1.0625rem] leading-[1.6] text-paper bar:text-[length:clamp(1.05rem,1.45vw,1.3rem)] bar:leading-[1.55] bar:text-paper/90">
                  {p.intro}
                </p>
                <p className="u-meta pt-5 text-paper/70 bar:text-muted-dark">
                  Updated <time dateTime={p.updated}>{longDate(p.updated)}</time>
                </p>
              </div>
            </div>

            {/* Phone screen two: a frame of its own (phone only), on an ink wash
                so the list reads over the picture. Padding on the inner box:
                the snap reads a frame's own top padding as a cut. */}
            <div
              data-frame="phone"
              className="-mx-gutter flex min-h-[100svh] flex-col justify-center bg-ink/80 px-gutter bar:contents"
            >
              <div className="pt-[5.5rem] pb-10 bar:contents">
                <div className="bar:col-span-4 bar:col-start-9 bar:row-span-3 bar:row-start-1 bar:pt-1">
                  <h2
                    className="u-display text-[length:clamp(1.15rem,5.2vw,1.35rem)] bar:text-[length:clamp(1rem,1.6vw,1.35rem)]"
                    style={{ ["--wdth" as string]: 100 }}
                  >
                    What does {midSentence(p.name)} include?
                  </h2>
                  <ul className="mt-4 border-t border-[var(--rule-on-dark)] text-[1rem] leading-[1.4] bar:text-body">
                    {p.offer.map((o) => (
                      <li key={o} className="border-b border-[var(--rule-on-dark)] py-3 bar:py-2.5">
                        {o}
                      </li>
                    ))}
                  </ul>
                </div>

                {p.stack.length > 0 && (
                  <div className="pt-9 bar:col-span-7 bar:row-start-2 bar:pt-0">
                    <h2
                      className="u-display text-[length:clamp(1.15rem,5.2vw,1.35rem)] bar:text-[length:clamp(1rem,1.6vw,1.35rem)]"
                      style={{ ["--wdth" as string]: 100 }}
                    >
                      What do we build with?
                    </h2>
                    <ul className="u-meta mt-3 flex flex-wrap gap-x-3 gap-y-2 text-muted-dark">
                      {p.stack.map((t, i) => (
                        <li key={t} className="flex items-center gap-3">
                          {i > 0 && <span aria-hidden="true" className="text-paper/45">/</span>}
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <Plate
              src={p.detail.src}
              alt={p.detail.alt}
              sizes="(min-width: 48rem) 55vw, 1px"
              scale
              className="hidden bar:col-span-7 bar:row-start-3 bar:block"
            />
          </div>
        </section>
      </main>

      <Footer home="/" />
      <script type="application/ld+json" dangerouslySetInnerHTML={ldJson(ld)} />
    </>
  );
}
