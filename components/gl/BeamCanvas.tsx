"use client";

import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";
import { beamVertex, beamFragment } from "./beam-shaders";
import { shot } from "@/lib/shot";

/**
 * The projector's light: one fixed, full-viewport canvas.
 *
 * Rendered at half resolution. Light scattering through haze has no hard detail
 * to lose, and the browser's upscale is itself a free softening pass. Screen
 * blended, so its black is transparent and it can only ever add light to what
 * lies beneath it.
 *
 * Draws only while the beam is on; idle, it is hidden and does nothing.
 * If WebGL is unavailable it simply is not there — the headline is still lit by
 * Statement's CSS layer.
 */
export default function BeamCanvas() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        alpha: false,
        antialias: false,
        dpr: 0.5 * Math.min(window.devicePixelRatio, 1.5),
      });
    } catch {
      return;
    }

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 1);
    gl.canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";
    el.appendChild(gl.canvas);

    const program = new Program(gl, {
      vertex: beamVertex,
      fragment: beamFragment,
      uniforms: {
        uRes: { value: [1, 1] },
        uScale: { value: 1 },
        uOrigin: { value: [0, 0] },
        uTarget: { value: [1, 1] },
        uOn: { value: 0 },
        uReach: { value: 0 },
        uSpread: { value: 0.16 },
        uTime: { value: 0 },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      program.uniforms.uRes.value = [gl.canvas.width, gl.canvas.height];
      program.uniforms.uScale.value = gl.canvas.width / window.innerWidth;
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let idle = false;
    const start = performance.now();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const b = shot.beam;
      const u = program.uniforms;

      if (b.on <= 0.001) {
        // Hidden, not just cleared: a full-screen blended layer left in place
        // is composited on every frame of scrolling for the rest of the page.
        if (!idle) {
          el.style.visibility = "hidden";
          idle = true;
        }
        return;
      }

      if (idle) {
        el.style.visibility = "";
        idle = false;
      }
      u.uTime.value = (now - start) / 1000;
      u.uOn.value = b.on;
      u.uReach.value = b.reach;
      u.uSpread.value = b.spread;
      u.uOrigin.value = [b.ox, b.oy];
      u.uTarget.value = [b.tx, b.ty];
      renderer.render({ scene: mesh });
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      gl.canvas.remove();
    };
  }, []);

  return (
    <div
      ref={host}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[var(--z-stage)] mix-blend-screen"
    />
  );
}
