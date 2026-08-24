"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { nav, site } from "@/lib/content";
import GlassSurface from "@/components/ui/GlassSurface";
import MagneticButton from "@/components/ui/MagneticButton";
import { prefersReduced } from "@/lib/motion";

const PARTICLES = 12;

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [pill, setPill] = useState({ left: 0, width: 0, shown: false });

  const listRef = useRef<HTMLUListElement>(null);
  const burstRef = useRef<HTMLSpanElement>(null);

  /* --- which section am I in? ------------------------------------------- */
  // The indicator earns its place by answering that, rather than only lighting
  // up on click. Sections report themselves; the nav follows.
  useEffect(() => {
    const targets = nav.links
      .map((l) => document.querySelector(l.href))
      .filter(Boolean) as Element[];
    if (!targets.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!hit) return;
        setActive(targets.indexOf(hit.target));
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5] },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  /* --- park the pill under the active link ------------------------------ */
  const placePill = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const item = list.children[active] as HTMLElement | undefined;
    if (!item) return setPill((p) => ({ ...p, shown: false }));
    setPill({ left: item.offsetLeft, width: item.offsetWidth, shown: true });
  }, [active]);

  useEffect(() => {
    placePill();
    const ro = new ResizeObserver(placePill);
    if (listRef.current) ro.observe(listRef.current);
    return () => ro.disconnect();
  }, [placePill]);

  /* --- the burst -------------------------------------------------------- */
  const burst = (item: HTMLElement) => {
    const host = burstRef.current;
    const list = listRef.current;
    if (!host || !list || prefersReduced()) return;

    host.style.left = `${item.offsetLeft}px`;
    host.style.top = `${item.offsetTop}px`;
    host.style.width = `${item.offsetWidth}px`;
    host.style.height = `${item.offsetHeight}px`;

    for (let i = 0; i < PARTICLES; i++) {
      const dot = document.createElement("span");
      const a = (Math.PI * 2 * i) / PARTICLES + Math.random() * 0.5;
      const d = 26 + Math.random() * 34;
      dot.className = "ks-goo__dot";
      dot.style.setProperty("--dx", `${Math.cos(a) * d}px`);
      dot.style.setProperty("--dy", `${Math.sin(a) * d * 0.7}px`);
      dot.style.setProperty("--s", String(0.7 + Math.random() * 0.8));
      dot.style.setProperty("--t", `${620 + Math.random() * 320}ms`);
      host.appendChild(dot);
      dot.addEventListener("animationend", () => dot.remove(), { once: true });
    }
  };

  /* --- mobile sheet ----------------------------------------------------- */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[var(--z-nav)] px-gutter pt-4 md:pt-5">
        <GlassSurface borderRadius={999} backgroundOpacity={0.05} className="w-full">
          <div className="flex w-full items-center justify-between gap-2 px-4 py-2.5 lg:gap-4 lg:px-6">
            <a
              href="#top"
              className="u-display shrink-0 text-[1rem] leading-none"
              style={{ ["--wdth" as string]: 118 }}
              aria-label={`${site.name} — back to top`}
            >
              Kickstart
            </a>

            <nav aria-label="Primary" className="relative hidden md:block">
              <span
                aria-hidden="true"
                className="ks-goo__pill"
                style={{
                  left: pill.left,
                  width: pill.width,
                  top: 0,
                  bottom: 0,
                  opacity: pill.shown ? 1 : 0,
                }}
              />
              <span aria-hidden="true" ref={burstRef} className="ks-goo__burst" />
              <ul ref={listRef} className="relative flex items-center">
                {nav.links.map((l, i) => (
                  <li key={l.href} className="relative z-[1]">
                    <a
                      href={l.href}
                      aria-current={active === i ? "page" : undefined}
                      onClick={(e) => burst(e.currentTarget.parentElement as HTMLElement)}
                      className="block px-2.5 py-2 u-meta transition-colors duration-300 lg:px-4"
                      style={{ color: active === i ? "var(--color-ink)" : undefined }}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="hidden shrink-0 md:block">
              <MagneticButton href={nav.cta.href} variant="ghost" className="!py-2.5 !px-3.5 lg:!px-5">
                {nav.cta.label}
              </MagneticButton>
            </div>

            <button
              className="relative z-[var(--z-menu)] flex h-10 w-10 shrink-0 items-center justify-center md:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
              <span aria-hidden="true" className="relative block h-[9px] w-6">
                <span
                  className="absolute left-0 block h-px w-full bg-current transition-transform duration-400 ease-[var(--ease-out-expo)]"
                  style={{ transform: open ? "translateY(4px) rotate(12deg)" : "none" }}
                />
                <span
                  className="absolute bottom-0 left-0 block h-px w-full bg-current transition-transform duration-400 ease-[var(--ease-out-expo)]"
                  style={{ transform: open ? "translateY(-4px) rotate(-12deg)" : "none" }}
                />
              </span>
            </button>
          </div>
        </GlassSurface>
      </header>

      {/* Mobile sheet — opens along the cut, matching the site's one motif. */}
      <div
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-0 z-[var(--z-overlay)] bg-ink px-gutter pt-28 md:hidden"
        style={{
          clipPath: open
            ? "polygon(0 -20%, 100% -20%, 100% 100%, 0 112%)"
            : "polygon(0 -20%, 100% -20%, 100% -20%, 0 -8%)",
          transition: "clip-path 700ms var(--ease-out-expo)",
        }}
      >
        <nav aria-label="Mobile" className="flex h-full flex-col">
          {nav.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="u-display border-b border-[var(--rule-on-dark)] py-6 text-h2"
              style={{ ["--wdth" as string]: 96 }}
            >
              {l.label}
            </a>
          ))}
          <div className="pt-10">
            <MagneticButton href={nav.cta.href} variant="solid">
              {nav.cta.label}
            </MagneticButton>
          </div>
          <div className="u-meta mt-auto pb-10 pt-12 text-muted-dark">
            <a href={`mailto:${site.email}`} className="cut-link tracking-[0.06em] break-words">
              {site.email}
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}
