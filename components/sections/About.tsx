"use client";

import Image from "next/image";
import { about } from "@/lib/content";
import Plate from "@/components/ui/Plate";
import { useGsap, gsap } from "@/lib/motion";

/**
 * Restrained by design: the headline carries the weight and the copy stays
 * short, so the section reads as a statement rather than a company profile.
 */
export default function About() {
  const scope = useGsap<HTMLElement>(({ self }) => {
    gsap.from(self.querySelectorAll<HTMLElement>(".ab-fade"), {
      opacity: 0,
      y: 24,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.08,
      scrollTrigger: { trigger: self, start: "top 68%" },
    });
  }, []);

  return (
    <section
      ref={scope}
      id="about"
      className="cut-top on-paper relative bg-paper-warm text-ink"
    >
      <div className="grid gap-12 px-gutter py-section md:grid-cols-12 md:gap-8">
        {/* Indented from md up so the heading and body sit in off the gutter.
            Padding, not margin — the column keeps its track width, and the body
            is capped at 45ch so only the heading sees the narrower space. */}
        <div className="md:col-span-7 md:pl-10">
          <h2 className="ab-fade u-display text-h1" style={{ ["--wdth" as string]: 104 }}>
            {about.headline}{" "}
            {/* Height in em, not a clamp: it tracks the heading's own fluid
                font-size for free. The file is cropped to its ink bounds, so a
                baseline-aligned 0.72em lands the wordmark on the cap height of
                the word beside it. Black mark — this section is on paper. */}
            <Image
              src="/ks black.png"
              alt="Kickstart"
              width={1000}
              height={128}
              sizes="400px"
              className="inline h-[0.72em] w-auto align-baseline"
            />
          </h2>
          {/* An explicit margin, not mt-auto in a flex column: the plate beside
              this is a stretched grid item, so its aspect-ratio height is
              discarded and the row never ends up taller than this text — there
              is no free space for mt-auto to distribute.
              Inline clamp rather than a Tailwind class so the value is readable
              as one number: 72px floor on mobile, ~86px at 1440, capped at 112.
              maxWidth replaces u-measure's 62ch: the body is 366 characters, so
              ~52 per line lands 7 lines, and 45ch is about that once "0" advance
              is converted to average character width. Approximate by nature —
              line count moves with the loaded font.
              hyphens-auto because justified text opens rivers without it. */}
          <p
            className="ab-fade hyphens-auto text-body text-justify text-muted-light"
            style={{ marginTop: "clamp(4.5rem, 6vw, 7rem)", maxWidth: "45ch" }}
          >
            {about.body}
          </p>
        </div>

        {/* Back to a 5-column track but held at 88% of it, which lands between
            the old 5-column and 4-column sizes. Setting an explicit width also
            drops justify-self from stretch to start, so the plate shifts left off
            the right edge by the 12% it gives up — one change, both effects. */}
        <Plate
          src={about.src}
          alt={about.alt}
          sizes="(max-width: 768px) 100vw, 30vw"
          className="plate-colour aspect-4/5 md:col-span-5 md:w-[88%]"
        />
      </div>
    </section>
  );
}
