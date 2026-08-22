"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReduced } from "@/lib/motion";

/**
 * The bolt draws itself, then the cut opens the page.
 *
 * Kept to ~1.3s — the brief bans long loading animations, and this exists to
 * introduce the motif, not to make anyone wait.
 *
 * It renders hidden and is only revealed by JS, so no-JS visitors, crawlers and
 * reduced-motion users never meet a black screen they cannot get past.
 */
export default function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (prefersReduced() || !root.current) return setDone(true);

    const el = root.current;
    const path = el.querySelector<SVGPathElement>("path");
    const len = path?.getTotalLength() ?? 0;

    document.documentElement.style.overflow = "hidden";
    gsap.set(el, { opacity: 1, pointerEvents: "auto" });
    if (path) gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, fillOpacity: 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        document.documentElement.style.overflow = "";
        setDone(true);
      },
    });

    if (path) {
      tl.to(path, { strokeDashoffset: 0, duration: 0.62, ease: "power2.inOut" }).to(
        path,
        { fillOpacity: 1, duration: 0.28, ease: "power2.out" },
        "-=0.12",
      );
    }

    tl.to(
      el,
      {
        // Out along the cut — the same diagonal as every other transition.
        clipPath: "polygon(0 -30%, 100% -42%, 100% -30%, 0 -18%)",
        duration: 0.72,
        ease: "expo.inOut",
      },
      "+=0.06",
    );

    return () => {
      document.documentElement.style.overflow = "";
      tl.kill();
    };
  }, []);

  if (done) return null;

  return (
    <div
      ref={root}
      aria-hidden="true"
      className="fixed inset-0 z-[var(--z-loader)] grid place-items-center bg-ink opacity-0"
      style={{
        pointerEvents: "none",
        clipPath: "polygon(0 -30%, 100% -42%, 100% 130%, 0 118%)",
      }}
    >
      <svg viewBox="0 0 100 160" className="h-24 w-auto text-paper" aria-hidden="true">
        <path
          d="M62 0 L12 88 L40 82 L32 160 L88 68 L58 74 Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
