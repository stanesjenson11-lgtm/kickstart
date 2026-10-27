"use client";

import Image from "next/image";
import { ai } from "@/lib/content";
import { useGsap, gsap, SplitText } from "@/lib/motion";

/**
 * AI integration, demonstrated on the visitor's own scroll.
 *
 * The headline decodes once as it arrives. The transcript is the motion piece:
 * an enquiry comes in, the assistant's replies type themselves out as the page
 * moves, and the hand-off behind the last reply draws itself underneath. The
 * light behind it all is fibre optics graded to the site's monochrome — the
 * projector's beam, carrying data instead of a picture.
 *
 * Everything renders finished; the animations set their from-states only
 * after mount, and reduced motion skips them.
 */
export default function Ai() {
  const scope = useGsap<HTMLElement>(({ self }) => {
    // Headline: each word decodes in its own fixed-width box, so the random
    // glyphs never rewrap the lines or nudge the copy beneath.
    SplitText.create(self.querySelector(".ai-head"), {
      type: "words",
      autoSplit: true,
      onSplit(split) {
        (split.words as HTMLElement[]).forEach((w) => (w.style.width = `${w.offsetWidth}px`));
        return gsap
          .timeline({ scrollTrigger: { trigger: self.querySelector(".ai-head"), start: "top 82%", once: true } })
          .from(split.words, { opacity: 0, duration: 0.15, stagger: 0.12 }, 0)
          .to(
            split.words,
            {
              scrambleText: { text: "{original}", chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ/_#", revealDelay: 0.35, speed: 0.5 },
              duration: 1.1,
              stagger: 0.12,
              ease: "none",
            },
            0,
          );
      },
    });

    // Transcript: visitor lines arrive whole, assistant lines are typed.
    const demo = self.querySelector<HTMLElement>(".ai-demo")!;
    const tl = gsap.timeline({
      scrollTrigger: { trigger: demo, start: "top 78%", end: "bottom 55%", scrub: 0.5 },
      defaults: { ease: "none" },
    });
    demo.querySelectorAll<HTMLElement>(".ai-row").forEach((row) => {
      tl.fromTo(row, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
      if (row.dataset.who === "Assistant") {
        const { chars } = SplitText.create(row.querySelector("p"), { type: "words,chars" });
        tl.fromTo(chars, { opacity: 0 }, { opacity: 1, duration: 0.01, stagger: 1 / chars.length });
      }
    });
    demo.querySelectorAll<HTMLElement>(".ai-step").forEach((step) => {
      tl.fromTo(step.querySelector(".ai-node"), { opacity: 0.25 }, { opacity: 1, duration: 0.15 });
      const wire = step.querySelector(".ai-wire");
      if (wire) tl.fromTo(wire, { scale: 0 }, { scale: 1, duration: 0.25 });
    });

    // The light drifts through the frame as the section passes.
    gsap.fromTo(
      self.querySelector(".ai-bg"),
      { yPercent: -6 },
      {
        yPercent: 6,
        ease: "none",
        scrollTrigger: { trigger: self, start: "top bottom", end: "bottom top", scrub: true },
      },
    );

    // Capabilities: each rule draws, then its words follow.
    const items = self.querySelectorAll<HTMLElement>(".ai-item");
    const trigger = { trigger: self.querySelector(".ai-list"), start: "top 85%" };
    gsap.fromTo(
      self.querySelectorAll(".ai-rule"),
      { scaleX: 0 },
      { scaleX: 1, duration: 0.9, ease: "power3.out", stagger: 0.1, scrollTrigger: trigger },
    );
    gsap.from(items, {
      opacity: 0,
      y: 18,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.1,
      delay: 0.2,
      scrollTrigger: trigger,
    });
  }, []);

  return (
    <section ref={scope} id="ai" className="relative overflow-hidden bg-ink">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {/* Taller than the section by the drift, so it never shows an edge.
            Grey and soft in the file itself, not by CSS filter: a filtered
            layer that moves every frame is a repaint every frame. */}
        <div className="ai-bg absolute inset-x-0 -inset-y-[8%]">
          <Image
            src={ai.bg}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-[70%_50%] opacity-60"
          />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,var(--color-ink),oklch(0.145_0_0/0.5)_28%,oklch(0.145_0_0/0.6)_72%,var(--color-ink))]" />
      </div>

      <div className="relative z-[var(--z-content)] px-gutter pt-section pb-section-lg">
        <div className="bar:grid bar:grid-cols-12 bar:gap-grid">
          <div className="bar:col-span-6">
            <p className="u-meta text-muted-dark">{ai.label}</p>
            <h2 className="ai-head u-display text-h1 max-w-[13ch] pt-4" style={{ ["--wdth" as string]: 104 }}>
              {ai.headline}
            </h2>
            <p className="u-measure pt-6 text-body leading-[1.65] text-muted-dark">{ai.body}</p>
            <a href={ai.link.href} className="cut-link u-meta mt-8">
              {ai.link.label}
            </a>
          </div>

          {/* A demonstration, but real text: it reads as an example exchange
              without the animation, and screen readers get it the same way. */}
          <figure className="ai-demo mt-12 bar:col-span-6 bar:col-start-7 bar:mt-2 wide:col-span-5 wide:col-start-8">
            <figcaption className="sr-only">An example exchange with a website assistant</figcaption>
            <div className="border-t border-[var(--rule-on-dark)]">
              {ai.transcript.map((line, i) => (
                <div
                  key={i}
                  data-who={line.who}
                  className="ai-row grid grid-cols-[5.75rem_1fr] gap-x-4 border-b border-[var(--rule-on-dark)] py-4"
                >
                  <span className="u-meta pt-1 text-muted-dark">{line.who}</span>
                  <p
                    className={`text-body leading-[1.55] ${
                      line.who === "Assistant" ? "text-paper" : "text-muted-dark"
                    }`}
                  >
                    {line.text}
                  </p>
                </div>
              ))}
            </div>

            <ol className="mt-6 flex flex-col gap-2 wide:flex-row wide:items-center wide:gap-3">
              {ai.route.map((r, i) => (
                <li
                  key={r}
                  className="ai-step flex flex-col gap-2 wide:flex-1 wide:flex-row wide:items-center wide:gap-3 wide:last:flex-none"
                >
                  <span className="ai-node u-meta flex items-center gap-2 whitespace-nowrap text-paper">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {r}
                  </span>
                  {i < ai.route.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="ai-wire ml-[0.17rem] block h-4 w-px origin-top-left bg-paper/40 wide:ml-0 wide:h-px wide:w-auto wide:flex-1"
                    />
                  )}
                </li>
              ))}
            </ol>
          </figure>
        </div>

        <ul className="ai-list mt-16 grid gap-x-grid gap-y-8 bar:mt-20 bar:grid-cols-2 wide:grid-cols-4">
          {ai.items.map((item) => (
            <li key={item.title}>
              <span aria-hidden="true" className="ai-rule block h-px origin-left bg-[var(--rule-on-dark)]" />
              <div className="ai-item pt-5">
                <h3 className="u-display text-h3" style={{ ["--wdth" as string]: 100 }}>
                  {item.title}
                </h3>
                <p className="pt-3 text-[0.975rem] leading-[1.6] text-muted-dark">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
