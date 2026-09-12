"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import Snap from "lenis/snap";
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

    /**
     * Snap the full-frame sections flush to the viewport. Lenis's own snap, not
     * CSS scroll-snap — CSS snapping fights Lenis's animated scrollTop and ends
     * up juddering.
     *
     * `proximity`, never `mandatory`: Gallery, Testimonials and the FAQ are all
     * taller than one screen, and mandatory would drag you back to the nearest
     * boundary while you were still reading them. Proximity only engages near a
     * boundary, so a tall section snaps flush at its top and then scrolls freely.
     *
     * The 15% threshold is well under the 50% default for the same reason —
     * half a viewport of pull is enough to grab you mid-section.
     */
    let snap: Snap | undefined;

    /**
     * Where a frame should come to rest: its own top, plus its top padding.
     *
     * That padding is the depth of the .cut-top diagonal, so a section that
     * overlaps the one above it lands *below* the overlap and frames only clean
     * content. Sections without the cut have no top padding and land at 0, so
     * this is the same expression for both.
     */
    const frameStart = (section: HTMLElement) => {
      // A pinned section is moved inside a ScrollTrigger pin-spacer, and the
      // spacer is what holds its place in the flow — measuring the section
      // itself would read its pinned position instead.
      const box = section.closest<HTMLElement>(".pin-spacer") ?? section;
      const drop = parseFloat(getComputedStyle(section).paddingTop) || 0;
      return box.getBoundingClientRect().top + lenis.scroll + drop;
    };

    const buildSnap = () => {
      snap?.destroy();
      snap = new Snap(lenis, {
        type: "proximity",
        distanceThreshold: "15%",
        duration: 0.6,
      });
      // Absolute values rather than addElement: the snap point is offset from the
      // element box by the cut, which addElement has no way to express. Rebuilt
      // on every ScrollTrigger refresh below, which covers resize.
      document
        .querySelectorAll<HTMLElement>("[data-frame]")
        .forEach((el) => snap!.add(frameStart(el)));
    };

    // Pinned sections cache their start/end when they are created. Web fonts
    // land after that and reflow every headline, so those cached values go
    // stale — and at the bottom of the page Lenis ends up settling against a
    // boundary that keeps moving, which reads as the scroll juddering up and
    // down. Recompute once the page has genuinely finished laying out.
    ScrollTrigger.config({ ignoreMobileResize: true });

    // Snap points are rebuilt on every refresh — ScrollTrigger runs one on
    // resize of its own accord, and the pin-spacers they measure against only
    // get their final size once it has recalculated.
    ScrollTrigger.addEventListener("refresh", buildSnap);
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
      // A frame has to land on its clean edge, past any cut, or navigating in
      // shows the overlap. Everything else keeps the 8px of air above it.
      const el = target as HTMLElement;
      if (el.hasAttribute("data-frame")) lenis.scrollTo(frameStart(el));
      else lenis.scrollTo(el, { offset: -8 });
    };
    document.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("load", refresh);
      document.removeEventListener("click", onClick);
      ScrollTrigger.removeEventListener("refresh", buildSnap);
      gsap.ticker.remove(tick);
      snap?.destroy();
      lenis.destroy();
    };
  }, []);

  return null;
}
