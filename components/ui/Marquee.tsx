"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { prefersReduced, useIsoLayoutEffect } from "@/lib/motion";

type Props = {
  items: readonly ReactNode[];
  /** Pixels per second. Negative reverses. */
  speed?: number;
  /** Speed while hovered — 0 to hold, or a lower number to ease off. */
  hoverSpeed?: number;
  gap?: number;
  fadeColor?: string;
  className?: string;
  ariaLabel?: string;
};

/**
 * A continuous marquee. Enough copies of the sequence are rendered to over-fill
 * the container, and the track wraps modulo one sequence width — so the run
 * never restarts visibly and never accumulates a growing transform.
 *
 * Adapted from React Bits' LogoLoop for this project: it carries text (or any
 * node — tags, icons) rather than logos, because the client has no logo wall
 * yet and a marquee of placeholder marks would be worse than none.
 *
 * Decorative: whatever it carries also exists as real text nearby, so this is
 * aria-hidden by default and nothing is lost when it does not run.
 */
export default function Marquee({
  items,
  speed = 55,
  hoverSpeed = 14,
  gap = 56,
  fadeColor = "var(--color-ink)",
  className = "",
  ariaLabel,
}: Props) {
  const host = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const seq = useRef<HTMLUListElement>(null);

  const [seqWidth, setSeqWidth] = useState(0);
  const [copies, setCopies] = useState(2);
  const hovered = useRef(false);

  const measure = useCallback(() => {
    const w = seq.current?.getBoundingClientRect().width ?? 0;
    const host_ = host.current?.clientWidth ?? 0;
    if (w > 0) {
      setSeqWidth(Math.ceil(w));
      setCopies(Math.max(2, Math.ceil(host_ / w) + 2));
    }
  }, []);

  useIsoLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (host.current) ro.observe(host.current);
    if (seq.current) ro.observe(seq.current);
    return () => ro.disconnect();
  }, [measure, items]);

  useEffect(() => {
    const el = track.current;
    if (!el || seqWidth === 0 || prefersReduced()) return;

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), {
      rootMargin: "80px",
    });
    if (host.current) io.observe(host.current);

    let raf = 0;
    let offset = 0;
    let velocity = speed;
    let last = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!last) last = now;
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible) return;

      const want = hovered.current ? hoverSpeed : speed;
      velocity += (want - velocity) * (1 - Math.exp(-dt / 0.25));

      offset = (((offset + velocity * dt) % seqWidth) + seqWidth) % seqWidth;
      el.style.transform = `translate3d(${-offset}px, 0, 0)`;
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [seqWidth, speed, hoverSpeed]);

  const cells = items.map((item, i) => (
    <li key={i} className="shrink-0 whitespace-nowrap" style={{ marginRight: gap }}>
      {item}
    </li>
  ));

  return (
    <div
      ref={host}
      aria-hidden={ariaLabel ? undefined : "true"}
      aria-label={ariaLabel}
      role={ariaLabel ? "region" : undefined}
      className={`ks-marquee relative overflow-hidden ${className}`}
      style={{ ["--marquee-fade" as string]: fadeColor }}
      onMouseEnter={() => (hovered.current = true)}
      onMouseLeave={() => (hovered.current = false)}
    >
      <div ref={track} className="flex w-max will-change-transform">
        {/* The first copy is the one measured; the rest only fill the gap. */}
        <ul ref={seq} className="flex shrink-0 items-center" style={{ gap }}>
          {cells}
        </ul>
        {Array.from({ length: Math.max(0, copies - 1) }, (_, i) => (
          <ul key={i} aria-hidden="true" className="flex shrink-0 items-center" style={{ gap }}>
            {cells}
          </ul>
        ))}
      </div>
    </div>
  );
}
