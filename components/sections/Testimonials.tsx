"use client";

import { testimonials } from "@/lib/content";
import { useGsap, gsap, SplitText } from "@/lib/motion";

/**
 * Large quotation typography, not review cards — the brief bans the card
 * treatment here. Each quote resolves word by word against scroll, the same
 * mechanic as the brand statement, because both are sentences meant to be read
 * at the reader's own pace rather than delivered.
 *
 * Real testimonials only: renders nothing until `testimonials` has entries.
 */
export default function Testimonials() {
  const scope = useGsap<HTMLElement>(({ self }) => {
    self.querySelectorAll<HTMLElement>(".quote").forEach((q) => {
      const split = new SplitText(q, { type: "words" });
      gsap.fromTo(
        split.words,
        { opacity: 0.16 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.4,
          scrollTrigger: { trigger: q, start: "top 78%", end: "bottom 58%", scrub: 0.5 },
        },
      );
    });
  }, []);

  if (testimonials.length === 0) return null;

  return (
    <section ref={scope} className="bg-ink px-gutter py-section">
      <div className="flex flex-col gap-section">
        {testimonials.map((t, i) => (
          <figure key={t.name} className={i % 2 === 1 ? "md:ml-auto md:w-[72%]" : "md:w-[80%]"}>
            <blockquote
              className="quote u-display text-h2"
              style={{ ["--wdth" as string]: 96 }}
            >
              &ldquo;{t.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-8 border-t border-[var(--rule-on-dark)] pt-5 u-meta text-muted-dark">
              <span className="text-paper">{t.name}</span>
              <span className="mx-3" aria-hidden="true">/</span>
              {t.role}
              <span className="mx-3" aria-hidden="true">/</span>
              {t.company}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
