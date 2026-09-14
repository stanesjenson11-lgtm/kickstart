"use client";

import { useEffect, useRef, useState } from "react";
import { Renderer, Program, Mesh, Triangle, Texture } from "ogl";
import { vertex, fragment } from "./shaders";
import { prefersReduced } from "@/lib/motion";
import { shot } from "@/lib/shot";

import { imagePath } from "@/lib/image-loader";

/** One width per plate set, shared by the still and the texture, so each plate
    is fetched once. The two used to ask for different sizes and download twice. */
const PLATE_W = { landscape: 2048, portrait: 1080 };

type Props = {
  plates: readonly string[];
  /** Tall plates for phones held upright. Falls back to `plates`. */
  portraitPlates?: readonly string[];
  /** Fog ramp in texture x, per plate set — the lens is not in the same place. */
  fog?: { landscape: readonly number[]; portrait: readonly number[] };
  /** Projector mattes per plate set, for filling the patch the shot vacates. */
  masks?: { landscape: string; portrait: string };
  className?: string;
};

/** Phones only, matching the other phone-specific rules in globals.css. */
const PHONE = "(max-width: 620px)";

/**
 * The hero's moving image. ogl rather than three.js — everything here is one
 * fullscreen triangle and a shader, so a scene graph would be ~135kb of dead
 * weight.
 *
 * Falls back to a static graded still if WebGL is unavailable or the visitor
 * prefers reduced motion. The still underneath is always rendered, so the hero
 * is never empty while textures load.
 */
export default function HeroCanvas({
  plates,
  portraitPlates,
  fog,
  masks,
  className = "",
}: Props) {
  const host = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  // Bumped when the phone query flips, so the textures are rebuilt at the other
  // orientation. Only rotating a device trips it, so a full teardown is fine.
  const [epoch, setEpoch] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia(PHONE);
    const onChange = () => setEpoch((e) => e + 1);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (prefersReduced() || !host.current) return;
    const el = host.current;
    const portrait = Boolean(
      window.matchMedia(PHONE).matches && portraitPlates?.length,
    );
    const plateSet = portrait && portraitPlates ? portraitPlates : plates;
    const fogRamp = (portrait ? fog?.portrait : fog?.landscape) ?? [0.56, 0.7];

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        alpha: false,
        antialias: false,
        // 1x on phones: grain and halation have no fine detail to lose, and a
        // dense phone screen at 1.5x is most of a mid-range GPU's frame — the
        // same frame the projector shot is scrolling through.
        dpr: window.matchMedia(PHONE).matches ? 1 : Math.min(window.devicePixelRatio, 1.5),
      });
    } catch {
      return; // No WebGL — the still underneath stands in.
    }

    const gl = renderer.gl;
    gl.canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    el.appendChild(gl.canvas);

    const textures = plateSet.map(() => new Texture(gl, { generateMipmaps: false }));
    // Black until it loads, which reads as "nothing vacated" — the right default.
    const maskTex = new Texture(gl, { generateMipmaps: false });
    const maskSrc = portrait ? masks?.portrait : masks?.landscape;
    if (maskSrc) {
      const m = new Image();
      m.decoding = "async";
      m.onload = () => (maskTex.image = m);
      m.src = maskSrc;
    }
    const sizes = plateSet.map(() => [1, 1] as [number, number]);

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        tA: { value: textures[0] },
        tB: { value: textures[1 % textures.length] },
        uCoverA: { value: [1, 1] },
        uCoverB: { value: [1, 1] },
        uMix: { value: 0 },
        uTime: { value: 0 },
        uRes: { value: [1, 1] },
        uMouse: { value: [0.5, 0.45] },
        uMouseAmt: { value: 0 },
        uScroll: { value: 0 },
        uFog: { value: [fogRamp[0], fogRamp[1]] },
        tMask: { value: maskTex },
        uLift: { value: 0 },
      },
    });

    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    /* --- textures ----------------------------------------------------- */
    let loaded = 0;
    plateSet.forEach((src, i) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        textures[i].image = img;
        sizes[i] = [img.naturalWidth, img.naturalHeight];
        if (++loaded === 1) setLive(true);
      };
      img.src = imagePath(src, portrait ? PLATE_W.portrait : PLATE_W.landscape);
    });

    /* --- object-fit: cover, in shader space ---------------------------
       The scale is the share of the texture visible along each axis, so it is
       at most 1 and the plate keeps its proportions. It used to be the
       reciprocal, which sampled past the texture edge: the photograph was
       squashed along one axis and the edge row smeared into the gap. That also
       put the projector somewhere other than where its true-to-life cutout
       would land at the start of the projector shot. */
    const coverFor = (i: number): [number, number] => {
      const [tw, th] = sizes[i];
      const screen = gl.canvas.width / gl.canvas.height;
      const tex = tw / th;
      return screen > tex ? [1, tex / screen] : [screen / tex, 1];
    };

    const resize = () => {
      const r = el.getBoundingClientRect();
      renderer.setSize(r.width, r.height);
      program.uniforms.uRes.value = [gl.canvas.width, gl.canvas.height];
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    /* --- cursor -------------------------------------------------------- */
    const target = { x: 0.5, y: 0.45, amt: 0 };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width;
      target.y = 1 - (e.clientY - r.top) / r.height;
      target.amt = 1;
    };
    const onLeave = () => (target.amt = 0);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    /* --- loop ---------------------------------------------------------- */
    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), {
      threshold: 0,
    });
    io.observe(el);

    const DWELL = 4.6; // seconds per plate, including the dissolve
    const start = performance.now();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || loaded === 0) return;

      const t = (now - start) / 1000;
      const u = program.uniforms;
      u.uTime.value = t;

      // Cross-dissolve through the montage.
      const n = plateSet.length;
      const phase = (t / DWELL) % n;
      const i = Math.floor(phase);
      const f = phase - i;
      const a = i % n;
      const b = (i + 1) % n;
      u.tA.value = textures[a];
      u.tB.value = textures[b];
      u.uCoverA.value = coverFor(a);
      u.uCoverB.value = coverFor(b);
      // Hold, then dissolve over the last third — footage, not a slideshow.
      u.uMix.value = f < 0.66 ? 0 : (f - 0.66) / 0.34;

      // Ease the cursor so the displacement has weight.
      const m = u.uMouse.value as number[];
      m[0] += (target.x - m[0]) * 0.06;
      m[1] += (target.y - m[1]) * 0.06;
      u.uMouseAmt.value += (target.amt - (u.uMouseAmt.value as number)) * 0.05;

      const r = el.getBoundingClientRect();
      u.uScroll.value = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)));
      u.uLift.value = shot.lift;

      renderer.render({ scene: mesh });
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      gl.canvas.remove();
    };
  }, [plates, portraitPlates, fog, masks, epoch]);

  return (
    <div ref={host} className={`absolute inset-0 overflow-hidden bg-ink ${className}`}>
      {/* Always present: covers texture load, no-WebGL, and reduced motion.
          Plain <img> on purpose — the src is already a pre-sized URL, and
          next/image would wrap it in a container that fights the canvas. */}
      {/* A <source>, not JS: the phone requests the portrait plate on first
          paint and never fetches the landscape one at all. */}
      <picture>
        {portraitPlates?.[0] && (
          <source media={PHONE} srcSet={imagePath(portraitPlates[0], PLATE_W.portrait)} />
        )}
        <img
          src={imagePath(plates[0], PLATE_W.landscape)}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
          style={{
            filter: "contrast(1.12) brightness(0.92)",
            opacity: live ? 0 : 1,
          }}
        />
      </picture>
    </div>
  );
}
