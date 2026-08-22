"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReduced } from "@/lib/motion";

/**
 * Lenis drives scrolling; ScrollTrigger reads from it.
 *
 * Lenis over GSAP's ScrollSmoother because this design is built on
 * `position: sticky`, which ScrollSmoother's transform wrapper fights.
 * Lenis keeps a real scrollTop, so sticky and fixed just work.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (prefersReduced()) return;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    lenis.on("scroll", ScrollTrigger.update);

    // Pinned sections cache their start/end when they are created. Web fonts
    // land after that and reflow every headline, so those cached values go
    // stale — and at the bottom of the page Lenis ends up settling against a
    // boundary that keeps moving, which reads as the scroll juddering up and
    // down. Recompute once the page has genuinely finished laying out.
    ScrollTrigger.config({ ignoreMobileResize: true });

    const refresh = () => ScrollTrigger.refresh();
    if (document.readyState === "complete") refresh();
    else window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh).catch(() => {});

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Anchor links must go through Lenis or they fight the smoothing.
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement)?.closest?.('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -8 });
    };
    document.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("load", refresh);
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}
