"use client";

import Image from "next/image";
import { web } from "@/lib/content";
import { useGsap, gsap } from "@/lib/motion";

const WIRE = "fill-none stroke-paper/30 [vector-effect:non-scaling-stroke]";
const LABEL = "fill-paper/45 font-mono text-[22px] tracking-[0.16em]";

/** The desktop page as a sketch: nav, hero image, headline, copy, button. */
function DesktopWire() {
  return (
    <svg viewBox="0 0 1600 1000" className="absolute inset-0 h-full w-full">
      <rect className={`wf ${WIRE}`} x="64" y="40" width="190" height="48" />
      <line className={`wf ${WIRE}`} x1="1030" y1="64" x2="1120" y2="64" />
      <line className={`wf ${WIRE}`} x1="1160" y1="64" x2="1250" y2="64" />
      <line className={`wf ${WIRE}`} x1="1290" y1="64" x2="1380" y2="64" />
      <rect className={`wf ${WIRE}`} x="1420" y="40" width="116" height="48" rx="24" />
      <rect className={`wf ${WIRE}`} x="64" y="128" width="1472" height="832" />
      <line className={`wf ${WIRE}`} x1="64" y1="128" x2="1536" y2="960" />
      <line className={`wf ${WIRE}`} x1="1536" y1="128" x2="64" y2="960" />
      <rect className={`wf ${WIRE}`} x="120" y="520" width="620" height="84" />
      <rect className={`wf ${WIRE}`} x="120" y="624" width="520" height="84" />
      <line className={`wf ${WIRE}`} x1="120" y1="752" x2="560" y2="752" />
      <line className={`wf ${WIRE}`} x1="120" y1="784" x2="470" y2="784" />
      <rect className={`wf ${WIRE}`} x="120" y="828" width="260" height="68" rx="34" />
      <g className="wf-label">
        <text className={LABEL} x="96" y="176">IMAGE 16:10</text>
        <text className={LABEL} x="760" y="572">H1</text>
        <text className={LABEL} x="400" y="872">CTA</text>
      </g>
    </svg>
  );
}

function PhoneWire() {
  return (
    <svg viewBox="0 0 900 1900" className="absolute inset-0 h-full w-full">
      <rect className={`wf ${WIRE}`} x="60" y="70" width="220" height="56" />
      <line className={`wf ${WIRE}`} x1="760" y1="86" x2="840" y2="86" />
      <line className={`wf ${WIRE}`} x1="760" y1="112" x2="840" y2="112" />
      <rect className={`wf ${WIRE}`} x="60" y="180" width="780" height="980" />
      <line className={`wf ${WIRE}`} x1="60" y1="180" x2="840" y2="1160" />
      <line className={`wf ${WIRE}`} x1="840" y1="180" x2="60" y2="1160" />
      <rect className={`wf ${WIRE}`} x="60" y="1240" width="640" height="110" />
      <rect className={`wf ${WIRE}`} x="60" y="1380" width="480" height="110" />
      <line className={`wf ${WIRE}`} x1="60" y1="1560" x2="740" y2="1560" />
      <rect className={`wf ${WIRE}`} x="60" y="1660" width="780" height="120" rx="60" />
    </svg>
  );
}

/**
 * Website design and development, shown rather than listed.
 *
 * The mock-up is the section's argument: a page that arrives as a grey
 * wireframe and is cut over into the finished site as it crosses the screen —
 * the same diagonal as the monogram, the same wipe the headline gets. Scrubbed,
 * not pinned, so it adds no scroll length of its own.
 *
 * Every default below is the END state: the finished site, the solid headline.
 * The timeline only writes the from-state once it runs, so without JS or under
 * reduced motion the section is complete.
 */
