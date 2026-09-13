"use client";

import { statement } from "@/lib/content";
import { useGsap, gsap } from "@/lib/motion";

/**
 * The dark studio, where the projector shot lands.
 *
 * As the projector arrives the section drenches from paper to ink, and the
 * headline is lit where the beam falls on it. Every value the shot animates is
 * a custom property on this section, and the CSS defaults (`.st-stage` in
 * globals.css) are the shot's END state: dark, fully lit. So without JS, under
 * reduced motion, or if the shot never mounts, the section is finished and
 * legible — the timeline applies the from-state only once it is running.
 *
 * The lit headline is a second, aria-hidden copy stacked on the real h2 in the
 * same grid cell. The heading stays a single real element for assistive tech
 * and indexing; the light is a mask over its twin.
 *
 * Only `.on-paper` is ever toggled (by the shot, for the navbar). `.on-ink` is
 * deliberately absent: it adds line-height to paragraphs, and switching it
 * mid-pin would visibly reflow the body copy.
 */
export default function Statement() {
  const scope = useGsap<HTMLElement>(({ self }) => {
    gsap.from(self.querySelector(".statement-body"), {
      opacity: 0,
      y: 24,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: self, start: "top 55%" },
    });
  }, []);

  const head = "u-display text-h1 max-w-[17ch] [grid-area:1/1]";
  const wdth = { ["--wdth" as string]: 104 };

  return (
    <section
      ref={scope}
      id="statement"
      // min-h: the shot pins this section, and a pinned frame shorter than the
      // screen would leave the page's ground showing beneath it.
      className="st-stage cut-top relative min-h-[100svh]"
    >
      <div className="relative z-[var(--z-content)] px-gutter py-section-lg">
        <div className="grid">
          <h2 className={`st-base ${head}`} style={wdth}>
            {statement.headline}
          </h2>
          <div
            aria-hidden="true"
            className={`st-lit pointer-events-none select-none ${head}`}
            style={wdth}
          >
            {statement.headline}
          </div>
        </div>
        <p className="statement-body st-body u-measure mt-12 text-body md:mt-16 md:ml-[38%]">
          {statement.body}
        </p>
      </div>
    </section>
  );
}
