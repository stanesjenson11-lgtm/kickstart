import Image from "next/image";
import { footer, nav, site } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-[var(--rule-on-dark)] bg-ink">
      {/* The bolt, oversized and cut by the viewport edge. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-[6%] -bottom-[10%] block h-[118%] w-auto text-paper/[0.045]"
        style={{ aspectRatio: "100 / 160" }}
      >
        <svg viewBox="0 0 100 160" className="h-full w-full" fill="currentColor">
          <path d="M62 0 L12 88 L40 82 L32 160 L88 68 L58 74 Z" />
        </svg>
      </span>

      <div className="relative z-[var(--z-content)] px-gutter pt-[clamp(1.5rem,4vh,2.5rem)] pb-6 max-phone:pt-5 max-phone:pb-4">
        {/* Phone: the brand across the top, Site and Follow side by side under
            it. From `bar` up: all three on one row. Follow sits in the right
            corner at every width. */}
        <div className="grid grid-cols-2 gap-x-grid gap-y-5 bar:grid-cols-12 bar:gap-y-0">
          <div className="col-span-2 bar:col-span-5">
            {/* White mark — the footer is always on ink. Height clamp tracks
                the cap height of the text-h2 this replaced. */}
            <Image
              src="/ks white.png"
              alt="Kickstart"
              width={1000}
              height={132}
              sizes="280px"
              className="h-[clamp(1.2rem,2.8vw,2.2rem)] w-auto max-phone:h-4"
            />
            <p className="u-meta mt-2 text-muted-dark">Creative Studio Pvt Ltd</p>
            {/* normal-case with `!`: .u-meta is unlayered and uppercases, and
                unlayered rules beat Tailwind utilities that are not important. */}
            <a
              href={`mailto:${site.email}`}
              className="cut-link mt-4 inline-block u-meta normal-case! break-words text-muted-dark max-phone:mt-3"
            >
              {site.email}
            </a>
          </div>

          {/* The rows are flex so each is as tall as its small mono link. As
              plain blocks they took the body text's line height, 16-18px type
              at 1.6, and that strut was most of the gap between rows. */}
          <nav aria-label="Footer" className="bar:col-span-4">
            <h2 className="u-meta text-muted-dark">Site</h2>
            <ul className="mt-3 flex flex-col gap-2 max-phone:mt-2 max-phone:gap-1.5">
              {nav.links.map((l) => (
                <li key={l.href} className="flex">
                  <a href={l.href} className="cut-link u-meta">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="text-right bar:col-span-3">
            <h2 className="u-meta text-muted-dark">Follow</h2>
            <ul className="mt-3 flex flex-col items-end gap-2 max-phone:mt-2 max-phone:gap-1.5">
              {footer.socials.map((s) => (
                <li key={s.label} className="flex">
                  <a
                    href={s.href}
                    className="cut-link u-meta"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* A plain link, not "#…": the Lenis click handler only takes in-page
            anchors, so this one navigates normally. */}
        <div className="mt-6 flex flex-wrap items-baseline justify-between gap-x-grid gap-y-2 max-phone:mt-5">
          <p className="u-meta text-muted-dark">{footer.copyright}</p>
          <a href="/privacy" className="cut-link u-meta text-muted-dark">
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
}
