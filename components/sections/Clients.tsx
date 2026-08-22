"use client";

import Image from "next/image";
import { clients } from "@/lib/content";
import { useGsap, gsap } from "@/lib/motion";

/**
 * Genuine clients only. The brief is explicit: if there are not enough strong
 * logos yet, omit the section rather than padding it with weak ones — so this
 * renders nothing until `clients` in lib/content.ts has real entries.
 */
export default function Clients() {
  const scope = useGsap<HTMLElement>(({ self }) => {
    gsap.from(self.querySelectorAll<HTMLElement>(".client-item"), {
      opacity: 0,
      y: 20,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.05,
      scrollTrigger: { trigger: self, start: "top 78%" },
    });
  }, []);

  if (clients.length === 0) return null;

  return (
    <section ref={scope} className="bg-ink px-gutter py-section">
      <h2 className="u-display text-h2 max-w-[18ch]" style={{ ["--wdth" as string]: 104 }}>
        Trusted by brands that think forward.
      </h2>

      <ul className="mt-14 grid grid-cols-2 gap-px border border-[var(--rule-on-dark)] bg-[var(--rule-on-dark)] sm:grid-cols-3 lg:grid-cols-4">
        {clients.map((c) => (
          <li
            key={c.name}
            className="client-item flex h-28 items-center justify-center bg-ink px-6"
          >
            {c.logo ? (
              <Image
                src={c.logo}
                alt={c.name}
                width={160}
                height={48}
                className="max-h-10 w-auto opacity-70 grayscale transition-opacity duration-500 hover:opacity-100"
              />
            ) : (
              <span className="u-meta text-center text-muted-dark">{c.name}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