export default function Web() {
  const m = web.mock;

  const scope = useGsap<HTMLElement>(({ self }) => {
    // Headline: drawn in outline, filled along the cut.
    const head = self.querySelector<HTMLElement>(".web-head")!;
    gsap
      .timeline({
        scrollTrigger: { trigger: head, start: "top 85%", end: "top 40%", scrub: 0.6 },
        defaults: { ease: "none" },
      })
      .fromTo(head, { "--s": 0 }, { "--s": 1, duration: 1, ease: "power1.inOut" }, 0)
      .fromTo(head.querySelector(".u-outline"), { opacity: 1 }, { opacity: 0, duration: 0.15 }, 0.85);

    // The mock: wireframe draws, the cut sweeps the finished page over it,
    // the page's own headline rises, the status flips to live.
    const mock = self.querySelector<HTMLElement>(".web-mock")!;
    const view = mock.querySelector<HTMLElement>(".web-view")!;
    const phone = mock.querySelector<HTMLElement>(".web-phone-view")!;
    gsap
      .timeline({
        // Ends while the mock's foot is still a quarter up the screen, so the
        // sweep plays with the whole page in view even on a short laptop.
        scrollTrigger: { trigger: mock, start: "top 90%", end: "bottom 75%", scrub: 0.6 },
        defaults: { ease: "none" },
      })
      .fromTo(view.querySelectorAll(".wf"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.3, stagger: 0.012 }, 0)
      .fromTo(phone.querySelectorAll(".wf"), { drawSVG: "0%" }, { drawSVG: "100%", duration: 0.3, stagger: 0.012 }, 0.08)
      .fromTo(view.querySelector(".wf-label"), { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0.18)
      .fromTo(view, { "--s": 0 }, { "--s": 1, duration: 0.32, ease: "power1.inOut" }, 0.4)
      .fromTo(view.querySelector(".cut-edge"), { opacity: 0 }, { opacity: 1, duration: 0.03 }, 0.4)
      .to(view.querySelector(".cut-edge"), { opacity: 0, duration: 0.04 }, 0.68)
      .fromTo(phone, { "--s": 0 }, { "--s": 1, duration: 0.26, ease: "power1.inOut" }, 0.56)
      .fromTo(phone.querySelector(".cut-edge"), { opacity: 0 }, { opacity: 1, duration: 0.03 }, 0.56)
      .to(phone.querySelector(".cut-edge"), { opacity: 0, duration: 0.04 }, 0.78)
      .fromTo(
        view.querySelectorAll(".web-line > span"),
        { yPercent: 110 },
        { yPercent: 0, duration: 0.14, stagger: 0.05, ease: "power2.out" },
        0.62,
      )
      .fromTo(mock.querySelector(".web-draft"), { opacity: 1 }, { opacity: 0, duration: 0.04 }, 0.72)
      .fromTo(mock.querySelector(".web-live"), { opacity: 0 }, { opacity: 1, duration: 0.04 }, 0.72);

    // The phone rides a little faster than the page: the two screens part.
    gsap.fromTo(
      mock.querySelector(".web-phone"),
      { yPercent: 16 },
      {
        yPercent: -6,
        ease: "none",
        scrollTrigger: { trigger: mock, start: "top bottom", end: "bottom top", scrub: true },
      },
    );

    // The list wipes in along the same direction as the cut.
    gsap.fromTo(
      self.querySelectorAll(".web-item"),
      { clipPath: "inset(0 100% 0 0)" },
      {
        clipPath: "inset(0 0% 0 0)",
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: { trigger: self.querySelector(".web-list"), start: "top 88%" },
      },
    );
  }, []);

  return (
    <section ref={scope} id="web" className="cut-top relative overflow-hidden bg-ink">
      <div className="relative z-[var(--z-content)] px-gutter pt-section-lg pb-section">
        <div className="bar:grid bar:grid-cols-12 bar:items-center bar:gap-grid">
          <div className="bar:col-span-5">
            <p className="u-meta text-muted-dark">{web.label}</p>
            {/* The real heading fills in over its own outline. Same cell, same
                wrap (the twin is a div, so it gets balance explicitly), so the
                two copies register exactly. */}
            <div className="web-head mt-4 grid [--dx:8%]" style={{ ["--wdth" as string]: 104 }}>
              <div
                aria-hidden="true"
                className="u-outline u-display text-h1 opacity-0 [grid-area:1/1] [text-wrap:balance]"
              >
                {web.headline}
              </div>
              <h2 className="cut-sweep u-display text-h1 [grid-area:1/1]">{web.headline}</h2>
            </div>
            <p className="u-measure pt-6 text-body leading-[1.65] text-muted-dark">{web.body}</p>
            <a href={web.link.href} className="cut-link u-meta mt-8">
              {web.link.label}
            </a>
          </div>

          {/* The mock-up is decoration; the copy beside it says the same thing
              in words. mb leaves room for the phone hanging off its foot. */}
          <div
            aria-hidden="true"
            className="web-mock relative mt-12 mb-[14%] bar:col-span-7 bar:mt-0 bar:mb-[6%]"
          >
            <div className="overflow-hidden rounded-lg border border-[var(--rule-on-dark)] bg-ink-raised shadow-[0_2.5rem_5rem_-1.5rem_oklch(0_0_0/0.8)]">
              <div className="relative flex items-center justify-center border-b border-[var(--rule-on-dark)] px-4 py-2.5">
                <span className="rounded-full border border-[var(--rule-on-dark)] px-4 py-1 font-mono text-[0.625rem] tracking-[0.08em] text-muted-dark">
                  {m.url}
                </span>
                <span className="absolute right-4 grid font-mono text-[0.625rem] tracking-[0.16em] uppercase">
                  <span className="web-draft flex items-center gap-1.5 text-muted-dark opacity-0 [grid-area:1/1]">
                    <span className="h-1.5 w-1.5 rounded-full border border-current" />
                    Draft
                  </span>
                  <span className="web-live flex items-center gap-1.5 text-paper [grid-area:1/1]">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    Live
                  </span>
                </span>
              </div>

              <div className="web-view relative aspect-[16/10] [container-type:inline-size] [--dx:13.3%]">
                <DesktopWire />
                <div className="cut-sweep absolute inset-0">
                  <Image
                    src={m.src}
                    alt=""
                    fill
                    sizes="(min-width: 48rem) 55vw, 90vw"
                    className="object-cover object-[50%_42%]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,oklch(0_0_0/0.78),oklch(0_0_0/0.25)_55%,transparent)]" />
                  <div className="absolute inset-x-[4cqw] top-[2.4cqw] flex items-center justify-between">
                    <span className="u-display text-[2.4cqw]" style={{ ["--wdth" as string]: 125 }}>
                      {m.brand}
                    </span>
                    <span className="flex items-center gap-[2.6cqw] text-[1.1cqw]">
                      {m.links.map((l) => (
                        <span key={l}>{l}</span>
                      ))}
                      <span className="rounded-full border border-paper/60 px-[1.4cqw] py-[0.5cqw]">Cart</span>
                    </span>
                  </div>
                  <div className="absolute bottom-[7cqw] left-[7.5cqw]">
                    <p className="u-display text-[6.2cqw] leading-[0.92]" style={{ ["--wdth" as string]: 112 }}>
                      {m.headline.map((line) => (
                        <span key={line} className="web-line block overflow-hidden pb-[0.08em]">
                          <span className="block">{line}</span>
                        </span>
                      ))}
                    </p>
                    <span className="mt-[2.2cqw] inline-block rounded-full bg-paper px-[2.2cqw] py-[0.9cqw] text-[1.15cqw] font-semibold text-ink">
                      {m.cta}
                    </span>
                  </div>
                </div>
                <span className="cut-edge" />
              </div>
            </div>

            {/* The same site on a phone, hanging off the corner. */}
            {/* Off the right-hand corner: the left one is the copy's side, and
                hanging there it covered the end of the paragraph. */}
            <div className="web-phone absolute -right-[2%] -bottom-[16%] w-[27%] rounded-[1.1rem] border border-[var(--rule-on-dark)] bg-ink p-[2.5%] shadow-[0_2rem_4rem_-1rem_oklch(0_0_0/0.9)] bar:-right-[4%] bar:-bottom-[10%] bar:w-[20%]">
              <div className="web-phone-view relative aspect-[9/19] overflow-hidden rounded-[0.8rem] bg-ink-raised [container-type:inline-size] [--dx:45%]">
                <PhoneWire />
                <div className="cut-sweep absolute inset-0">
                  <Image
                    src={m.src}
                    alt=""
                    fill
                    sizes="(min-width: 48rem) 15vw, 27vw"
                    className="object-cover object-[50%_35%]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,oklch(0_0_0/0.85),transparent_55%)]" />
                  <span
                    className="absolute top-[7cqw] left-[7cqw] u-display text-[9cqw]"
                    style={{ ["--wdth" as string]: 125 }}
                  >
                    {m.brand}
                  </span>
                  <span className="absolute top-[9cqw] right-[7cqw] grid w-[9cqw] gap-[2.4cqw]">
                    <span className="block h-px bg-paper" />
                    <span className="block h-px bg-paper" />
                  </span>
                  <div className="absolute inset-x-[7cqw] bottom-[8cqw]">
                    <p className="u-display text-[13cqw] leading-[0.92]" style={{ ["--wdth" as string]: 104 }}>
                      {m.headline.join(" ")}
                    </p>
                    <span className="mt-[6cqw] block rounded-full bg-paper py-[3.5cqw] text-center text-[5cqw] font-semibold text-ink">
                      {m.cta}
                    </span>
                  </div>
                </div>
                <span className="cut-edge" />
              </div>
            </div>
          </div>
        </div>

        <ul className="web-list mt-6 grid grid-cols-2 border-t border-[var(--rule-on-dark)] bar:mt-14 bar:grid-cols-5">
          {web.items.map((item) => (
            <li
              key={item}
              className="web-item border-b border-[var(--rule-on-dark)] py-4 pr-4 u-display text-[length:clamp(0.95rem,1.35vw,1.2rem)] leading-tight bar:border-b-0 bar:border-l bar:px-5 bar:py-6 bar:first:border-l-0 bar:first:pl-0"
              style={{ ["--wdth" as string]: 100 }}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
