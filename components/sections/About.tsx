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
      data-frame
      // 100svh PLUS the cut, because a frame lands below the diagonal: the
      // visible frame is then exactly 100svh of clean section with none of the
      // next one showing. items-center resolves against the content box, which
      // cut-top's padding has already reduced to precisely that frame.
      className="cut-top on-paper relative flex min-h-[calc(100svh+var(--cut-drop))] items-center bg-paper-warm text-ink"
    >
      {/* Newspaper set: one text column with the photograph floated into it, so
          the body runs beside the picture and then on underneath it rather than
          stopping short in a column of its own.

          max-w caps the measure — the body would otherwise set to the full
          content width on a desktop and run well past a readable line. */}
      <div className="w-full px-gutter py-section after:block after:clear-both after:content-['']">
        <h2
          className="ab-fade u-display text-h1 max-w-[64rem]"
          style={{ ["--wdth" as string]: 104 }}
        >
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

        {/* Floated, and before the paragraph in source order — a float only
            wraps the content that follows it. The section's own max-w-[64rem]
            measure lives on both children so the picture cannot drift away
            from the text on a wide screen. */}
        <Plate
          src={about.src}
          alt={about.alt}
          sizes="(min-width: 64rem) 26rem, 42vw"
          className="plate-colour ab-fade float-right mt-6 mb-grid ml-grid aspect-4/5 w-[42%] max-w-[26rem]"
        />

        <p
          className="ab-fade hyphens-auto text-body text-justify text-muted-light max-w-[64rem]"
          style={{ marginTop: "clamp(1.25rem, 2.4vw, 2.25rem)" }}
        >
          {about.body}
        </p>
      </div>
    </section>
  );
}
