"use client";

import { events } from "@/lib/content";
import MagneticButton from "@/components/ui/MagneticButton";
import MediaCarousel from "@/components/ui/MediaCarousel";
import MetaBalls from "@/components/gl/MetaBalls";
import { useGsap, gsap } from "@/lib/motion";

/**
 * The gallery carries the section, not a paragraph about it: a swipeable
 * coverflow of real event coverage under one short headline. See Why.tsx for
 * the same line-reveal this borrows.
 */
export default function Events() {
  const scope = useGsap<HTMLElement>(({ self }) => {
    gsap.from(self.querySelectorAll<HTMLElement>(".ev-line"), {
      yPercent: 110,
      duration: 1.1,
      ease: "expo.out",
      stagger: 0.08,
      scrollTrigger: { trigger: self, start: "top 70%" },
    });
    gsap.from(self.querySelector(".ev-gallery"), {
      opacity: 0,
      y: 24,
      duration: 0.9,
      ease: "power2.out",
      scrollTrigger: { trigger: self, start: "top 55%" },
    });
  }, []);

  return (
    <section ref={scope} className="grain relative overflow-hidden bg-ink px-gutter py-section">
      {/* Ink pooling behind the headline. Renders only while on screen. */}
      <div className="pointer-events-none absolute inset-0 opacity-50">
        <MetaBalls count={7} scale={30} />
      </div>

      <div className="relative">
        <h2 className="u-display text-h1 max-w-[15ch]" style={{ ["--wdth" as string]: 108 }}>
          {events.headline.map((line) => (
            <span key={line} className="block overflow-hidden pb-[0.06em]">
              <span className="ev-line block">{line}</span>
            </span>
          ))}
        </h2>

        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-1 u-meta text-muted-dark">
          {events.categories.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>

        <div className="ev-gallery mt-14">
          <MediaCarousel items={[...events.gallery]} />
        </div>

        <div className="mt-6">
          <MagneticButton href={events.cta.href} variant="solid">
            {events.cta.label}
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
