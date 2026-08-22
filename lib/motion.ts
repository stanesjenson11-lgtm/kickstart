"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

export { gsap, ScrollTrigger, SplitText };

/** useLayoutEffect warns during SSR; useEffect is the correct server fallback. */
export const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function prefersReduced(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Minimal stand-in for @gsap/react's useGSAP — scopes selector text to a ref
 * and reverts every tween, ScrollTrigger and SplitText on unmount.
 *
 * Bails out entirely under reduced motion. That is safe because every section
 * renders complete and visible by default; animation only ever enhances, so
 * skipping it leaves a finished page rather than a blank one.
 */
export function useGsap<T extends HTMLElement = HTMLDivElement>(
  setup: (ctx: { self: T }) => void,
  deps: unknown[] = [],
) {
  const scope = useRef<T>(null);

  useIsoLayoutEffect(() => {
    if (prefersReduced() || !scope.current) return;
    const self = scope.current;
    const ctx = gsap.context(() => setup({ self }), self);
    return () => ctx.revert();
  }, deps);

  return scope;
}

/**
 * Split a heading into lines and reveal each through the cut.
 * Returns a timeline the caller can attach to a ScrollTrigger.
 *
 * The split is reverted by the enclosing gsap.context, which restores the
 * original markup — important for screen readers and for resize re-splits.
 */
export function splitLines(el: Element, opts: { stagger?: number } = {}) {
  const split = new SplitText(el, {
    type: "lines",
    linesClass: "ks-line",
    mask: "lines",
  });
  gsap.set(split.lines, { yPercent: 110 });
  return { split, lines: split.lines, stagger: opts.stagger ?? 0.08 };
}
