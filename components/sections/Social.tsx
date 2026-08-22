"use client";

import Image from "next/image";
import { social } from "@/lib/content";
import MagneticButton from "@/components/ui/MagneticButton";
import { useGsap, gsap } from "@/lib/motion";

/**
 * Deliberately uneven: a feed, not a grid. Two interleaved rows on a 12-column
 * field, each frame a different size and offset, each drifting at its own rate.
 */
const LAYOUT = [
  { col: "md:col-start-1 md:col-span-3", top: "0rem", drift: -64, ratio: "aspect-9/16" },
  { col: "md:col-start-5 md:col-span-3", top: "6rem", drift: 44, ratio: "aspect-square" },
  { col: "md:col-start-9 md:col-span-4", top: "1.5rem", drift: 88, ratio: "aspect-4/5" },
  { col: "md:col-start-2 md:col-span-3", top: "0rem", drift: -44, ratio: "aspect-square" },
  { col: "md:col-start-6 md:col-span-4", top: "5rem", drift: 70, ratio: "aspect-4/5" },
  { col: "md:col-start-10 md:col-span-3", top: "0rem", drift: -86, ratio: "aspect-9/16" },
];

/**
 * The liveliest section on the site, and deliberately so: the argument is that
 * a brand disappears between campaigns, so this one never settles. Six frames
 * drift at six different rates as the section passes.
 *
 * White ground — the third counter-drench, and the last before the black run
 * into the CTA.
 */
export default function Social() {
  const scope = useGsap<HTMLElement>(({ self }) => {
    self.querySelectorAll<HTMLElement>(".soc-frame").forEach((frame, i) => {
      gsap.fromTo(
        frame,
        { y: -(LAYOUT[i]?.drift ?? 0) },
        {
          y: LAYOUT[i]?.drift ?? 0,
          ease: "none",
          scrollTrigger: { trigger: self, start: "top bottom", end: "bottom top", scrub: 0.8 },
        },
      );
    });

    gsap.from(self.querySelectorAll<HTMLElement>(".soc-copy"), {
      opacity: 0,
      y: 28,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.08,
      scrollTrigger: { trigger: self, start: "top 68%" },
    });
  }, []);

  return (
    <section ref={scope} className="cut-top on-paper relative overflow-hidden bg-paper text-ink">
      <div className="px-gutter py-section">
        <div className="md:flex md:items-end md:justify-between md:gap-12">
          <h2 className="soc-copy u-display text-h1 max-w-[16ch]" style={{ ["--wdth" as string]: 106 }}>
            {social.headline}
          </h2>
          <p className="soc-copy mt-6 max-w-[38ch] text-body text-muted-light md:mt-0 md:shrink-0">
            {social.body}
          </p>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-x-4 gap-y-10 md:mt-24 md:grid-cols-12 md:gap-x-6 md:gap-y-4">
          {social.formats.map((f, i) => {
            const l = LAYOUT[i];
            return (
              <figure key={f.label} className={`soc-frame ${l.col}`} style={{ marginTop: l.top }}>
                <div className={`relative ${l.ratio} w-full bg-paper-warm`}>
                  <Image
                    src={f.src}
                    alt={f.alt}
                    fill
                    sizes="(max-width: 768px) 45vw, 26vw"
                    className="object-cover"
                    style={{ filter: "grayscale(1) contrast(1.08)" }}
                  />
                </div>
                <figcaption className="mt-3 u-meta text-muted-light">{f.label}</figcaption>
              </figure>
            );
          })}
        </div>

        <div className="soc-copy mt-24">
          <MagneticButton href={social.cta.href} variant="ghost">
            {social.cta.label}
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
