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
      /* Touch runs through Lenis too. Left native, a phone scrolls the page on
         the compositor while the pins and the projector shot are moved a frame
         later on the main thread — the shake and flicker — and native momentum
         cannot be held at the keyframes below. Drag stays 1:1 with the finger:
         no touchMultiplier. */
      syncTouch: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    /**
     * Keyframes: scroll positions momentum comes to rest on instead of carrying
     * past, so one flick cannot throw a visitor straight through the projector
     * shot. ProjectorShot publishes them on every refresh, as a window event
     * like ks:snap below.
     *
     * Momentum only — a released swipe or the wheel's smoothing, both of which
     * aim ahead of where the page is. A finger still on the glass is never
     * stopped, and a programmatic scroll keeps its target level with its
     * position, so it never matches. Resting on a key, the next gesture goes on
     * past it.
     */
    let keys: number[] = [];
    const onKeys = (e: Event) => {
      keys = (e as CustomEvent<number[]>).detail;
    };
    window.addEventListener("ks:keys", onKeys);
    lenis.on("scroll", () => {
      if (lenis.isTouching || !keys.length) return;
      const from = lenis.animatedScroll;
      const to = lenis.targetScroll;
      const key =
        to > from
          ? keys.find((k) => k > from + 1 && k < to)
          : keys.filter((k) => k < from - 1 && k > to).pop();
      if (key !== undefined) lenis.scrollTo(key, { programmatic: false, lerp: 0.1 });
    });

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
    // Off while the projector shot is scrubbing — see onSnapToggle below.
    let snapOn = true;

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
      // A rebuild mid-shot (a refresh on resize) must not quietly re-arm it.
      if (!snapOn) snap.stop();
    };

    /**
     * The projector shot suspends snapping for its own scroll range. Stopping
     * partway through the shot has to hold the frame where it is, not pull the
     * page back to the hero and rewind the shot. A window event keeps the shot
     * from needing a handle on this component.
     */
    const onSnapToggle = (e: Event) => {
      snapOn = (e as CustomEvent<boolean>).detail;
      if (snapOn) snap?.start();
      else snap?.stop();
    };
    window.addEventListener("ks:snap", onSnapToggle);

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

    // A grab on the page scrollbar hands scrolling straight to the browser.
    // Lenis ignores native scroll while one of its own animations runs (a
    // wheel glide, a snap, a keyframe hold) and keeps writing its position, so
    // a drag begun then was pulled back from under the pointer. Landing where
    // the page already is, immediately, ends that animation.
    const onPointerDown = (e: PointerEvent) => {
      if (e.clientX < document.documentElement.clientWidth) return;
      lenis.scrollTo(window.scrollY, { immediate: true, force: true });
    };
    window.addEventListener("pointerdown", onPointerDown);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("load", refresh);
      window.removeEventListener("ks:snap", onSnapToggle);
      window.removeEventListener("ks:keys", onKeys);
      document.removeEventListener("click", onClick);
      ScrollTrigger.removeEventListener("refresh", buildSnap);
      gsap.ticker.remove(tick);
      snap?.destroy();
      lenis.destroy();
    };
  }, []);

  return null;
}
