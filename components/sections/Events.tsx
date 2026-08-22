"use client";

import Image from "next/image";
import { events } from "@/lib/content";
import MagneticButton from "@/components/ui/MagneticButton";
import { useGsap, gsap } from "@/lib/motion";

/**
 * Full-bleed and pinned: the frame holds while the categories cycle through it
 * one at a time, which is the section's argument made structurally — the moment
 * stops, the content keeps going.
 *
 * Every category is in the markup as a list, so with no JS, no scroll, or
 * reduced motion the visitor reads all five at once.
 */
export default function Events() {
  const scope = useGsap<HTMLElement>(({ self }) => {
    const items = self.querySelectorAll<HTMLElement>(".ev-cat");
    const img = self.querySelector<HTMLElement>(".ev-img");

    const tl = gsap.timeline({
      scrollTrigger: { trigger: self, start: "top top", end: "+=180%", pin: true, scrub: 0.6 },
    });

    // Stack the categories and bring them forward one at a time.
    gsap.set(items, { position: "absolute", opacity: 0, yPercent: 60 });
    items.forEach((item, i) => {
      tl.to(item, { opacity: 1, yPercent: 0, duration: 1 }, i * 0.9).to(
        item,
        { opacity: 0, yPercent: -60, duration: 1 },
        i * 0.9 + 1,
      );
    });

    if (img) {
      gsap.fromTo(
        img,
        { scale: 1.2 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: { trigger: self, start: "top top", end: "+=180%", scrub: 0.6 },
        },
      );
    }
  }, []);

  return (
    <section ref={scope} className="grain relative h-[100svh] overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={events.src}
          alt={events.alt}
          fill
          priority={false}
          sizes="100vw"
          className="ev-img object-cover"
          style={{ filter: "grayscale(1) contrast(1.18) brightness(0.72)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/70" />
      </div>

      <div className="relative z-[var(--z-content)] flex h-full flex-col justify-end px-gutter pb-16">
        <h2 className="u-display text-h1 max-w-[15ch]" style={{ ["--wdth" as string]: 108 }}>
          {events.headline.map((l) => (
            <span key={l} className="block">
              {l}
            </span>
          ))}
        </h2>

        <ul className="relative mt-10 h-16 u-meta text-muted-dark">
          {events.categories.map((c) => (
            <li key={c} className="ev-cat text-h3 u-display text-paper" style={{ ["--wdth" as string]: 94 }}>
              {c}
            </li>
          ))}
        </ul>

        <div className="mt-4">
          <MagneticButton href={events.cta.href} variant="solid">
            {events.cta.label}
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
