"use client";

import { useState } from "react";
import Image from "next/image";
import { services } from "@/lib/content";
import { useGsap, gsap } from "@/lib/motion";

/**
 * Hairlines, not cards — the brief is explicit that this section must not
 * become a card grid. The headline sticks while the four groups pass it, and
 * the group under the pointer bleeds its own image in behind the whole section,
 * so the list stays a list and the imagery still gets to do the selling.
 *
 * The bleed is pointer-driven, so it also responds to keyboard focus; nothing
 * here is hover-only, and the text stands alone without it.
 */
export default function Services() {
  const [active, setActive] = useState<number | null>(null);

  const scope = useGsap<HTMLElement>(({ self }) => {
    gsap.from(self.querySelectorAll<HTMLElement>(".svc-group"), {
      opacity: 0,
      y: 40,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.12,
      scrollTrigger: { trigger: self, start: "top 68%" },
    });
  }, []);

  return (
    <section ref={scope} id="services" className="relative overflow-hidden bg-ink">
      {/* Bleed layer — one image per group, cross-faded. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {services.groups.map((g, i) => (
          <Image
            key={g.title}
            src={g.src}
            alt=""
            fill
            sizes="100vw"
            className="object-cover transition-opacity duration-700 ease-[var(--ease-out-expo)]"
            style={{
              filter: "grayscale(1) contrast(1.2)",
              opacity: active === i ? 0.2 : 0,
            }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/70 to-ink" />
      </div>

      <div className="relative z-[var(--z-content)] px-gutter py-section">
        <div className="lg:flex lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:h-fit lg:w-[38%] lg:shrink-0">
            <h2 className="u-display text-h1" style={{ ["--wdth" as string]: 106 }}>
              {services.headline}
            </h2>
            <p className="u-meta mt-6 text-muted-dark">{services.label}</p>
          </div>

          <div className="mt-14 flex-1 lg:mt-0">
            {services.groups.map((g, i) => (
              <div
                key={g.title}
                className="svc-group border-t border-[var(--rule-on-dark)] py-8 last:border-b"
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive(null)}
                onFocusCapture={() => setActive(i)}
                onBlurCapture={() => setActive(null)}
              >
                <h3
                  className="u-display text-h3 transition-transform duration-500 ease-[var(--ease-out-expo)]"
                  style={{
                    ["--wdth" as string]: 100,
                    transform: active === i ? "translateX(10px)" : "none",
                  }}
                >
                  {g.title}
                </h3>
                <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-body text-muted-dark">
                  {g.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
