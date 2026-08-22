"use client";

import { process } from "@/lib/content";
import { useGsap, gsap } from "@/lib/motion";

/**
 * The one place on this site where numbered markers are legitimate: this
 * section genuinely is a sequence, and the order carries information. A hairline
 * draws down the column as you scroll and each step latches in as the line
 * reaches it, so the progression is shown rather than merely labelled.
 */
export default function Process() {
  const scope = useGsap<HTMLElement>(({ self }) => {
    const line = self.querySelector<HTMLElement>(".proc-line");

    if (line) {
      gsap.fromTo(
        line,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          transformOrigin: "top",
          scrollTrigger: {
            trigger: self.querySelector(".proc-list"),
            start: "top 72%",
            end: "bottom 72%",
            scrub: 0.5,
          },
        },
      );
    }

    self.querySelectorAll<HTMLElement>(".proc-step").forEach((step) => {
      gsap.from(step, {
        opacity: 0.72,
        x: -14,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: { trigger: step, start: "top 78%", end: "top 58%", scrub: 0.4 },
      });
    });
  }, []);

  return (
    <section ref={scope} className="bg-ink px-gutter py-section">
      <h2 className="u-display text-h1" style={{ ["--wdth" as string]: 108 }}>
        {process.headline}
      </h2>

      <div className="proc-list relative mt-16 pl-8 md:pl-16">
        {/* The rule the steps hang from. */}
        <span
          aria-hidden="true"
          className="absolute left-0 top-0 h-full w-px bg-[var(--rule-on-dark)]"
        />
        <span
          aria-hidden="true"
          className="proc-line absolute left-0 top-0 h-full w-px origin-top bg-paper"
        />

        <ol>
          {process.steps.map((s) => (
            <li
              key={s.index}
              className="proc-step grid gap-2 border-b border-[var(--rule-on-dark)] py-8 last:border-b-0 md:grid-cols-[6rem_14rem_1fr] md:items-baseline md:gap-8"
            >
              <span className="u-meta text-muted-dark">{s.index}</span>
              <h3 className="u-display text-h3" style={{ ["--wdth" as string]: 98 }}>
                {s.title}
              </h3>
              <p className="text-body text-muted-dark">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
