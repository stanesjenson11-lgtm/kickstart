"use client";

import Image from "next/image";
import { work, type Project } from "@/lib/content";
import { useGsap, gsap } from "@/lib/motion";

/** The cut, as a pair of complementary masks — the halves offset on hover. */
const TOP = "polygon(0 0, 100% 0, 100% 44.6%, 0 56.6%)";
const BOTTOM = "polygon(0 56%, 100% 44%, 100% 100%, 0 100%)";

function Slab({ p }: { p: Project }) {
  return (
    <article className="group flex h-full w-[86vw] shrink-0 flex-col justify-center gap-6 px-4 md:w-[62vw] lg:w-[46vw]">
      {/* Stacked, the plate is aspect-locked. In the horizontal run it must
          instead fill whatever height is left after the caption, or a 3:4 plate
          overshoots the track and pushes the text off the bottom. */}
      <div className="relative aspect-4/5 w-full overflow-hidden bg-paper-warm md:aspect-3/4 lg:aspect-auto lg:min-h-0 lg:flex-1">
        {/* Two halves of the same photograph, split along the cut. */}
        {[TOP, BOTTOM].map((clip, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-transform duration-700 ease-[var(--ease-out-expo)]"
            style={{ clipPath: clip }}
          >
            <Image
              src={p.src}
              alt={i === 0 ? p.alt : ""}
              aria-hidden={i === 1}
              fill
              sizes="(max-width: 768px) 86vw, (max-width: 1024px) 62vw, 46vw"
              className={`work-half object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] ${
                i === 0
                  ? "group-hover:-translate-x-[14px]"
                  : "group-hover:translate-x-[14px]"
              }`}
              style={{ filter: "grayscale(1) contrast(1.06)" }}
            />
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-baseline gap-4 u-meta text-muted-light">
          <span>{p.index}</span>
          <span aria-hidden="true">/</span>
          <span>{p.category}</span>
        </div>
        <h3 className="u-display mt-3 text-h3" style={{ ["--wdth" as string]: 100 }}>
          {p.client}
        </h3>
        <p className="mt-3 max-w-[46ch] text-body text-muted-light">{p.blurb}</p>
        <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1 u-meta text-muted-light">
          {p.services.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}

/**
 * Selected work runs sideways. The brief bans a thumbnail grid, so each project
 * gets a full-height editorial slab and the page turns rather than scrolls —
 * which also makes the section the site's one deliberate change of axis.
 *
 * Below 1024px, and under reduced motion, the same slabs stack vertically.
 * The layout is a real column in the markup; the horizontal run is added on top.
 */
export default function Work() {
  const scope = useGsap<HTMLElement>(({ self }) => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      const track = self.querySelector<HTMLElement>(".work-track");
      if (!track) return;

      const distance = () => track.scrollWidth - window.innerWidth;

      gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: self,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.7,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={scope}
      id="work"
      className="cut-top on-paper relative overflow-x-clip bg-paper text-ink"
    >
      <div className="flex flex-col lg:h-[100svh]">
        <header className="flex shrink-0 items-end justify-between gap-6 px-gutter pb-8 pt-section lg:pt-28">
          <h2 className="u-display text-h1 max-w-[14ch]" style={{ ["--wdth" as string]: 108 }}>
            {work.headline}
          </h2>
          <p className="u-meta hidden shrink-0 text-muted-light lg:block">
            {work.label} — {String(work.projects.length).padStart(2, "0")} projects
          </p>
        </header>

        <div className="work-track flex flex-col gap-16 px-gutter pb-section lg:min-h-0 lg:flex-1 lg:flex-row lg:gap-0 lg:pb-14 lg:pr-[30vw]">
          {work.projects.map((p) => (
            <Slab key={p.index} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
