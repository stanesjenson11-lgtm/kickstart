"use client";

import { useEffect, useRef, useState } from "react";
import { Renderer, Program, Mesh, Triangle, Texture } from "ogl";
import { vertex, fragment } from "./shaders";
import { prefersReduced } from "@/lib/motion";

/** Route through Next's optimizer: same-origin (no CORS on the texture) and AVIF/WebP. */
const optimized = (src: string, w = 2048) =>
  `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=75`;

type Props = { plates: readonly string[]; className?: string };

/**
 * The hero's moving image. ogl rather than three.js — everything here is one
 * fullscreen triangle and a shader, so a scene graph would be ~135kb of dead
 * weight.
 *
 * Falls back to a static graded still if WebGL is unavailable or the visitor
 * prefers reduced motion. The <picture> underneath is always rendered, so the
 * hero is never empty while textures load.
 */
export default function HeroCanvas({ plates, className = "" }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    if (prefersReduced() || !host.current) return;
    const el = host.current;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        alpha: false,
        antialias: false,
        dpr: Math.min(window.devicePixelRatio, 1.5),
      });
    } catch {
      return; // No WebGL — the still underneath stands in.
    }

    const gl = renderer.gl;
    gl.canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    el.appendChild(gl.canvas);

    const textures = plates.map(() => new Texture(gl, { generateMipmaps: false }));
    const sizes = plates.map(() => [1, 1] as [number, number]);

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
      },
    });

    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    /* --- textures ----------------------------------------------------- */
    let loaded = 0;
    plates.forEach((src, i) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        textures[i].image = img;
        sizes[i] = [img.naturalWidth, img.naturalHeight];
        if (++loaded === 1) setLive(true);
      };
      img.src = optimized(src);
    });

    /* --- object-fit: cover, in shader space --------------------------- */
    const coverFor = (i: number): [number, number] => {
      const [tw, th] = sizes[i];
      const screen = gl.canvas.width / gl.canvas.height;
      const tex = tw / th;
      return screen > tex ? [1, screen / tex] : [tex / screen, 1];
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
      const n = plates.length;
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
  }, [plates]);

  return (
    <div ref={host} className={`absolute inset-0 overflow-hidden bg-ink ${className}`}>
      {/* Always present: covers texture load, no-WebGL, and reduced motion.
          Plain <img> on purpose — the src is already an optimizer URL, and
          next/image would wrap it in a container that fights the canvas. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={optimized(plates[0], 1920)}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000"
        style={{
          filter: "grayscale(1) contrast(1.24) brightness(0.86)",
          opacity: live ? 0 : 1,
        }}
      />
    </div>
  );
}
