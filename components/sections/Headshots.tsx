"use client";

import { headshots } from "@/lib/content";
import Plate from "@/components/ui/Plate";
import { useGsap, gsap } from "@/lib/motion";

/**
 * One exceptional portrait, unmasked along the cut and pushed in slowly.
 * The grid is broken here on purpose: the plate runs past the gutter and the
 * copy sits low against it, so the composition reads as art direction rather
 * than as a two-column template.
 */
export default function Headshots() {
  const scope = useGsap<HTMLElement>(({ self }) => {
    gsap.from(self.querySelectorAll<HTMLElement>(".hs-fade"), {
      opacity: 0,
      y: 26,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.08,
      scrollTrigger: { trigger: self, start: "top 62%" },
    });
  }, []);

  return (
    <section ref={scope} className="relative bg-ink py-section">
      <div className="grid items-end gap-10 px-gutter md:grid-cols-12 md:gap-8">
        <Plate
          src={headshots.src}
          alt={headshots.alt}
          scale
          sizes="(max-width: 768px) 100vw, 55vw"
          className="aspect-3/4 md:col-span-7 md:-ml-gutter md:aspect-4/5"
        />

        <div className="md:col-span-5 md:pb-10">
          <h2 className="hs-fade u-display text-h1" style={{ ["--wdth" as string]: 100 }}>
            {headshots.headline}
          </h2>
          <p className="hs-fade u-measure mt-6 text-body text-muted-dark">{headshots.body}</p>

          <ul className="hs-fade mt-8 flex flex-wrap gap-x-4 gap-y-2 u-meta text-muted-dark">
            {headshots.tags.map((t, i) => (
              <li key={t} className="flex items-center gap-4">
                {i > 0 && <span aria-hidden="true" className="text-paper/45">/</span>}
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
