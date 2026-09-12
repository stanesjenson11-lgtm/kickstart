"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/motion";

/** Ctrl/Cmd + these are the browser's zoom shortcuts. */
const ZOOM_KEYS = new Set(["+", "-", "=", "_", "0"]);

/** Safari-only pinch events. iPad fires these even when it honours maximum-scale. */
const GESTURES = ["gesturestart", "gesturechange", "gestureend"];

/**
 * Blocks every zoom vector a page is actually allowed to block.
 *
 * Covered: trackpad pinch and ctrl+wheel (both arrive as a wheel event with
 * ctrlKey set), iPad/Safari pinch gestures, two-finger pinch on any touch
 * screen, and the ctrl/cmd +/-/0 keyboard shortcuts. Double-tap and CSS-level
 * pinch are handled by `touch-action` in globals.css.
 *
 * The zoom menu cannot be intercepted, so it is undone instead: browser zoom
 * moves devicePixelRatio, and the counter-scale below cancels the change out.
 * OS-level screen magnification stays out of reach — it is not a page concern.
 *
 * Deliberately separate from SmoothScroll — that component bails out under
 * reduced motion, and the lock has to hold for those visitors too.
 */
export default function ZoomLock() {
  useEffect(() => {
    // Non-passive, or the browser ignores preventDefault on wheel and touch.
    const opts = { passive: false } as const;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault();
    };
    const onGesture = (e: Event) => e.preventDefault();
    const onTouchMove = (e: TouchEvent) => {
      // Nothing here needs two fingers, so a second one is always a pinch.
      if (e.touches.length > 1) e.preventDefault();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ZOOM_KEYS.has(e.key)) e.preventDefault();
    };

    /**
     * The menu-zoom backstop. Browser zoom scales devicePixelRatio, so scaling
     * the document by the reciprocal lands back where we started.
     *
     * CSS `zoom`, not a transform: a transformed wrapper becomes a containing
     * block and breaks every `position: sticky` and `fixed` element, and this
     * whole design is built on sticky. `zoom` scales used lengths instead, so
     * sticky, fixed and the pinned sections all survive it.
     *
     * The baseline is whatever devicePixelRatio reads at mount. There is no way
     * to separate "browser is at 150%" from "this is a 1.5x display", so a
     * visitor who arrives already zoomed keeps that — only *changes* are undone.
     *
     * ponytail: a window dragged between monitors of different DPI also moves
     * devicePixelRatio and will be counter-scaled as if it were zoom. Cheapest
     * fix if that ever bites: also require window.outerWidth to have held still.
     */
    const base = window.devicePixelRatio || 1;
    const root = document.documentElement;
    let applied = 1;

    const counterScale = () => {
      const factor = (window.devicePixelRatio || 1) / base;
      // 4dp — devicePixelRatio arrives as 1.100000023841858 and similar.
      const next = Math.round((1 / factor) * 1e4) / 1e4;
      if (next === applied) return;
      applied = next;
      root.style.setProperty("zoom", next === 1 ? "" : String(next));
      // Pinned sections cached their start/end against the old scale.
      ScrollTrigger.refresh();
    };

    window.addEventListener("wheel", onWheel, opts);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", counterScale);
    document.addEventListener("touchmove", onTouchMove, opts);
    GESTURES.forEach((type) => window.addEventListener(type, onGesture, opts));

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", counterScale);
      document.removeEventListener("touchmove", onTouchMove);
      GESTURES.forEach((type) => window.removeEventListener(type, onGesture));
      root.style.removeProperty("zoom");
    };
  }, []);

  return null;
}
