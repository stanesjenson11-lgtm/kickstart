"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { clients } from "@/lib/content";
import { useGsap, gsap, useIsoLayoutEffect } from "@/lib/motion";
import {
  ScrollVelocityContainer,
  ScrollVelocityRow,
} from "@/components/ui/scroll-velocity-text";

/** Smallest and largest the brand name may be drawn, in px. */
const MIN_WORD = 16;
const MAX_WORD = 230;

/** One character per masked cell, so each can be rolled independently. */
function Chars({ text, layer }: { text: string; layer: string }) {
  return (
    <>
      {[...text].map((ch, i) => (
        <span key={`${layer}-${text}-${i}`} className="inline-block overflow-hidden align-bottom">
          <span className="cl-char inline-block">{ch === " " ? " " : ch}</span>
        </span>
      ))}
    </>
  );
}

/**
 * Genuine clients only. The brief is explicit: if there are not enough strong
 * logos yet, omit the section rather than padding it with weak ones — so this
 * renders nothing until `clients` in lib/content.ts has real entries.
 *
 * A marquee of logo tiles; point at one (or tap it) and its name rolls up into
 * the band below, a character at a time, while the previous name rolls out. The
 * strip drifts on its own and speeds up with the page scroll, always travelling
 * the same way.
 *
 * The logos are in their own colours, which is why each sits on a white tile —
 * half these marks are near-black and would disappear straight into the ink.
 */
