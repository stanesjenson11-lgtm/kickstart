"use client";

import { statement } from "@/lib/content";
import { useGsap, gsap, SplitText } from "@/lib/motion";

/**
 * The counter-drench: the first white after a black hero, wiped in along the cut.
 *
 * The headline resolves word by word against scroll position rather than on a
 * timer, so the visitor sets their own reading pace — the sentence arrives as
 * fast as they scroll and stops when they stop.
 */
export default function Statement() {
  const scope = useGsap<HTMLElement>(({ self }) => {
    const h = self.querySelector<HTMLElement>(".statement-h");
    if (!h) return;

    const split = new SplitText(h, { type: "words", wordsClass: "st-word" });

    gsap.fromTo(
      split.words,
      { opacity: 0.14 },
      {
        opacity: 1,
        ease: "none",
        stagger: 0.4,
        scrollTrigger: {
          trigger: self,
          start: "top 72%",
          end: "center 52%",
          scrub: 0.5,
        },
      },
    );

    gsap.from(self.querySelector(".statement-body"), {
      opacity: 0,
      y: 24,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: self, start: "top 55%" },
    });
  }, []);

  return (
    <section
      ref={scope}
      className="cut-top on-paper relative bg-paper text-ink"
    >
      <div className="px-gutter py-section-lg">
        <h2 className="statement-h u-display text-h1 max-w-[17ch]" style={{ ["--wdth" as string]: 104 }}>
          {statement.headline}
        </h2>
        <p className="statement-body u-measure mt-12 text-body text-muted-light md:mt-16 md:ml-[38%]">
          {statement.body}
        </p>
      </div>
    </section>
  );
}
