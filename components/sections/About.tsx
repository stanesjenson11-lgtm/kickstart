"use client";

import { about } from "@/lib/content";
import Plate from "@/components/ui/Plate";
import { useGsap, gsap } from "@/lib/motion";

/**
 * Restrained by design: this is the one section where the brief asks for the
 * registration detail to stay secondary, so the facts are set as slate metadata
 * in mono and the headline keeps the weight.
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
          <p className="ab-fade u-meta text-muted-light">{about.label}</p>
          <h2 className="ab-fade u-display mt-6 text-h1" style={{ ["--wdth" as string]: 104 }}>
            {about.headline}
          </h2>
          <p className="ab-fade u-measure mt-8 text-body text-muted-light">{about.body}</p>

          <dl className="ab-fade mt-12 flex flex-wrap gap-x-14 gap-y-4">
            {about.facts.map((f) => (
              <div key={f.key}>
                <dt className="u-meta text-muted-light">{f.key}</dt>
                <dd className="u-meta mt-2 text-ink">{f.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <Plate
          src={about.src}
          alt={about.alt}
          sizes="(max-width: 768px) 100vw, 34vw"
          className="aspect-4/5 md:col-span-5"
        />
      </div>
    </section>
  );
}
