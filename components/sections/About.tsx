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
        <div className="md:col-span-7">
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
          {/* mt-18 = the old mt-8 plus the ~40px the dropped eyebrow label and
              its mt-6 used to occupy, so the body sits lower without the column
              — and therefore the section — getting any taller. */}
          <p className="ab-fade u-measure mt-18 text-body text-muted-light">{about.body}</p>
        </div>

        <Plate
          src={about.src}
          alt={about.alt}
          sizes="(max-width: 768px) 100vw, 34vw"
          className="plate-colour aspect-4/5 md:col-span-5"
        />
      </div>
    </section>
  );
}
