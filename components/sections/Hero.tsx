"use client";

import { hero } from "@/lib/content";
import Image from "next/image";
import ContactSheet from "@/components/hero/ContactSheet";
import MagneticButton from "@/components/ui/MagneticButton";
import { useGsap, gsap } from "@/lib/motion";

/**
 * Four depths, each moving at its own rate on scroll:
 *
 *   0  static plate     slowest — ground seen between the frames
 *   1  contact sheet    the interactive object: infinite, magnetic, draggable
 *   2  scrim            fixed — the ground the type stands on
 *   3  headline + CTAs  fastest, and narrows on the width axis as it goes
 *
 * The sheet is the signature. Everything around it stays disciplined: no second
 * ornament, no accent colour, the same cut motif the rest of the site uses.
 */
export default function Hero() {
  const scope = useGsap<HTMLElement>(({ self }) => {
    const lines = self.querySelectorAll<HTMLElement>(".hero-line > span");
    const rest = self.querySelectorAll<HTMLElement>(".hero-fade");

    // Entrance: the sheet settles in behind, then the headline rises through
    // its own mask, line by line.
    gsap
      .timeline({ delay: 0.15 })
      .from(".hero-sheet", { opacity: 0, scale: 1.08, duration: 1.4, ease: "expo.out" }, 0)
      .from(lines, { yPercent: 118, duration: 1.25, ease: "expo.out", stagger: 0.09 }, 0.1)
      .from(
        rest,
        { opacity: 0, y: 18, duration: 0.9, ease: "power3.out", stagger: 0.07 },
        "-=0.75",
      );

    // Scroll parallax: one timeline, three rates.
    const parallax = gsap.timeline({
      scrollTrigger: { trigger: self, start: "top top", end: "bottom top", scrub: 0.4 },
    });
    parallax
      .to(".hero-plate", { yPercent: 10, ease: "none" }, 0)
      .to(".hero-sheet", { yPercent: 24, opacity: 0.25, ease: "none" }, 0)
      .to(".hero-copy", { yPercent: 34, opacity: 0, ease: "none" }, 0)
      .to(self.querySelectorAll<HTMLElement>(".hero-line"), { ["--wdth"]: 84, ease: "none" }, 0);
  }, []);

  return (
    <section
      ref={scope}
      id="top"
      className="grain relative flex min-h-[100svh] flex-col justify-end overflow-hidden"
    >
      {/* Ground showing through the gaps between frames. Static: the sheet
          covers most of it, so a live shader here cost two-thirds of the frame
          budget to render something almost nobody sees. It moved to the
          showreel, where it is full-bleed and unobstructed. */}
      <div className="hero-plate absolute inset-0">
        <Image
          src={hero.plates[0]}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ filter: "grayscale(1) contrast(1.25) brightness(0.34)" }}
        />
      </div>

      <div className="hero-sheet absolute inset-0 z-[var(--z-media)]">
        <ContactSheet frames={hero.sheet} />
      </div>

      {/* The sheet is bright and busy; white type needs ground under it. */}
      <div
        aria-hidden="true"
        className="hero-scrim pointer-events-none absolute inset-0 z-[var(--z-content)]"
      />

      <div className="hero-copy pointer-events-none relative z-[var(--z-content)] px-gutter pb-14 pt-32">
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

        <div className="hero-fade pointer-events-auto mt-10 flex flex-wrap items-center gap-4">
          <MagneticButton href={hero.primary.href} variant="solid">
            {hero.primary.label}
          </MagneticButton>
          <MagneticButton href={hero.secondary.href} variant="ghost">
            {hero.secondary.label}
          </MagneticButton>
        </div>
      </div>

      {/* Slate line: the disciplines, read as production metadata. */}
      <div className="hero-fade pointer-events-none relative z-[var(--z-content)] border-t border-[var(--rule-on-dark)] px-gutter">
        <ul className="flex flex-wrap items-center gap-x-8 gap-y-2 py-5 u-meta text-muted-dark">
          {hero.disciplines.map((d, i) => (
            <li key={d} className="flex items-center gap-8">
              {i > 0 && (
                <span aria-hidden="true" className="text-paper/45">
                  /
                </span>
              )}
              {d}
            </li>
          ))}
          <li className="ml-auto hidden items-center gap-3 sm:flex" aria-hidden="true">
            <span className="block h-px w-6 bg-current" />
            Drag to explore
          </li>
        </ul>
      </div>
    </section>
  );
}
