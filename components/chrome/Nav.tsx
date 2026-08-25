"use client";

import { useEffect, useRef, useState } from "react";
import { nav, site } from "@/lib/content";
import MagneticButton from "@/components/ui/MagneticButton";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [onLight, setOnLight] = useState(false);
  const [open, setOpen] = useState(false);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // The light sections already announce themselves with .on-paper — reuse
    // that rather than adding a second marker that can drift out of step.
    const paper = Array.from(document.querySelectorAll<HTMLElement>(".on-paper"));

    const onScroll = () => {
      setScrolled(window.scrollY > 40);

      // Probe the bar's own midline, so this stays right as the bar collapses
      // into the pill and its height changes.
      const r = bar.current?.getBoundingClientRect();
      const y = r ? r.top + r.height / 2 : 40;
      setOnLight(
        paper.some((el) => {
          const s = el.getBoundingClientRect();
          return s.top <= y && s.bottom >= y;
        }),
      );
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Trap the page behind the mobile sheet, and let Escape close it.
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
      <header
        className="pointer-events-none fixed inset-x-0 top-0 z-[var(--z-nav)] px-gutter"
        data-scrolled={scrolled}
        data-ground={onLight ? "light" : "dark"}
      >
        {/* Only the bar itself takes clicks — once it collapses to a pill the
            rest of the header strip is over page content. */}
        <div
          ref={bar}
          className="ks-nav pointer-events-auto flex items-center justify-between"
        >
          <a
            href="#top"
            className="u-display text-[1.05rem] leading-none"
            style={{ ["--wdth" as string]: 118 }}
            aria-label={`${site.name} — back to top`}
          >
            Kickstart
          </a>

          <nav aria-label="Primary" className="hidden items-center gap-10 md:flex">
            {nav.links.map((l) => (
              <a key={l.href} href={l.href} className="u-meta cut-link">
                {l.label}
              </a>
            ))}
          </nav>

          <button
            className="relative z-[var(--z-menu)] flex h-11 w-11 items-center justify-center md:hidden"
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
        <nav aria-label="Mobile" className="flex flex-col">
          {nav.links.map((l, i) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="u-display border-b border-[var(--rule-on-dark)] py-6 text-h2"
              style={{ ["--wdth" as string]: 96, transitionDelay: `${i * 40}ms` }}
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
