"use client";

import { useEffect } from "react";

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
 * Not covered, because no page can: the browser's own zoom menu and OS-level
 * screen magnification. Those live above the document.
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

    window.addEventListener("wheel", onWheel, opts);
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("touchmove", onTouchMove, opts);
    GESTURES.forEach((type) => window.addEventListener(type, onGesture, opts));

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("touchmove", onTouchMove);
      GESTURES.forEach((type) => window.removeEventListener(type, onGesture));
    };
  }, []);

  return null;
}
