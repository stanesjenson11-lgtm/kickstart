"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReduced } from "@/lib/motion";

const TILE_W = 250;
const TILE_H = 320;
const GAP = 20;
const CELL_W = TILE_W + GAP;
const CELL_H = TILE_H + GAP;
/** Resting dim over each frame. Lifts to 0 as the cursor nears. */
const REST_VEIL = 0.44;

type Props = { frames: readonly string[]; className?: string };

/**
 * An infinite contact sheet — the studio's frames tiled edge to edge with no
 * boundary, drifting on their own, leaning toward the cursor, and draggable.
 *
 * Each tile wraps individually modulo the grid size rather than the whole field
 * translating inside a tiled block. That keeps the node count to roughly one
 * screenful plus a ring (~45 tiles instead of ~240), and — more importantly —
 * every tile's position is known from the maths, so the magnetic falloff needs
 * no getBoundingClientRect. The loop does one transform write per tile and zero
 * layout reads.
 *
 * Wheel is deliberately not captured. Hijacking scroll in a hero traps the
 * visitor, and there are fifteen sections below this one.
 *
 * Decorative by definition: the headline above carries all the meaning, so this
 * is aria-hidden and nothing here is required to use the page.
 */
export default function ContactSheet({ frames, className = "" }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const [grid, setGrid] = useState({ cols: 0, rows: 0 });

  // Cover the viewport plus one ring of tiles, so a wrap is never visible.
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      const cols = Math.ceil(width / CELL_W) + 2;
      const rows = Math.ceil(height / CELL_H) + 2;
      // Only commit a genuine change. A fresh object every resize tick would
      // tear down and rebuild the animation loop on every observer callback.
      setGrid((g) => (g.cols === cols && g.rows === rows ? g : { cols, rows }));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = host.current;
    if (!el || grid.cols === 0) return;
    if (prefersReduced()) return; // A still contact sheet is a fine floor.

    const tiles = Array.from(el.querySelectorAll<HTMLElement>("[data-tile]"));
    const veils = Array.from(el.querySelectorAll<HTMLElement>("[data-veil]"));
    const totalW = grid.cols * CELL_W;
    const totalH = grid.rows * CELL_H;

    const pos = { x: 0, y: 0 };
    const vel = { x: 0, y: 0 };
    const lean = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    const pointer = { x: -9999, y: -9999, inside: false };

    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const onEnter = () => (pointer.inside = true);
    const onLeave = () => {
      pointer.inside = false;
      pointer.x = -9999;
      pointer.y = -9999;
      target.x = 0;
      target.y = 0;
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect(); // once per event, not per tile
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      // Magnetic lean: the whole field tips toward the cursor.
      target.x = (0.5 - pointer.x / r.width) * 70;
      target.y = (0.5 - pointer.y / r.height) * 48;

      if (dragging) {
        vel.x = e.clientX - lastX;
        vel.y = e.clientY - lastY;
        pos.x += vel.x;
        pos.y += vel.y;
        lastX = e.clientX;
        lastY = e.clientY;
      }
    };

    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      vel.x = 0;
      vel.y = 0;
      el.setPointerCapture?.(e.pointerId);
      el.style.cursor = "grabbing";
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      el.releasePointerCapture?.(e.pointerId);
      el.style.cursor = "grab";
    };

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);

    const wrap = (v: number, size: number) => ((v % size) + size) % size;

    const tick = () => {
      if (!visible) return;

      // Ambient drift, so the sheet is alive before anyone touches it.
      pos.x -= 0.2;
      pos.y -= 0.09;

      // Inertia after a throw.
      if (!dragging) {
        pos.x += vel.x;
        pos.y += vel.y;
        vel.x *= 0.94;
        vel.y *= 0.94;
        if (Math.abs(vel.x) < 0.02) vel.x = 0;
        if (Math.abs(vel.y) < 0.02) vel.y = 0;
      }

      lean.x += (target.x - lean.x) * 0.05;
      lean.y += (target.y - lean.y) * 0.05;

      const ox = pos.x + lean.x;
      const oy = pos.y + lean.y;
      const lit = pointer.inside;

      for (let i = 0; i < tiles.length; i++) {
        const t = tiles[i];
        const col = i % grid.cols;
        const row = (i / grid.cols) | 0;

        // Wrap each tile independently. Offsetting by one cell keeps the ring
        // of tiles just off-screen rather than popping in at the edge.
        const x = wrap(col * CELL_W + ox, totalW) - CELL_W;
        const y = wrap(row * CELL_H + oy, totalH) - CELL_H;

        let scale = 1;
        let veil = REST_VEIL;
        if (lit) {
          // Centre is known from the maths — no layout read needed.
          const dx = x + TILE_W / 2 - pointer.x;
          const dy = y + TILE_H / 2 - pointer.y;
          const k = Math.max(0, 1 - Math.hypot(dx, dy) / 340);
          const e = k * k;
          scale = 1 + e * 0.17;
          veil = REST_VEIL * (1 - e);
        }

        // Transform and opacity only: both stay on the compositor. Animating
        // `filter` here repainted all forty tiles every frame and cost ~50fps.
        t.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
        veils[i].style.opacity = String(veil);
      }
    };

    gsap.ticker.add(tick);

    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, [grid, frames]);

  const count = grid.cols * grid.rows;

  return (
    <div
      ref={host}
      aria-hidden="true"
      className={`absolute inset-0 cursor-grab overflow-hidden select-none ${className}`}
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          data-tile
          className="absolute top-0 left-0 overflow-hidden bg-ink-raised will-change-transform"
          style={{
            width: TILE_W,
            height: TILE_H,
            // Static fallback position: under reduced motion the loop never
            // runs, so the sheet must already be laid out as a grid.
            transform: `translate3d(${(i % grid.cols) * CELL_W - CELL_W}px, ${
              ((i / grid.cols) | 0) * CELL_H - CELL_H
            }px, 0)`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={frames[i % frames.length]}
            alt=""
            draggable={false}
            loading={i < 8 ? "eager" : "lazy"}
            decoding="async"
            className="h-full w-full object-cover"
          />
          <span
            data-veil
            className="absolute inset-0 bg-ink"
            style={{ opacity: REST_VEIL }}
          />
        </div>
      ))}
    </div>
  );
}
