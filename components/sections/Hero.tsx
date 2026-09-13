"use client";

import { hero } from "@/lib/content";
import HeroCanvas from "@/components/gl/HeroCanvas";
import MagneticButton from "@/components/ui/MagneticButton";
import { useGsap, gsap } from "@/lib/motion";

/** Phone-only size-down for the two CTAs. The label size goes through the
    variable because .u-meta is unlayered and beats a Tailwind text utility. */
const PHONE_BTN = "max-phone:px-4 max-phone:py-3 max-phone:[--text-meta:0.68rem]";

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
      data-frame
      // Phone: one screen PLUS the cut. Statement rides up over this section by
      // --cut-drop, so at exactly 100svh its diagonal showed along the bottom of
      // the first screen. The extra height and matching bottom padding move that
      // overlap below the fold; the content still ends at 100svh.
      className="grain relative flex min-h-[100svh] flex-col justify-end overflow-hidden max-phone:min-h-[calc(100svh+var(--cut-drop))] max-phone:pb-(--cut-drop)"
    >
      <HeroCanvas
        plates={hero.plates}
        portraitPlates={hero.platesPortrait}
        fog={hero.fog}
        masks={hero.shot.masks}
      />

      {/* The plates are bright through the middle; white type needs ground.
          On a phone only the buttons and slate at the foot need it — the
          headline sits on the photo's own black, and a scrim from a quarter
          down would have dimmed the projector. */}
      <div
        aria-hidden="true"
        className="hero-scrim pointer-events-none absolute inset-x-0 bottom-0 top-1/4 z-[var(--z-media)] max-phone:top-auto max-phone:h-[40%]"
      />

      {/* Phone: a full-height column — headline and support in the dark sky
          above the projector, buttons pushed to the foot by mt-auto.
          pt is in svh because the projector sits at a fixed ~53% of the plate's
          height: 24svh keeps the copy clear of it from a 667px SE (about 50px of
          air) up to a 932px Pro Max (about 150px), and still clears the 84px
          navbar on a 568px screen, where a fixed length would either crowd the
          short phones or float too high on the tall ones. */}
      <div className="hero-copy relative z-[var(--z-content)] px-gutter pb-14 pt-32 max-phone:flex max-phone:flex-1 max-phone:flex-col max-phone:pb-4 max-phone:pt-[24svh]">
        <h1 className="u-display text-display max-w-[13ch]">
          {hero.headline.map((line) => (
            /* The mask is clipped, so it carries padding the glyphs can descend
               into — otherwise the full stop on "remarkable." is sheared off. */
            <span key={line} className="hero-line block overflow-hidden pb-[0.16em] -mb-[0.13em]">
              <span className="block">{line}</span>
            </span>
          ))}
        </h1>

        <p className="hero-fade u-measure mt-8 text-body text-paper/85 max-phone:mt-4">
          {hero.support}
        </p>

        <div className="hero-fade mt-10 flex flex-wrap items-center gap-4 max-phone:mt-auto max-phone:gap-2.5">
          <MagneticButton href={hero.primary.href} variant="solid" className={PHONE_BTN}>
            {hero.primary.label}
          </MagneticButton>
          <MagneticButton href={hero.secondary.href} variant="ghost" className={PHONE_BTN}>
            {hero.secondary.label}
          </MagneticButton>
        </div>
      </div>

      {/* Slate line: the disciplines, read as production metadata.

          Phone: all five on one line, edge to edge. Martian Mono advances 0.70em
          a glyph and the five plus four slashes are 52 glyphs, so the line is
          52 x (0.70 + tracking) x size + 8 gaps. With tracking at 0.02em and 3px
          gaps that is 37.44 x size + 24px, which has to fit the full viewport
          once the side padding is gone: the largest size that does is
          (100vw - 24px) / 37.44. 2.55vw - 0.5px sits about 11px under that on a
          360px phone. Floored so a 320px screen still fits, capped below the
          old size.
          nowrap is load-bearing: "Media production" has a space in it, and a
          flex item may otherwise shrink to its min-content and break there.
          justify-center shares out the slack so the words sit off the edges.
          Size and tracking are forced past .u-meta, which is unlayered: the
          size through its variable, the tracking with `!`. */}
      <div className="hero-fade relative z-[var(--z-content)] border-t border-[var(--rule-on-dark)] px-gutter max-phone:px-0">
        <ul className="flex flex-wrap items-center gap-x-8 gap-y-2 py-5 u-meta text-muted-dark max-phone:flex-nowrap max-phone:justify-center max-phone:gap-x-[3px] max-phone:py-3 max-phone:whitespace-nowrap max-phone:tracking-[0.02em]! max-phone:[--text-meta:clamp(0.47rem,2.55vw_-_0.5px,0.72rem)]">
          {hero.disciplines.map((d, i) => (
            <li key={d} className="flex items-center gap-8 max-phone:gap-[3px]">
              {i > 0 && <span aria-hidden="true" className="text-paper/45">/</span>}
              {d}
            </li>
          ))}
          <li className="ml-auto hidden items-center gap-3 bar:flex" aria-hidden="true">
            Scroll
            <span className="block h-px w-10 bg-current" />
          </li>
        </ul>
      </div>
    </section>
  );
}
