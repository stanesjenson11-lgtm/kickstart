"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReduced } from "@/lib/motion";

type Peep = {
  rect: [number, number, number, number];
  width: number;
  height: number;
  x: number;
  y: number;
  anchorY: number;
  scaleX: number;
  walk: gsap.core.Timeline | null;
};

/**
 * Which cells of the bundled sheet get used, by index (left to right, top to
 * bottom). Curated, not the whole sheet: this crowd is meant to read as a media
 * crew, so it keeps the peeps in collars, jackets and blazers and the ones
 * holding a phone, tablet or notes, and drops the novelty faces — eyepatches,
 * monocles, the third-eye and vampire-tooth variants, joke moustaches and
 * slogan tees. A property of this sheet, so it lives with it rather than at the
 * call site.
 */
/* Walk tuning, in seconds. CROSS is how long one peep takes to cross the full
   width before timeScale varies it; STEP is the bob period, and has to stay in
   proportion to CROSS or a slow walker bobs like a fast one on the spot. */
const CROSS = 30;
const STEP = 0.75;

/* How far a peep sinks below the canvas floor, in sheet pixels before `scale`.
   Never negative: these sprites are busts cropped near the hip, so the crop has
   to stay under the bottom edge — lift one and it reads as a legless torso
   hovering in mid-air. SINK_MIN clears the bob's own lift, and SINK_RANGE is
   kept tight so the crowd stays a packed bank of heads rather than scattering
   into lone figures with empty space under them. */
const SINK_MIN = 12;
const SINK_RANGE = 110;

const MEDIA_PEEPS = [
  0, 6, 8, 9, 11, 13, 14, 15, 20, 23, 24, 29, 31, 32, 33, 38, 43, 44, 46, 47,
  48, 49, 50, 51, 54, 55, 57, 58, 59, 69, 74, 76, 79, 85, 86, 96, 100,
];

/**
 * A crowd of Open Peeps walking back and forth along the bottom of a canvas.
 * skiper-ui's `skiper39`, on the `gsap` already here; the registry's demo
 * wrapper is dropped — this site supplies its own frame.
 *
 * The sprite sheet is one image of `rows` × `cols` cells (the names read
 * backwards: `rows` counts cells ACROSS, `cols` counts them down). A cell is
 * 240×324 in the bundled sheet; `scale` is what brings that down to a size a
 * footer band can hold, and `count` oversubscribes the curated list — the same
 * peep appearing more than once is what makes the crowd read as a crowd.
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

    const rand = (min: number, max: number) => min + Math.random() * (max - min);
    const pluck = <T,>(a: T[], i: number) => a.splice(i, 1)[0];

    const stage = { width: 0, height: 0 };
    const all: Peep[] = [];
    const idle: Peep[] = [];
    const crowd: Peep[] = [];

    const img = document.createElement("img");
    let dead = false;

    /** Park a peep off one edge at a random depth, facing the way it will walk. */
    const reset = (peep: Peep) => {
      const rightward = Math.random() > 0.5;
      // Always downward, so every crop stays hidden under the floor.
      // power2.in keeps most of the crowd near the front row.
      const sink =
        (SINK_MIN + SINK_RANGE * gsap.parseEase("power2.in")(Math.random())) * scale;
      const startY = stage.height - peep.height + sink;

      peep.scaleX = rightward ? 1 : -1;
      peep.x = rightward ? -peep.width : stage.width + peep.width;
      peep.y = startY;
      peep.anchorY = startY;
      return { startY, endX: rightward ? stage.width : 0 };
    };

    const walk = (peep: Peep) => {
      const { startY, endX } = reset(peep);
      const tl = gsap.timeline();
      tl.timeScale(rand(0.75, 1.25));
      tl.to(peep, { duration: CROSS, x: endX, ease: "none" }, 0);
      // The lift is capped by SINK_MIN, or the bob is what exposes the crop.
      tl.to(
        peep,
        { duration: STEP, repeat: CROSS / STEP - 1, yoyo: true, y: startY - SINK_MIN * scale },
        0,
      );
      return tl;
    };

    const admit = () => {
      const peep = pluck(idle, (Math.random() * idle.length) | 0);
      peep.walk = walk(peep).eventCallback("onComplete", () => {
        pluck(crowd, crowd.indexOf(peep));
        idle.push(peep);
        admit();
      });
      crowd.push(peep);
      // Painter's algorithm: the further back a peep started, the earlier it draws.
      crowd.sort((a, b) => a.anchorY - b.anchorY);
      return peep;
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(devicePixelRatio, devicePixelRatio);
      for (const p of crowd) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.scale(p.scaleX, 1);
        ctx.drawImage(img, ...p.rect, 0, 0, p.width, p.height);
        ctx.restore();
      }
      ctx.restore();
    };

    const resize = () => {
      stage.width = canvas.clientWidth;
      stage.height = canvas.clientHeight;
      canvas.width = stage.width * devicePixelRatio;
      canvas.height = stage.height * devicePixelRatio;

      for (const p of crowd) p.walk?.kill();
      crowd.length = 0;
      idle.length = 0;
      idle.push(...all);
      // Seeded at evenly spaced points along the walk rather than random ones:
      // random seeding clumps, and a clump means a bare patch somewhere else
      // where a single peep walks alone with its cropped edge on show. The
      // jitter keeps the spacing from reading as a parade.
      const total = all.length;
      for (let n = 0; n < total; n++) admit().walk!.progress((n + Math.random()) / total);
    };

    const init = () => {
      if (dead) return;
      const w = img.naturalWidth / rows;
      const h = img.naturalHeight / cols;
      for (let n = 0; n < count; n++) {
        const i = MEDIA_PEEPS[n % MEDIA_PEEPS.length];
        all.push({
          rect: [(i % rows) * w, ((i / rows) | 0) * h, w, h],
          width: w * scale,
          height: h * scale,
          x: 0,
          y: 0,
          anchorY: 0,
          scaleX: 1,
          walk: null,
        });
      }
      resize();
      gsap.ticker.add(render);
    };

    img.onload = init;
    img.src = src;
    window.addEventListener("resize", resize);

    return () => {
      dead = true;
      window.removeEventListener("resize", resize);
      gsap.ticker.remove(render);
      for (const p of crowd) p.walk?.kill();
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
