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
      // cut-top's padding has already reduced to precisely that frame. A phone
      // tops the heading instead, just clear of the nav pill (it ends at 80px).
      className="cut-top on-paper relative flex min-h-[calc(100svh+var(--cut-drop))] items-start bg-paper-warm text-ink bar:items-center"
    >
      {/* Two layouts, one tree.
          Phone keeps the newspaper set: the photograph is floated and the body
          runs beside it and then on underneath.
          From `bar` up it is the original 12-column grid again — heading and
          body as one block in columns 1-7, picture in 8-12 — reached by
          turning the float off and placing all three children explicitly, so
          source order can serve the float without disturbing the desktop
          arrangement. The 1fr rows above and below the text split whatever
          height the picture adds evenly, which is what centres the block on it.
          The clearfix is a grid item from `bar` up, so it is hidden there. */}
      <div className="w-full px-gutter pt-24 pb-section bar:py-section after:block after:clear-both after:content-[''] bar:grid bar:grid-cols-12 bar:grid-rows-[1fr_auto_auto_1fr] bar:gap-grid bar:gap-y-0 bar:after:hidden">
        {/* Desktop: heading and paragraph share one 36rem box with a common left
            edge, centred in the space between the page edge and the picture.
            justify-self centres the box in columns 1-7; `right` then shifts it
            back by half of (gutter - grid gap), because the columns start a
            gutter in from the edge but stop only a grid gap short of the picture.
            The heading's line box keeps ~7px of empty descender room under the
            caps and the paragraph's leading adds ~8px over its first line;
            -mb-2 cancels one (`!` because the unlayered h2 { margin: 0 }
            outranks margin utilities), and -top-2.5 then lifts the heading
            alone by 10px, leaving the paragraph where it is: ~18px visible gap. */}
        <h2
          className="ab-fade u-display text-h1 whitespace-pre-line max-w-[64rem] bar:col-span-7 bar:col-start-1 bar:row-start-2 bar:max-w-none bar:w-[min(36rem,100%)] bar:justify-self-center bar:relative bar:right-[calc((var(--spacing-gutter)_-_var(--spacing-grid))/2)] bar:-top-2.5 bar:-mb-2!"
          style={{ ["--wdth" as string]: 104 }}
        >
          {about.headline}
        </h2>

        {/* Before the paragraph in source order, because a float only wraps the
            content that follows it. From `bar` up the float is off and it spans
            every row, so the picture sets the height the text centres in. */}
        <Plate
          src={about.src}
          alt={about.alt}
          sizes="(min-width: 48rem) 30vw, 42vw"
          className="ab-fade float-right mt-16 mb-grid ml-grid aspect-4/5 w-[42%] max-w-[26rem] bar:col-span-5 bar:col-start-8 bar:row-span-4 bar:row-start-1 bar:m-0 bar:float-none bar:w-[88%] bar:max-w-none"
        />

        {/* Padding, not margin: the global `p { margin: 0 }` is unlayered, so it
            outranks every margin utility. A phone sets the paragraph well clear
            of the heading and the photo's mt-16 drops with it. On desktop it sits
            directly under the heading in the same 36rem box (see above), which
            also holds it to five or six lines. */}
        <p
          className="ab-fade pt-15 hyphens-auto text-body leading-[1.85] text-justify text-muted-light max-w-[64rem] bar:col-span-7 bar:col-start-1 bar:row-start-3 bar:pt-0 bar:w-[min(36rem,100%)] bar:justify-self-center bar:relative bar:right-[calc((var(--spacing-gutter)_-_var(--spacing-grid))/2)]"
        >
          {about.body}
        </p>
      </div>
    </section>
  );
}
