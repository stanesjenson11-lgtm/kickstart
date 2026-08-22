import { faq } from "@/lib/content";

/**
 * Native <details>. With `interpolate-size: allow-keywords` on :root and
 * `transition-behavior: allow-discrete`, the panel animates to and from
 * height:auto in CSS alone — no JS accordion, no measuring, and it still works
 * with search-in-page, keyboard, and screen readers for free.
 */
export default function Faq() {
  return (
    <section className="bg-ink px-gutter py-section">
      <div className="md:grid md:grid-cols-12 md:gap-8">
        <h2
          className="u-display text-h2 md:col-span-5 lg:col-span-4"
          style={{ ["--wdth" as string]: 106 }}
        >
          Questions, answered.
        </h2>

        <div className="mt-12 md:col-span-7 md:mt-0 lg:col-span-8">
          {faq.map((item) => (
            <details
              key={item.q}
              name="faq"
              className="ks-faq group border-t border-[var(--rule-on-dark)] last:border-b"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-h3 u-display marker:content-none">
                <span style={{ ["--wdth" as string]: 96 }}>{item.q}</span>
                <span
                  aria-hidden="true"
                  className="relative mt-2 block h-3 w-3 shrink-0 text-muted-dark"
                >
                  <span className="absolute top-1/2 left-0 block h-px w-full bg-current" />
                  <span className="absolute top-1/2 left-0 block h-px w-full bg-current transition-transform duration-400 ease-[var(--ease-out-expo)] group-open:rotate-0 rotate-90" />
                </span>
              </summary>
              <div className="ks-faq-panel">
                <p className="u-measure pb-8 text-body text-muted-dark">{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
