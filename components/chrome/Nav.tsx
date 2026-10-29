"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { nav, servicePages, site } from "@/lib/content";
import MagneticButton from "@/components/ui/MagneticButton";

/** What drops down from "Web & AI": the web and software services, by short name. */
const webServices = servicePages.filter((s) => s.group === "web");

/**
 * `home` is the prefix for every link: "" on the home page, where they are
 * in-page anchors, and "/" on any other page, where they lead back into the
 * home page's sections ("/#work") and the wordmark leads home.
 */
export default function Nav({ home = "" }: { home?: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [onLight, setOnLight] = useState(false);
  const [open, setOpen] = useState(false);
  // Escape dismisses the services dropdown while the pointer or focus is still
  // on it (WCAG 1.4.13). Leaving it re-arms the hover.
  const [dropDismissed, setDropDismissed] = useState(false);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // The light sections already announce themselves with .on-paper — reuse
    // that rather than adding a second marker that can drift out of step.
    // Queried on each scroll, not cached at mount: Statement drops .on-paper
    // partway through the projector shot, and a list taken once would keep
    // treating it as light after it has gone dark.
    const paper = () => Array.from(document.querySelectorAll<HTMLElement>(".on-paper"));

    const onScroll = () => {
      setScrolled(window.scrollY > 40);

      // Probe the bar's own midline, so this stays right as the bar collapses
      // into the pill and its height changes.
      const r = bar.current?.getBoundingClientRect();
      const y = r ? r.top + r.height / 2 : 40;
      setOnLight(
        paper().some((el) => {
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
          {/* Both marks ship and cross-fade; the link carries the name, so the
              images are decorative and stay out of the accessibility tree. */}
          <a
            href={home ? "/" : "#top"}
            className="ks-logo"
            aria-label={home ? `${site.name} — home` : `${site.name} — back to top`}
          >
            <Image
              src="/logo-white.png"
              alt=""
              width={1000}
              height={182}
              sizes="180px"
              loading="eager"
              data-logo="white"
            />
            <Image
              src="/logo-black.png"
              alt=""
              width={1000}
              height={184}
              sizes="180px"
              data-logo="black"
            />
          </a>

          {/* gap-5 until `wide`: six links plus the wordmark do not fit a 768px pill at gap-10. */}
          <nav aria-label="Primary" className="hidden items-center gap-5 bar:flex wide:gap-10">
            {nav.links.map((l) =>
              "menu" in l ? (
                /* "Web & AI" still goes to its section; pointing at it, or
                   tabbing onto it, opens the six services under it (globals.css,
                   .ks-drop). Not hover-only: keyboard focus opens it too. */
                <div
                  key={l.href}
                  // flex: the link becomes a flex item like its siblings, so it
                  // sits on their line rather than on this div's text baseline.
                  className="ks-drop relative flex"
                  data-dismissed={dropDismissed}
                  onKeyDown={(e) => {
                    if (e.key !== "Escape") return;
                    setDropDismissed(true);
                    e.currentTarget.querySelector("a")?.focus();
                  }}
                  onPointerLeave={() => setDropDismissed(false)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropDismissed(false);
                  }}
                >
                  <a href={home + l.href} className="u-meta cut-link">
                    {l.label}
                  </a>
                  <div className="ks-drop-panel">
                    <ul className="ks-drop-list">
                      {webServices.map((s) => (
                        <li key={s.slug}>
                          <a href={`/services/${s.slug}`} className="u-meta cut-link w-full px-3 py-2.5">
                            {s.short}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <a key={l.href} href={home + l.href} className="u-meta cut-link">
                  {l.label}
                </a>
              ),
            )}
          </nav>

          <button
            className="relative z-[var(--z-menu)] flex h-11 w-11 items-center justify-center bar:hidden"
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
      {/* Scrolls on its own when a short phone cannot hold it all; Lenis is
          told to keep out (data-lenis-prevent) so the touch scrolls the sheet,
          not the page locked behind it. */}
      <div
        id="mobile-menu"
        hidden={!open}
        data-lenis-prevent
        className="fixed inset-0 z-[var(--z-overlay)] overflow-y-auto overscroll-contain bg-ink px-gutter pt-28 bar:hidden"
        style={{
          clipPath: open
            ? "polygon(0 -20%, 100% -20%, 100% 100%, 0 112%)"
            : "polygon(0 -20%, 100% -20%, 100% -20%, 0 -8%)",
          transition: "clip-path 700ms var(--ease-out-expo)",
        }}
      >
        {/* The burger that opened the sheet ends up underneath it — the header's
            z-index makes its own stacking context — so the way out lives on the
            sheet itself. Lined up with the bar's 1.25rem top padding. */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute top-5 left-gutter -ml-3 flex h-11 w-11 items-center justify-center"
        >
          <span className="sr-only">Close menu</span>
          <ArrowLeft aria-hidden="true" className="h-6 w-6" strokeWidth={1.5} />
        </button>

        <nav aria-label="Mobile" className="flex flex-col">
          {nav.links.map((l, i) => (
            <div key={l.href} className="border-b border-[var(--rule-on-dark)]">
              <a
                href={home + l.href}
                onClick={() => setOpen(false)}
                // Row height follows the screen's: roomy on a tall phone, tight
                // enough on an iPhone SE that the sheet still fits.
                className="u-display block py-[clamp(0.8rem,2.8svh,1.5rem)] text-h2"
                style={{ ["--wdth" as string]: 96, transitionDelay: `${i * 40}ms` }}
              >
                {l.label}
              </a>
              {/* No hover on a phone, so the services under "Web & AI" sit in
                  the sheet itself, as one slate line like the home section's. */}
              {"menu" in l && (
                <ul className="u-meta -mt-3 flex flex-wrap gap-x-2.5 gap-y-1 pb-5 text-muted-dark">
                  {webServices.map((s, j) => (
                    <li key={s.slug} className="flex items-center gap-2.5">
                      {j > 0 && <span aria-hidden="true" className="text-paper/45">/</span>}
                      <a href={`/services/${s.slug}`} onClick={() => setOpen(false)} className="cut-link py-1">
                        {s.short}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          <div className="pt-10">
            <MagneticButton href={home + nav.cta.href} variant="solid">
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
