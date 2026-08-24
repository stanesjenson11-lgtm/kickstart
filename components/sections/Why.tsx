"use client";

import { why } from "@/lib/content";
import MagnetLines from "@/components/ui/MagnetLines";
import { useGsap, gsap } from "@/lib/motion";

/**
 * Three principles, brought into focus one at a time.
 *
 * Rather than staggering three identical fades, each principle is literally
 * racked into focus as it reaches the middle of the viewport — sharp and full
 * size when it is yours to read, set back and soft when it is not. It is the
 * only place on the site that uses blur, which is what keeps it meaningful.
 */
export default function Why() {
  const scope = useGsap<HTMLElement>(({ self }) => {
    const items = self.querySelectorAll<HTMLElement>(".why-item");

    items.forEach((item) => {
      gsap.fromTo(
        item,
        { filter: "blur(5px)", opacity: 0.82, scale: 0.965 },
        {
          filter: "blur(0px)",
          opacity: 1,
          scale: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: item,
            start: "top 82%",
            end: "center 46%",
            scrub: 0.6,
          },
        },
      );
    });

    gsap.from(self.querySelectorAll<HTMLElement>(".why-line"), {
      yPercent: 110,
      duration: 1.1,
      ease: "expo.out",
      stagger: 0.08,
      scrollTrigger: { trigger: self, start: "top 62%" },
    });
  }, []);

  return (
    <section ref={scope} className="relative overflow-hidden bg-ink px-gutter py-section">
      {/* A lighting grid, turning to follow the pointer. */}
      <div className="pointer-events-none absolute inset-0">
        <MagnetLines rows={7} columns={13} lineHeight="26px" lineWidth="2px" />
      </div>
      <div className="relative">
        <h2 className="u-display text-h1 max-w-[18ch]" style={{ ["--wdth" as string]: 106 }}>
          {why.headline.map((line) => (
            <span key={line} className="block overflow-hidden pb-[0.06em]">
              <span className="why-line block">{line}</span>
            </span>
          ))}
        </h2>

        <ol className="mt-section grid gap-14 md:grid-cols-3 md:gap-10">
          {why.principles.map((p) => (
            <li key={p.index} className="why-item border-t border-[var(--rule-on-dark)] pt-6">
              <div className="u-meta text-muted-dark">{p.index}</div>
              <h3 className="u-display mt-4 text-h3" style={{ ["--wdth" as string]: 98 }}>
                {p.title}
              </h3>
              <p className="mt-3 text-body text-muted-dark">{p.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
