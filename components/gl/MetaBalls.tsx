"use client";

import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Vec3 } from "ogl";
import { prefersReduced } from "@/lib/motion";

const vertex = /* glsl */ `#version 300 es
  in vec2 position;
  void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

/**
 * Metaballs: N moving charges summed into a single field, cut at a threshold.
 * Where two charges overlap the field crosses the threshold early, so the
 * shapes appear to fuse — ink pooling rather than circles colliding.
 */
const fragment = /* glsl */ `#version 300 es
  precision highp float;
  out vec4 fragColor;

  uniform vec3 uRes;
  uniform float uTime;
  uniform vec2 uPointer;
  uniform float uPointerR;
  uniform int uCount;
  uniform float uScale;
  uniform vec3 uBalls[24];

  float charge(vec2 c, float r, vec2 p) {
    vec2 d = p - c;
    return (r * r) / max(dot(d, d), 1e-4);
  }

  void main() {
    vec2 fc = gl_FragCoord.xy;
    float s = uScale / uRes.y;
    vec2 p = (fc - uRes.xy * 0.5) * s;

    float total = 0.0;
    for (int i = 0; i < 24; i++) {
      if (i >= uCount) break;
      total += charge(uBalls[i].xy, uBalls[i].z, p);
    }
    total += charge((uPointer - uRes.xy * 0.5) * s, uPointerR, p);

    // fwidth keeps the rim one pixel wide at any resolution.
    float edge = smoothstep(-1.0, 1.0, (total - 1.35) / max(fwidth(total), 1e-4));

    // A faint inner falloff so the pools read as ink, not flat white cutouts.
    float body = smoothstep(1.35, 3.4, total);
    float a = edge * (0.30 + body * 0.42);

    fragColor = vec4(vec3(1.0), a);
  }
`;

type Props = { count?: number; scale?: number; speed?: number; className?: string };

/**
 * Ink pooling behind a section. Monochrome by necessity — the site has no
 * accent colour, so these are white on transparent and read as spill rather
 * than as the usual rainbow blobs.
 *
 * A fullscreen shader is the most expensive thing on this page (measured at
 * roughly 36fps of cost in the hero), so this one is strictly gated: it renders
 * only while its section is actually on screen, caps DPR at 1, and stops dead
 * under reduced motion.
 */
export default function MetaBalls({
  count = 9,
  scale = 34,
  speed = 0.26,
  className = "",
}: Props) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el || prefersReduced()) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({ dpr: 1, alpha: true, premultipliedAlpha: false });
    } catch {
      return; // No WebGL: the section is designed to read without this.
    }

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    el.appendChild(gl.canvas);

    const n = Math.min(count, 24);
    const balls = Array.from({ length: 24 }, () => new Vec3(0, 0, 0));

    // Deterministic orbits — a fixed seed per ball, so the field is the same
    // composition on every load rather than a different accident each time.
    const orbit = Array.from({ length: n }, (_, i) => {
      const f = (k: number) => {
        const x = Math.sin((i + 1) * k) * 43758.5453;
        return x - Math.floor(x);
      };
      return {
        phase: f(12.9898) * Math.PI * 2,
        rate: 0.35 + f(78.233) * 0.9,
        radius: 4.5 + f(39.425) * 6.5,
        size: 0.9 + f(93.989) * 1.9,
        wobble: f(17.17) > 0.5 ? 1 : -1,
      };
    });

    const program = new Program(gl, {
      vertex,
      fragment,
      transparent: true,
      uniforms: {
        uRes: { value: [1, 1, 0] },
        uTime: { value: 0 },
        uPointer: { value: [0, 0] },
        uPointerR: { value: 0 },
        uCount: { value: n },
        uScale: { value: scale },
        uBalls: { value: balls },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const resize = () => {
      const r = el.getBoundingClientRect();
      renderer.setSize(r.width, r.height);
      program.uniforms.uRes.value = [gl.canvas.width, gl.canvas.height, 0];
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const target = { x: 0, y: 0, r: 0 };
    const eased = { x: 0, y: 0, r: 0 };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width) * gl.canvas.width;
      target.y = (1 - (e.clientY - r.top) / r.height) * gl.canvas.height;
      target.r = 2.6;
    };
    const onLeave = () => (target.r = 0);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);

    // The gate: nothing renders unless the section is genuinely in view.
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), {
      rootMargin: "120px",
    });
    io.observe(el);

    let raf = 0;
    const t0 = performance.now();
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;

      const t = ((now - t0) / 1000) * speed;
      program.uniforms.uTime.value = t;

      for (let i = 0; i < n; i++) {
        const o = orbit[i];
        const a = o.phase + t * o.rate;
        balls[i].set(
          Math.cos(a) * o.radius,
          Math.sin(a * (1 + 0.35 * o.wobble)) * o.radius * 0.62,
          o.size,
        );
      }

      if (target.r === 0 && eased.r < 0.01) {
        eased.x = gl.canvas.width * 0.5;
        eased.y = gl.canvas.height * 0.5;
      }
      eased.x += (target.x - eased.x) * 0.06;
      eased.y += (target.y - eased.y) * 0.06;
      eased.r += (target.r - eased.r) * 0.07;
      program.uniforms.uPointer.value = [eased.x, eased.y];
      program.uniforms.uPointerR.value = eased.r;

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
  }, [count, scale, speed]);

  return <div ref={host} aria-hidden="true" className={`absolute inset-0 ${className}`} />;
}
