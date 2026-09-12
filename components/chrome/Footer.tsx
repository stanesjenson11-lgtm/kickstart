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

      <div className="relative z-[var(--z-content)] px-gutter pt-[clamp(2rem,5vh,3.5rem)] pb-8">
        <div className="grid gap-grid md:grid-cols-12">
          <div className="md:col-span-12 lg:col-span-5">
            {/* White mark — the footer is always on ink. Height clamp tracks
                the cap height of the text-h2 this replaced. */}
            <Image
              src="/ks white.png"
              alt="Kickstart"
              width={1000}
              height={132}
              sizes="280px"
              className="h-[clamp(1.2rem,2.8vw,2.2rem)] w-auto"
            />
            <p className="u-meta mt-3 text-muted-dark">Creative Studio Pvt Ltd</p>
            <a
              href={`mailto:${site.email}`}
              className="cut-link mt-6 inline-block u-meta tracking-[0.06em] break-words text-muted-dark"
            >
              {site.email}
            </a>
          </div>

          <nav aria-label="Footer" className="md:col-span-6 lg:col-span-4">
            <h2 className="u-meta text-muted-dark">Site</h2>
            <ul className="mt-5 flex flex-col gap-3">
              {nav.links.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="cut-link u-meta">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-6 lg:col-span-3">
            <h2 className="u-meta text-muted-dark">Follow</h2>
            <ul className="mt-5 flex flex-col gap-3">
              {footer.socials.map((s) => (
                <li key={s.label}>
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

        <p className="mt-10 u-meta text-muted-dark">{footer.copyright}</p>
      </div>
    </footer>
  );
}