export default function Clients() {
  const [active, setActive] = useState<number | null>(null);
  const label = active === null ? "" : clients[active].name;

  // Both names are on screen during the swap: the outgoing one rolls up and
  // out while the incoming one rolls up and in.
  const [pair, setPair] = useState({ from: "", to: "" });
  useEffect(() => {
    setPair((p) => (p.to === label ? p : { from: p.to, to: label }));
  }, [label]);

  const inRef = useRef<HTMLParagraphElement>(null);
  const outRef = useRef<HTMLParagraphElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);

  const wordScope = useGsap<HTMLDivElement>(({ self }) => {
    gsap.to(self.querySelectorAll<HTMLElement>(".cl-out .cl-char"), {
      yPercent: -115,
      duration: 0.4,
      ease: "power3.in",
      stagger: 0.014,
    });
    gsap.fromTo(
      self.querySelectorAll<HTMLElement>(".cl-in .cl-char"),
      { yPercent: 115 },
      { yPercent: 0, duration: 0.5, ease: "power3.out", stagger: 0.014, delay: 0.05 },
    );
  }, [pair.to]);

  // Fit each name to the line by measuring it. Names run from "CGI" to
  // "Cushman & Wakefield", and a size guessed from the character count cannot
  // know the real glyph widths. Set imperatively, so no extra render is needed.
  useIsoLayoutEffect(() => {
    const fit = () => {
      for (const el of [inRef.current, outRef.current]) {
        if (!el) continue;
        el.style.fontSize = "100px";
        const natural = el.scrollWidth;
        const avail = el.clientWidth;
        if (!natural || !avail) continue;
        // Capped by viewport as well as by MAX_WORD. Fitting a short name like
        // "CGI" to the full column width is the right answer on a desktop and
        // enormous on a phone, where that column is the whole screen. Split at
        // the phone breakpoint so tightening the small end leaves the desktop
        // ceiling exactly where it was.
        const vw = window.innerWidth;
        const ceiling = Math.min(MAX_WORD, vw < 620 ? vw * 0.1 : vw * 0.16);
        el.style.fontSize = `${Math.max(MIN_WORD, Math.min(ceiling, (100 * avail) / natural))}px`;
      }
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [pair.to, pair.from]);

  /**
   * Which logo is under the pointer, resolved by hit-testing every frame.
   *
   * pointerenter/leave are no use here: the browser only re-resolves hover when
   * the POINTER moves, and here it is the tiles that move. Holding the cursor
   * still over the marquee left the name stuck on whichever logo happened to be
   * there first while the strip slid on underneath it.
   */
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || !window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (e: PointerEvent) => {
      pointer.current = { x: e.clientX, y: e.clientY };
    };
    const onLeave = () => {
      pointer.current = null;
      setActive(null);
    };

    strip.addEventListener("pointermove", onMove);
    strip.addEventListener("pointerleave", onLeave);

    let raf = requestAnimationFrame(function tick() {
      raf = requestAnimationFrame(tick);
      const p = pointer.current;
      if (!p) return;
      const el = document.elementFromPoint(p.x, p.y);
      const tile = el instanceof Element ? el.closest<HTMLElement>(".cl-tile") : null;
      const next = tile?.dataset.index ? Number(tile.dataset.index) : null;
      // Returning the previous value keeps React from re-rendering every frame.
      setActive((prev) => (prev === next ? prev : next));
    });

    return () => {
      cancelAnimationFrame(raf);
      strip.removeEventListener("pointermove", onMove);
      strip.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  const scope = useGsap<HTMLElement>(({ self }) => {
    // The trailing dot is pointer decoration — no touch, no coarse pointers.
    const dot = self.querySelector<HTMLElement>(".cl-dot");
    if (!dot || !window.matchMedia("(pointer: fine)").matches) return;

    const xTo = gsap.quickTo(dot, "x", { duration: 0.45, ease: "power3" });
    const yTo = gsap.quickTo(dot, "y", { duration: 0.45, ease: "power3" });
    const strip = self.querySelector<HTMLElement>(".cl-strip");

    const move = (e: PointerEvent) => {
      const r = self.getBoundingClientRect();
      xTo(e.clientX - r.left);
      yTo(e.clientY - r.top);
    };
    const show = () => gsap.to(dot, { opacity: 1, scale: 1, duration: 0.3 });
    const hide = () => gsap.to(dot, { opacity: 0, scale: 0.4, duration: 0.3 });

    self.addEventListener("pointermove", move);
    strip?.addEventListener("pointerenter", show);
    strip?.addEventListener("pointerleave", hide);

    return () => {
      self.removeEventListener("pointermove", move);
      strip?.removeEventListener("pointerenter", show);
      strip?.removeEventListener("pointerleave", hide);
    };
  }, []);

  if (clients.length === 0) return null;

  return (
    <section ref={scope} className="relative overflow-hidden bg-ink py-section">
      <span
        aria-hidden="true"
        className="cl-dot pointer-events-none absolute left-0 top-0 z-10 -ml-1.5 -mt-1.5 h-3 w-3 rounded-full bg-paper opacity-0"
      />

      {/* Set like the gallery's category labels ("Corporate parties") just
          above this section. */}
      <h2 className="px-gutter u-display text-h2" style={{ ["--wdth" as string]: 100 }}>
        Our clients
      </h2>

      <div ref={stripRef} className="cl-strip mt-8 md:mt-10">
        <ScrollVelocityContainer>
          {/* One way only: `lockDirection` stops a scroll upward from reversing it. */}
          <ScrollVelocityRow baseVelocity={1.6} direction={-1} lockDirection>
            {clients.map((c, i) => (
              <button
                key={c.name}
                type="button"
                data-index={i}
                aria-label={c.name}
                // Tap works where hover does not, and gives the name a way in
                // on touch devices.
                onClick={() => setActive((a) => (a === i ? null : i))}
                className={`cl-tile mx-2 shrink-0 cursor-pointer transition-opacity duration-400 ${
                  active === null || active === i ? "opacity-100" : "opacity-35"
                }`}
              >
                {/* The white surface lives on this span, not the button: the
                    global `button { background: none }` in globals.css is
                    unlayered, and unlayered rules beat Tailwind's utilities
                    layer, so `bg-paper` on the button is thrown away. */}
                <span className="block h-[84px] w-[136px] rounded-2xl bg-paper p-4 md:h-[96px] md:w-[156px]">
                  {c.logo ? (
                    // `fill` resolves against the padding box, so the inset
                    // wrapper is what keeps the mark off the edges of the tile.
                    <span className="relative block h-full w-full">
                      <Image
                        src={c.logo}
                        alt={c.name}
                        fill
                        sizes="156px"
                        className="object-contain"
                      />
                    </span>
                  ) : (
                    <span className="flex h-full items-center justify-center text-center text-xs font-medium text-ink">
                      {c.name}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </ScrollVelocityRow>
        </ScrollVelocityContainer>
      </div>

      {/* Fixed height so revealing a name never shifts the page. Decoration for
          the pointer — the accessible list of clients is the button labels. */}
      <div
        ref={wordScope}
        aria-hidden="true"
        className="mt-8 h-[clamp(3.5rem,13vw,9.5rem)] px-gutter md:mt-10"
      >
        {/* The inner box is what the layers position against, so `inset-x-0`
            lands inside the gutter rather than on the padding box of the
            padded element. Block, never flex: as flex items the characters
            would shrink to fit and the width measurement would read as a
            no-op, the same way wrapping did. */}
        <div className="relative h-full">
        {(["out", "in"] as const).map((layer) => (
          <p
            key={layer}
            ref={layer === "in" ? inRef : outRef}
            className={`cl-${layer} u-display absolute inset-x-0 top-1/2 block -translate-y-1/2 text-center leading-[0.85]`}
            // nowrap is not cosmetic: the fit above reads scrollWidth as the
            // natural one-line width, and if the text is allowed to wrap that
            // equals clientWidth and the measurement silently becomes a no-op.
            style={{
              ["--wdth" as string]: 118,
              whiteSpace: "nowrap",
              fontSize: "clamp(2.25rem, 12vw, 11rem)",
            }}
          >
            <Chars text={layer === "in" ? pair.to : pair.from} layer={layer} />
          </p>
        ))}
        </div>
      </div>
    </section>
  );
}
