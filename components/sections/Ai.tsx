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

    // Transcript: visitor lines arrive whole, assistant lines are typed. It
    // finishes just before its frame lands, so a snap never stops a reply
    // mid-word. From `bar` up that frame is the whole section, landing with the
    // transcript near the top of the screen. On a phone it is the section's
    // first screen, so the typing runs while that screen scrolls in. One
    // timeline per size, rebuilt when the size changes: matchMedia reverts the
    // old one, and the split text with it.
    const demo = self.querySelector<HTMLElement>(".ai-demo")!;
    gsap.matchMedia().add({ wide: "(width >= 48rem)", narrow: "(width < 48rem)" }, (mm) => {
      const tl = gsap.timeline({
        scrollTrigger: mm.conditions!.wide
          ? { trigger: demo, start: "top 78%", end: "top 25%", scrub: 0.5 }
          : { trigger: self, start: "top 50%", end: "top top", scrub: 0.5 },
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
    <section
      ref={scope}
      id="ai"
      data-frame
      // A frame, like About and Web, landed flush by the snap. From `bar` up it
      // is one screen with everything centred in it. A phone holds too much for
      // one screen, so there it is two: the copy and the transcript, then the
      // four capabilities (data-frame="phone" below), each one screen tall.
      className="relative overflow-hidden bg-ink bar:flex bar:min-h-[100svh] bar:items-center"
    >
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

      <div className="relative z-[var(--z-content)] w-full px-gutter bar:pt-[5.5rem] bar:pb-6">
        {/* Phone screen one. Padding goes here, never on a frame itself: the
            snap reads a frame's own top padding as the depth of a cut. */}
        <div className="flex min-h-[100svh] flex-col justify-center pt-[5.5rem] pb-5 bar:block bar:min-h-0 bar:p-0">
        <div className="bar:grid bar:grid-cols-12 bar:gap-grid">
          <div className="ai-fit-box bar:col-span-6">
            <p className="u-meta text-muted-dark">{ai.label}</p>
            {/* Capped by height as well as width, like the Web headline, so a
                short laptop screen still fits the whole frame. On a phone it is
                one line: .ai-fit sizes it to the column (see globals.css). */}
            <h2
              className="ai-head ai-fit u-display max-w-[13ch] pt-3"
              style={{ ["--wdth" as string]: 104 }}
            >
              {ai.headline}
            </h2>
            <p className="u-measure pt-3 text-[0.875rem] leading-[1.45] text-muted-dark bar:pt-5 bar:text-body bar:leading-[1.6]">
              {ai.body}
            </p>
            <a href={ai.link.href} className="cut-link u-meta mt-4 bar:mt-6">
              {ai.link.label}
            </a>
          </div>

          {/* A demonstration, but real text: it reads as an example exchange
              without the animation, and screen readers get it the same way. */}
          <figure className="ai-demo mt-5 bar:col-span-6 bar:col-start-7 bar:mt-1 wide:col-span-5 wide:col-start-8">
            <figcaption className="sr-only">An example exchange with a website assistant</figcaption>
            <div className="border-t border-[var(--rule-on-dark)]">
              {ai.transcript.map((line, i) => (
                <div
                  key={i}
                  data-who={line.who}
                  className="ai-row grid grid-cols-[4.75rem_1fr] gap-x-3 border-b border-[var(--rule-on-dark)] py-2.5 bar:grid-cols-[5.75rem_1fr] bar:gap-x-4 bar:py-3"
                >
                  {/* Smaller and tighter on a phone, so "Assistant" fits its column. */}
                  <span className="u-meta pt-1 text-muted-dark max-bar:tracking-[0.1em]! max-bar:[--text-meta:0.66rem]">
                    {line.who}
                  </span>
                  <p
                    className={`text-[0.875rem] leading-[1.45] bar:text-body bar:leading-[1.5] ${
                      line.who === "Assistant" ? "text-paper" : "text-muted-dark"
                    }`}
                  >
                    {line.text}
                  </p>
                </div>
              ))}
            </div>

            {/* A row on a phone (wrapping if it must), a column on a tablet, a
                row again from `wide` up. */}
            <ol className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1.5 bar:mt-5 bar:flex-col bar:flex-nowrap bar:items-start bar:gap-2 wide:flex-row wide:items-center wide:gap-3">
              {ai.route.map((r, i) => (
                <li
                  key={r}
                  className="ai-step flex items-center gap-2 bar:flex-col bar:items-start wide:flex-1 wide:flex-row wide:items-center wide:gap-3 wide:last:flex-none"
                >
                  <span className="ai-node u-meta flex items-center gap-2 whitespace-nowrap text-paper max-bar:tracking-[0.08em]! max-bar:[--text-meta:0.66rem]">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {r}
                  </span>
                  {i < ai.route.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="ai-wire block h-px w-4 origin-top-left bg-paper/40 bar:ml-[0.17rem] bar:h-4 bar:w-px wide:ml-0 wide:h-px wide:w-auto wide:flex-1"
                    />
                  )}
                </li>
              ))}
            </ol>
          </figure>
        </div>
        </div>

        {/* Phone screen two: the capabilities get a screen of their own, so
            they are read rather than squeezed. From `bar` up this is just the
            row under the copy, inside the one frame. */}
        <div data-frame="phone" className="flex min-h-[100svh] flex-col justify-center bar:block bar:min-h-0">
        <div className="pt-[5.5rem] pb-6 bar:p-0">
        <p className="u-meta pb-6 text-muted-dark bar:hidden">Where it earns its keep</p>
        <ul className="ai-list grid gap-y-6 bar:mt-10 bar:grid-cols-2 bar:gap-x-grid wide:grid-cols-4">
          {ai.items.map((item) => (
            <li key={item.title}>
              <span aria-hidden="true" className="ai-rule block h-px origin-left bg-[var(--rule-on-dark)]" />
              <div className="ai-item pt-4">
                <h3 className="u-display text-h3" style={{ ["--wdth" as string]: 100 }}>
                  {item.title}
                </h3>
                <p className="pt-2 text-[0.875rem] leading-[1.5] text-muted-dark bar:text-[0.95rem] bar:leading-[1.55]">
                  {item.text}
                </p>
              </div>
            </li>
          ))}
        </ul>
        </div>
        </div>
      </div>
    </section>
  );
}
