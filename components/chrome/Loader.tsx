"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReduced } from "@/lib/motion";

/**
 * The bolt draws itself, then the cut opens the page.
 *
 * Kept to ~1.3s — the brief bans long loading animations, and this exists to
 * introduce the motif, not to make anyone wait.
 *
 * It is visible in the server HTML, so a first load or refresh never shows the
 * page before the loader. CSS (.ks-loader) keeps it away from no-JS and
 * reduced-motion visitors and clears it if JS never arrives.
 */
export default function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Hidden already means the CSS failsafe fired before hydration: skip the show.
    if (prefersReduced() || !root.current || getComputedStyle(root.current).visibility === "hidden") {
      return setDone(true);
    }

    const el = root.current;
    el.style.animation = "none"; // JS owns it from here; the failsafe is only for no JS
    const path = el.querySelector<SVGPathElement>("path");
    const len = path?.getTotalLength() ?? 0;

    document.documentElement.style.overflow = "hidden";
    if (path) gsap.set(path, { strokeDasharray: len, strokeDashoffset: len, strokeOpacity: 1 });

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
      className="ks-loader fixed inset-0 z-[var(--z-loader)] grid place-items-center bg-ink"
      style={{ clipPath: "polygon(0 -30%, 100% -42%, 100% 130%, 0 118%)" }}
    >
      <svg viewBox="0 0 100 160" className="h-24 w-auto text-paper" aria-hidden="true">
        {/* Transparent in the server HTML so the bolt doesn't flash before JS
            starts drawing it. */}
        <path
          fillOpacity={0}
          strokeOpacity={0}
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
