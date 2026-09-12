"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReduced } from "@/lib/motion";

/**
 * Which cells of the bundled sheet get used, by index (left to right, top to
 * bottom). Curated, not the whole sheet: this crowd is meant to read as a media
 * crew, so it keeps the peeps in collars, jackets and blazers and the ones
 * holding a phone, tablet or notes, and drops the novelty faces — eyepatches,
 * monocles, the third-eye and vampire-tooth variants, joke moustaches and
 * slogan tees. A property of this sheet, so it lives with it rather than at the
 * call site.
 */
const MEDIA_PEEPS = [
  0, 6, 8, 9, 11, 13, 14, 15, 20, 23, 24, 29, 31, 32, 33, 38, 43, 44, 46, 47,
  48, 49, 50, 51, 54, 55, 57, 58, 59, 69, 74, 76, 79, 85, 86, 96, 100,
];

/** Seconds for one lap of the loop at rate 1. */
const CROSS = 30;

/**
 * Lap-rate multipliers, so the crowd is not one conveyor at a single speed.
 * Every peep still has a constant velocity and an exact period, which is what
 * keeps the spread permanent — see the phase note in `build`.
 */
const RATES = [1, 1.2, 1.5];

/** Step cadence, in bobs per second. */
const BOB_SLOW = 0.5;
const BOB_FAST = 0.8;

/**
 * How far a peep sits below the canvas floor, in sheet pixels before `scale`.
 * These sprites are busts cropped near the hip, so the crop has to stay under
 * the bottom edge — a peep that rides even slightly high reads as a legless
 * torso floating in mid-air. SINK_MIN is the guaranteed clearance and the bob
 * is allowed only half of it, so the crop can never surface.
 */
const SINK_MIN = 45;
const SINK_RANGE = 90;

type Peep = {
  rect: [number, number, number, number];
  width: number;
  height: number;
  /** Clearance below the floor, in canvas px. Kept so a resize can re-anchor. */
  sink: number;
  baseY: number;
  dir: 1 | -1;
  /** Position along the lap at t=0, 0–1. */
  phase: number;
  rate: number;
  bobHz: number;
  bobPhase: number;
};

/**
 * A crowd of Open Peeps walking back and forth along the bottom of a canvas.
 * After skiper-ui's `skiper39`, on the `gsap` already here; the registry's demo
 * wrapper is dropped and so is its recycling — each peep there ran a one-shot
 * timeline and was re-admitted at an edge when it finished, which drains the
 * middle and lands the survivors as two clumps meeting head-on. Here every peep
 * holds a fixed lane and loops on its own phase, so the spread never decays:
 * what the first frame looks like is what every later frame looks like.
 *
 * The sprite sheet is one image of `rows` × `cols` cells (the names read
 * backwards: `rows` counts cells ACROSS, `cols` counts them down). A cell is
 * 240×324 in the bundled sheet; `scale` brings that down to a size a footer
 * band can hold, and `count` oversubscribes the curated list — the same peep
 * appearing more than once is what makes the crowd read as a crowd.
 */
export default function CrowdCanvas({
  src,
  rows = 15,
  cols = 7,
  scale = 1,
  count = MEDIA_PEEPS.length,
  className,
}: {
  src: string;
  rows?: number;
  cols?: number;
  scale?: number;
  count?: number;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    // Reduced motion gets an empty canvas rather than a still crowd: this is
    // decoration, and the footer reads fine without it.
    if (!canvas || !ctx || prefersReduced()) return;

    const stage = { width: 0, height: 0 };
    const crowd: Peep[] = [];
    const img = document.createElement("img");
    let dead = false;

    const build = () => {
      const w = (img.naturalWidth / rows) * scale;
      const h = (img.naturalHeight / cols) * scale;
      const sw = img.naturalWidth / rows;
      const sh = img.naturalHeight / cols;

      for (let n = 0; n < count; n++) {
        const i = MEDIA_PEEPS[n % MEDIA_PEEPS.length];
        crowd.push({
          rect: [(i % rows) * sw, ((i / rows) | 0) * sh, sw, sh],
          width: w,
          height: h,
          // Squared, so most of the crowd gathers at the front of the band.
          sink: (SINK_MIN + SINK_RANGE * Math.random() ** 2) * scale,
          baseY: 0,
          dir: n % 2 ? 1 : -1,
          // Evenly spaced, jittered only enough not to read as a parade. Peeps
          // sharing a direction and rate are 6 apart in n, so they stay evenly
          // spaced within their own stream — and a sum of evenly spread streams
          // is itself even, at every moment, forever.
          phase: (n + Math.random() * 0.7) / count,
          rate: RATES[n % RATES.length],
          bobHz: BOB_SLOW + Math.random() * (BOB_FAST - BOB_SLOW),
          bobPhase: Math.random(),
        });
      }
      // Painter's algorithm: the further back a peep stands, the earlier it draws.
      crowd.sort((a, b) => a.sink - b.sink);
    };

    const layout = () => {
      stage.width = canvas.clientWidth;
      stage.height = canvas.clientHeight;
      canvas.width = stage.width * devicePixelRatio;
      canvas.height = stage.height * devicePixelRatio;
      // Lanes survive a resize, so no reshuffle when a mobile URL bar collapses.
      for (const p of crowd) p.baseY = stage.height - p.height + p.sink;
    };

    const render = () => {
      const t = gsap.ticker.time;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(devicePixelRatio, devicePixelRatio);

      for (const p of crowd) {
        // One lap runs from fully off one edge to fully off the other.
        const span = stage.width + p.width * 2;
        const u = ((t * p.rate) / CROSS + p.phase) % 1;
        const x = p.dir > 0 ? -p.width + u * span : stage.width + p.width - u * span;
        const lift =
          Math.abs(Math.sin((t * p.bobHz + p.bobPhase) * Math.PI)) * SINK_MIN * 0.5 * scale;

        ctx.save();
        ctx.translate(x, p.baseY - lift);
        ctx.scale(p.dir, 1);
        ctx.drawImage(img, ...p.rect, 0, 0, p.width, p.height);
        ctx.restore();
      }

      ctx.restore();
    };

    img.onload = () => {
      if (dead) return;
      build();
      layout();
      gsap.ticker.add(render);
    };
    img.src = src;
    window.addEventListener("resize", layout);

    return () => {
      dead = true;
      window.removeEventListener("resize", layout);
      gsap.ticker.remove(render);
    };
  }, [src, rows, cols, scale, count]);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}

/**
 * Adapted from skiper-ui `skiper39` (https://skiper-ui.com), itself after
 * https://codepen.io/zadvorsky/pen/xxwbBQV. Figures are Open Peeps by Pablo
 * Stanley (https://openpeeps.com), CC0. Skiper UI's free tier asks for
 * attribution — this notice is it.
 */
