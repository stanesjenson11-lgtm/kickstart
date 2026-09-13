"use client";

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
      {/* Two layouts, one tree.
          Phone keeps the newspaper set: the photograph is floated and the body
          runs beside it and then on underneath.
          From `bar` up it is the original 12-column grid again — heading and
          body in columns 1-7, picture in 8-12 — reached by turning the float off
          and placing all three children explicitly, so source order can serve
          the float without disturbing the desktop arrangement.
          The clearfix is a grid item from `bar` up, so it is hidden there. */}
      <div className="w-full px-gutter py-section after:block after:clear-both after:content-[''] bar:grid bar:grid-cols-12 bar:gap-grid bar:after:hidden">
        <h2
          className="ab-fade u-display text-h1 whitespace-pre-line max-w-[64rem] bar:col-span-7 bar:col-start-1 bar:row-start-1 bar:max-w-none bar:pl-10"
          style={{ ["--wdth" as string]: 104 }}
        >
          {about.headline}
        </h2>

        {/* Before the paragraph in source order, because a float only wraps the
            content that follows it. From `bar` up the float is off and it spans
            both text rows, which is what made the picture match the text column
            height in the original layout. */}
        <Plate
          src={about.src}
          alt={about.alt}
          sizes="(min-width: 48rem) 30vw, 42vw"
          className="ab-fade float-right mt-6 mb-grid ml-grid aspect-4/5 w-[42%] max-w-[26rem] bar:col-span-5 bar:col-start-8 bar:row-span-2 bar:row-start-1 bar:m-0 bar:float-none bar:w-[88%] bar:max-w-none"
        />

        {/* Margin as classes rather than an inline style so it can differ by
            width: tight under the heading in the newspaper set, a little more
            on the desktop grid. */}
        <p
          className="ab-fade mt-[clamp(1.25rem,2.4vw,2.25rem)] hyphens-auto text-body leading-[1.85] text-justify text-muted-light max-w-[64rem] bar:col-span-7 bar:col-start-1 bar:row-start-2 bar:mt-[clamp(1.5rem,2.4vw,2.5rem)] bar:max-w-[45ch] bar:pl-10"
        >
          {about.body}
        </p>
      </div>
    </section>
  );
}
