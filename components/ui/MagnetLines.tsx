"use client";

import { useEffect, useRef } from "react";
import { prefersReduced } from "@/lib/motion";

type Props = {
  rows?: number;
  columns?: number;
  lineWidth?: string;
  lineHeight?: string;
  baseAngle?: number;
  className?: string;
};

/**
 * A field of hairlines that all turn to face the pointer.
 *
 * On this site it reads as a lighting grid or a sheet of focus marks — the
 * production floor's own vocabulary — rather than as a generic effect, which is
 * why it sits behind the section about craft.
 *
 * Cell centres are measured once per layout, not per pointer move. The original
 * technique reads getBoundingClientRect for every cell on every event; at 9×9
 * that is 81 forced layouts per mousemove.
 */
export default function MagnetLines({
  rows = 9,
  columns = 9,
  lineWidth = "2px",
  lineHeight = "28px",
  baseAngle = -12,
  className = "",
}: Props) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el || prefersReduced()) return;

    const items = Array.from(el.querySelectorAll<HTMLElement>("i"));
    let centres: { x: number; y: number }[] = [];

    const measure = () => {
      const base = el.getBoundingClientRect();
      centres = items.map((it) => {
        const r = it.getBoundingClientRect();
        return { x: r.x - base.x + r.width / 2, y: r.y - base.y + r.height / 2 };
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), {
      rootMargin: "100px",
    });
    io.observe(el);

    let queued = false;
    let px = 0;
    let py = 0;

    const apply = () => {
      queued = false;
      for (let i = 0; i < items.length; i++) {
        const c = centres[i];
        if (!c) continue;
        const deg = (Math.atan2(py - c.y, px - c.x) * 180) / Math.PI;
        items[i].style.setProperty("--rotate", `${deg}deg`);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (!visible) return;
      const base = el.getBoundingClientRect();
      px = e.clientX - base.x;
      py = e.clientY - base.y;
      if (!queued) {
        queued = true;
        requestAnimationFrame(apply);
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      io.disconnect();
      ro.disconnect();
    };
  }, [rows, columns]);

  return (
    <div
      ref={host}
      aria-hidden="true"
      className={`ks-lines grid h-full w-full place-items-center ${className}`}
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
      }}
    >
      {Array.from({ length: rows * columns }, (_, i) => (
        <i
          key={i}
          style={
            {
              "--rotate": `${baseAngle}deg`,
              width: lineWidth,
              height: lineHeight,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
