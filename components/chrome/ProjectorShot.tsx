"use client";

import { useEffect, useRef, useState } from "react";
import { hero } from "@/lib/content";
import { gsap, ScrollTrigger, prefersReduced } from "@/lib/motion";
import { shot } from "@/lib/shot";
import BeamCanvas from "@/components/gl/BeamCanvas";

/** Phones only, the same line HeroCanvas swaps plates on. */
const PHONE = "(max-width: 620px)";

/** Through Next's optimizer: the cutout PNGs are heavy, AVIF/WebP keep the alpha. */
const optimized = (src: string, w: number) =>
  `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;

/** Timeline position where the projector separates from the photograph and travels. */
const TRAVEL_AT = 0.18;

/**
 * How far each face of the photograph turns before handing over to the other.
 * A flat image turned to 90° is a sliver, the one frame that gives away that it
 * is a picture, so each face stops well short of it and the two cross-fade while
 * both are still foreshortened.
 */
const FLIP_MAX = 72;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/**
 * The projector shot.
 *
 * The projector lifts out of the hero photograph, turns round in the air as it
 * travels, and comes to rest on the right of Statement facing the headline. Its
 * light reaches across the dark studio, lands on the headline, and sweeps along
 * it from the right, lighting the letters it crosses.
 *
 * One scrubbed timeline over plain numbers, so reversing the scroll reverses the
 * shot exactly — nothing here fires one-way callbacks. `apply()` turns those
 * numbers into the rig's transform, the beam's geometry, the plate's lift, and
 * Statement's custom properties.
 *
 * Under reduced motion this component renders nothing and Statement keeps its
 * CSS end state: dark, fully lit.
 */
export default function ProjectorShot() {
  const rig = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const [portrait, setPortrait] = useState<boolean | null>(null);

  // Which plate is live decides which cutout travels.
  useEffect(() => {
    if (prefersReduced()) return;
    const mq = window.matchMedia(PHONE);
    const sync = () => setPortrait(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (portrait === null || !rig.current || !body.current) return;
    const heroEl = document.getElementById("top");
    const stage = document.getElementById("statement");
    const headline = stage?.querySelector<HTMLElement>(".st-base");
    if (!heroEl || !stage || !headline) return;

    const key = portrait ? "portrait" : "landscape";
    const plate = hero.shot.plates[key];
    const end = hero.shot.end[key];
    const rigEl = rig.current;
    const bodyEl = body.current;
    const faceR = bodyEl.querySelector<HTMLImageElement>('[data-face="right"]');
    const faceL = bodyEl.querySelector<HTMLImageElement>('[data-face="left"]');
    const lens = bodyEl.querySelector<HTMLElement>("[data-lens]");
    // The cutout's true height/width, in image pixels.
    const trueRatio = plate.rect.h / plate.rect.w / plate.aspect;

    // Everything the timeline scrubs. Each is 0 → 1.
    const s = {
      rig: 0, lift: 0, travel: 0, flip: 0, aim: 0,
      dark: 0, beam: 0, reach: 0, spill: 0, pool: 0, sweep: 0,
    };

    /**
     * Where the projector is drawn in the hero photograph, in viewport pixels —
     * now, or as it was at scroll position `atScroll`. The inverse of
     * HeroCanvas's texture mapping: cover scale, then the scroll pinch from
     * shaders.ts main(). Width and height are separate because the pinch
     * stretches the plate vertically as it scrolls.
     */
    const inPlate = (atScroll?: number) => {
      const r = heroEl.getBoundingClientRect();
      const rTop = atScroll === undefined ? r.top : r.top + window.scrollY - atScroll;
      const screen = r.width / r.height;
      const sx = screen > plate.aspect ? 1 : screen / plate.aspect;
      const sy = screen > plate.aspect ? plate.aspect / screen : 1;
      const u = clamp01(-rTop / r.height);
      const fx = sx * (1 - u * 0.06);
      const fy = sy * ((1 - u * 0.06) / (1 - u * 0.16));
      const w = (r.width * plate.rect.w) / fx;
      const h = (r.height * plate.rect.h) / fy;
      const left = r.left + r.width * (0.5 + (plate.rect.x - 0.5) / fx);
      const top = rTop + r.height * (0.5 + (plate.rect.y - 0.5) / fy);
      // The plate's grade at that spot — vignette and scroll dimming — so the
      // handoff has no seam.
      const vx = (left + w / 2 - r.left) / r.width - 0.5;
      const vy = (top + h / 2 - rTop) / r.height - 0.5;
      const vignette = lerp(0.42, 1, 1 - smooth(0.28, 1.15, Math.hypot(vx * screen, vy)));
      return { cx: left + w / 2, cy: top + h / 2, w, h, shade: vignette * (1 - u * 0.45) };
    };

    // Scroll position at which the projector separates from the photograph.
    // Set on every refresh.
    let detachAt = 0;

    const apply = () => {
      // It follows the photograph only until it separates. After that it is its
      // own object and travels from where it was at that moment, rather than
      // carrying on off the top of the screen with the hero.
      const a = window.scrollY < detachAt ? inPlate() : inPlate(detachAt);
      const W = window.innerWidth;
      const H = window.innerHeight;
      const st = stage.getBoundingClientRect();
      const t = s.travel;

      // The rest pose lives in Statement's frame, so the projector arrives with
      // the section and leaves with it once the pin lets go.
      const ew = end.width * W;
      const cx = lerp(a.cx, st.left + end.cx * W, t);
      // Not a straight slide: a slight sag mid-flight, the way something with
      // weight settles, while z carries it toward the viewer.
      const cy = lerp(a.cy, st.top + end.cy * H, t) + Math.sin(Math.PI * t) * H * 0.04;
      const w = lerp(a.w, ew, t);
      const h = lerp(a.h, ew * trueRatio, t);
      const z = Math.sin(Math.PI * t) * 120 + smooth(0, 1, s.lift) * 24;

      // The turn. First half, the photograph as shot: the lens swings round
      // toward the viewer. Second half, its mirror, already turned, swings the
      // rest of the way to face left. They cross-fade mid-turn.
      const f = s.flip;
      const flipYaw = f < 0.5 ? -FLIP_MAX * (f / 0.5) : FLIP_MAX * (1 - (f - 0.5) / 0.5);
      const toLeft = smooth(0.42, 0.58, f);

      rigEl.style.opacity = String(s.rig);
      bodyEl.style.width = `${w}px`;
      bodyEl.style.height = `${h}px`;
      bodyEl.style.transform =
        `translate3d(${cx - w / 2}px, ${cy - h / 2}px, ${z}px) ` +
        `rotateY(${flipYaw + end.yaw * s.aim}deg) ` +
        `rotateX(${end.pitch * s.aim}deg) rotateZ(${end.roll * s.aim}deg)`;
      const filter = `contrast(1.12) brightness(${(0.96 * lerp(a.shade, 1, t)).toFixed(3)})`;
      if (faceR) {
        faceR.style.opacity = String(1 - toLeft);
        faceR.style.filter = filter;
      }
      if (faceL) {
        faceL.style.opacity = String(toLeft);
        faceL.style.filter = filter;
      }

      shot.lift = s.lift;

      // The beam leaves the lens — read off the page, so it follows every
      // transform above — and lands on the headline: first at its right end,
      // nearest the projector, then along it to the left as the sweep runs.
      const hl = headline.getBoundingClientRect();
      const lr = lens?.getBoundingClientRect();
      const hx = hl.left + hl.width * lerp(0.9, 0.08, s.sweep);
      const hy = hl.top + hl.height * lerp(0.6, 0.42, s.sweep);
      const b = shot.beam;
      // Off once Statement has scrolled away, or it would draw over what follows.
      b.on = st.bottom < 0 ? 0 : s.beam;
      b.reach = s.reach;
      b.spread = end.spread;
      if (lr) {
        b.ox = lr.left + lr.width / 2;
        b.oy = lr.top + lr.height / 2;
      }
      b.tx = hx;
      b.ty = hy;

      stage.style.setProperty("--dark", s.dark.toFixed(4));
      stage.style.setProperty("--pool", s.pool.toFixed(4));
      stage.style.setProperty("--lit", s.sweep.toFixed(4));
      stage.style.setProperty("--spill", s.spill.toFixed(4));
      // The navbar reads .on-paper to pick its ink; hand it over mid-drench.
      stage.classList.toggle("on-paper", s.dark < 0.5);
      // The lit pool and the room's spill sit exactly where the beam lands.
      stage.style.setProperty("--pool-x", `${(((hx - hl.left) / hl.width) * 100).toFixed(2)}%`);
      stage.style.setProperty("--pool-y", `${(((hy - hl.top) / hl.height) * 100).toFixed(2)}%`);
      stage.style.setProperty("--spill-x", `${(((hx - st.left) / st.width) * 100).toFixed(2)}%`);
      stage.style.setProperty("--spill-y", `${(((hy - st.top) / st.height) * 100).toFixed(2)}%`);
    };

    const ctx = gsap.context(() => {
      // Statement holds the frame while the projector settles and the light
      // lands. refreshPriority 1: this pin has to be measured before the
      // Showreel pin below it, or everything after is laid out short.
      const pin = ScrollTrigger.create({
        trigger: stage,
        start: "top top",
        end: "+=140%",
        pin: true,
        refreshPriority: 1,
      });

      // The brief's beats: separation from 0.2, first light at 0.4, arrival at
      // 0.6, the beam on the headline at 0.8, fully lit by 1.
      const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
      tl.fromTo(s, { rig: 0 }, { rig: 1, duration: 0.05 }, 0)
        .fromTo(s, { lift: 0 }, { lift: 1, duration: 0.2 }, 0.02)
        .fromTo(s, { travel: 0 }, { travel: 1, duration: 0.42, ease: "power2.inOut" }, TRAVEL_AT)
        .fromTo(s, { flip: 0 }, { flip: 1, duration: 0.18, ease: "power1.inOut" }, 0.24)
        .fromTo(s, { dark: 0 }, { dark: 1, duration: 0.2 }, 0.4)
        .fromTo(s, { beam: 0 }, { beam: 1, duration: 0.45, ease: "power2.in" }, 0.4)
        .fromTo(s, { reach: 0 }, { reach: 1, duration: 0.4, ease: "power2.inOut" }, 0.4)
        .fromTo(s, { aim: 0 }, { aim: 1, duration: 0.47, ease: "power2.inOut" }, 0.45)
        .fromTo(s, { spill: 0 }, { spill: 1, duration: 0.26, ease: "power1.inOut" }, 0.7)
        .fromTo(s, { pool: 0 }, { pool: 1, duration: 0.08 }, 0.78)
        .fromTo(s, { sweep: 0 }, { sweep: 1, duration: 0.2, ease: "power1.inOut" }, 0.78)
        // Pad to exactly 1 so the beats above sit at their true fractions.
        .to({}, { duration: 0.02 }, 0.98);

      ScrollTrigger.create({
        trigger: stage,
        start: 0,
        end: () => pin.end,
        animation: tl,
        scrub: true,
        refreshPriority: 1,
        onUpdate: apply,
        onRefresh: (self) => {
          detachAt = self.start + TRAVEL_AT * (self.end - self.start);
          // Published for the screenshot check, which maps progress to scroll.
          stage.dataset.shotStart = String(Math.round(self.start));
          stage.dataset.shotEnd = String(Math.round(self.end));
          apply();
        },
        // Snapping would pull a visitor who stops mid-shot back to the hero and
        // rewind the shot; hold the frame instead.
        onToggle: (self) =>
          window.dispatchEvent(new CustomEvent("ks:snap", { detail: !self.isActive })),
      });

      // After the pin lets go, the projector and its light scroll away with
      // Statement, and the beam switches off once the section is gone.
      ScrollTrigger.create({
        start: () => pin.end,
        end: () => pin.end + window.innerHeight * 1.5,
        onUpdate: apply,
        onLeave: apply,
        onLeaveBack: apply,
      });

      apply();
    });

    return () => {
      ctx.revert();
      window.dispatchEvent(new CustomEvent("ks:snap", { detail: true }));
      shot.lift = 0;
      shot.beam.on = 0;
      // Back to the CSS end state, which is the no-JS state.
      for (const p of [
        "--dark", "--pool", "--lit", "--spill",
        "--pool-x", "--pool-y", "--spill-x", "--spill-y",
      ]) {
        stage.style.removeProperty(p);
      }
      stage.classList.remove("on-paper");
      delete stage.dataset.shotStart;
      delete stage.dataset.shotEnd;
    };
  }, [portrait]);

  if (portrait === null) return null;
  const plate = hero.shot.plates[portrait ? "portrait" : "landscape"];
  const width = portrait ? 640 : 1080;

  return (
    <>
      <div
        ref={rig}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[var(--z-stage)] opacity-0 [perspective:1400px]"
      >
        <div
          ref={body}
          className="absolute left-0 top-0 origin-center will-change-transform [transform-style:preserve-3d]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- optimizer URLs
              moved every frame by hand; next/image would wrap them in a box that
              fights the transform. */}
          <img
            data-face="right"
            src={optimized(plate.cutout, width)}
            alt=""
            draggable={false}
            className="absolute inset-0 block h-full w-full select-none"
          />
          {/* The photograph mirrored, its lettering put back the right way
              round, for after the turn (scripts/cutout.py). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            data-face="left"
            src={optimized(plate.cutoutLeft, width)}
            alt=""
            draggable={false}
            className="absolute inset-0 block h-full w-full select-none opacity-0"
          />
          {/* The lens of the turned projector: the beam reads this point's
              position, which follows every transform on the rig for free. */}
          <span
            data-lens
            className="absolute h-px w-px"
            style={{ left: `${(1 - plate.lens[0]) * 100}%`, top: `${plate.lens[1] * 100}%` }}
          />
        </div>
      </div>
      <BeamCanvas />
    </>
  );
}
