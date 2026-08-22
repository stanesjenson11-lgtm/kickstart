"use client";

import { hero } from "@/lib/content";
import HeroCanvas from "@/components/gl/HeroCanvas";
import MagneticButton from "@/components/ui/MagneticButton";
import { useGsap, gsap } from "@/lib/motion";

export default function Hero() {
  const scope = useGsap<HTMLElement>(({ self }) => {
    const lines = self.querySelectorAll<HTMLElement>(".hero-line > span");
    const rest = self.querySelectorAll<HTMLElement>(".hero-fade");

    // Entrance: the headline rises through its own mask, line by line.
    gsap
      .timeline({ delay: 0.15 })
      .from(lines, {
        yPercent: 118,
        duration: 1.25,
        ease: "expo.out",
        stagger: 0.09,
      })
      .from(rest, { opacity: 0, y: 18, duration: 0.9, ease: "power3.out", stagger: 0.07 }, "-=0.75");

    // Scroll: the headline narrows on the width axis instead of just shrinking.
    gsap.to(self.querySelectorAll<HTMLElement>(".hero-line"), {
      ["--wdth"]: 84,
      ease: "none",
      scrollTrigger: { trigger: self, start: "top top", end: "bottom top", scrub: 0.4 },
    });

    gsap.to(self.querySelector(".hero-copy"), {
      yPercent: 26,
      opacity: 0,
      ease: "none",
      scrollTrigger: { trigger: self, start: "top top", end: "bottom top", scrub: 0.4 },
    });
  }, []);

  return (
    <section
      ref={scope}
      id="top"
      className="grain relative flex min-h-[100svh] flex-col justify-end overflow-hidden"
    >
      <HeroCanvas plates={hero.plates} />

      {/* The plates are bright through the middle; white type needs ground. */}
      <div
        aria-hidden="true"
        className="hero-scrim pointer-events-none absolute inset-x-0 bottom-0 top-1/4 z-[var(--z-media)]"
      />

      <div className="hero-copy relative z-[var(--z-content)] px-gutter pb-14 pt-32">
        <h1 className="u-display text-display max-w-[13ch]">
          {hero.headline.map((line) => (
            /* The mask is clipped, so it carries padding the glyphs can descend
               into — otherwise the full stop on "remarkable." is sheared off. */
            <span key={line} className="hero-line block overflow-hidden pb-[0.16em] -mb-[0.13em]">
              <span className="block">{line}</span>
            </span>
          ))}
        </h1>

        <p className="hero-fade u-measure mt-8 text-body text-paper/85">{hero.support}</p>

        <div className="hero-fade mt-10 flex flex-wrap items-center gap-4">
          <MagneticButton href={hero.primary.href} variant="solid">
            {hero.primary.label}
          </MagneticButton>
          <MagneticButton href={hero.secondary.href} variant="ghost">
            {hero.secondary.label}
          </MagneticButton>
        </div>
      </div>

      {/* Slate line: the disciplines, read as production metadata. */}
      <div className="hero-fade relative z-[var(--z-content)] border-t border-[var(--rule-on-dark)] px-gutter">
        <ul className="flex flex-wrap items-center gap-x-8 gap-y-2 py-5 u-meta text-muted-dark">
          {hero.disciplines.map((d, i) => (
            <li key={d} className="flex items-center gap-8">
              {i > 0 && <span aria-hidden="true" className="text-paper/45">/</span>}
              {d}
            </li>
          ))}
          <li className="ml-auto hidden items-center gap-3 sm:flex" aria-hidden="true">
            Scroll
            <span className="block h-px w-10 bg-current" />
          </li>
        </ul>
      </div>
    </section>
  );
}
