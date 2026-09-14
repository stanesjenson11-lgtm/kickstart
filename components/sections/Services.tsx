"use client";

import { useState } from "react";
import Image from "next/image";
import { services } from "@/lib/content";
import { useGsap, gsap, ScrollTrigger } from "@/lib/motion";

/**
 * White ground, black type — the one light section on the page.
 *
 * Hairlines, not cards — the brief is explicit that this section must not
 * become a card grid. The headline sticks while the four groups pass it, and
 * the group in play bleeds its own image in behind the whole section, so the
 * list stays a list and the imagery still gets to do the selling.
 *
 * The group in play follows the scroll: moving down the list selects each group
 * in turn. Pointing at or focusing a group previews it instead, and letting go
 * hands back to the scroll. The text stands alone without any of it.
 */
export default function Services() {
  const [inView, setInView] = useState<number | null>(null);
  const [pointed, setPointed] = useState<number | null>(null);
  const active = pointed ?? inView;

  const scope = useGsap<HTMLElement>(({ self }) => {
    gsap.from(self.querySelectorAll<HTMLElement>(".svc-group"), {
      opacity: 0,
      y: 40,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.12,
      scrollTrigger: { trigger: self, start: "top 68%" },
    });

    // The list's scroll range, shared out evenly between the groups. Nothing is
    // selected above the list; past it, the last group stays.
    //
    // The reading line sits high, at 15% of the screen, so a frame snapped
    // flush opens on the first group and the rest follow as the page moves on.
    const n = services.groups.length;
    ScrollTrigger.create({
      trigger: self.querySelector(".svc-list"),
      start: "top 15%",
      end: "bottom 15%",
      onUpdate: (st) =>
        setInView(st.progress <= 0 ? null : Math.min(n - 1, Math.floor(st.progress * n))),
    });
  }, []);

  return (
    <section
      ref={scope}
      id="services"
      data-frame
      className="on-paper relative min-h-[100svh] overflow-hidden bg-paper text-ink"
    >
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
            style={{ opacity: active === i ? 0.5 : 0 }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-paper via-paper/40 to-paper" />
      </div>

      {/* pt-24 on a phone: the section's own padding would park the heading
          under the nav pill, which ends 80px down. */}
      <div className="relative z-[var(--z-content)] px-gutter pt-24 pb-section bar:py-section">
        {/* Phone: heading across the top, the same single column of groups
            beneath it, set smaller and tighter so the section fits one screen.
            The groups' type and spacing follow the screen's height (svh): a
            640px-tall phone gets the compact set, a tall one fills its frame.
            From `bar` up it is the sticky sidebar beside that column — `lg:`
            could not carry that any more, since the lg breakpoint is
            effectively always on. */}
        <div className="bar:flex bar:gap-[clamp(1rem,4.4vw,4rem)]">
          <div className="bar:sticky bar:top-28 bar:h-fit bar:w-[38%] bar:shrink-0">
            <p className="u-meta mt-6">{services.label}</p>
            <h2 className="u-display text-h2 bar:text-h1" style={{ ["--wdth" as string]: 106 }}>
              {services.headline}
            </h2>
          </div>

          <div className="svc-list mt-6 bar:mt-0 bar:flex-1">
            {services.groups.map((g, i) => (
              <div
                key={g.title}
                className="svc-group border-t border-[var(--rule-on-light)] py-[clamp(0.75rem,calc(5svh_-_1.25rem),1.5rem)] last:border-b bar:py-8"
                onPointerEnter={() => setPointed(i)}
                onPointerLeave={() => setPointed(null)}
                onFocusCapture={() => setPointed(i)}
                onBlurCapture={() => setPointed(null)}
              >
                <h3
                  className="u-display text-h3 max-bar:text-[length:clamp(1rem,2.5svh,1.25rem)] max-bar:leading-tight transition-transform duration-500 ease-[var(--ease-out-expo)]"
                  style={{
                    ["--wdth" as string]: 100,
                    transform: active === i ? "translateX(10px)" : "none",
                  }}
                >
                  {g.title}
                </h3>
                <ul className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[length:clamp(0.875rem,2.1svh,1rem)]/[1.4] bar:mt-4 bar:gap-x-6 bar:gap-y-2 bar:text-body">
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
