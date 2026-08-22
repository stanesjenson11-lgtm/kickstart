"use client";

import { useRef, type ReactNode } from "react";
import { gsap, prefersReduced } from "@/lib/motion";

type Props = {
  href?: string;
  children: ReactNode;
  /** "solid" = white on ink, "ghost" = hairline outline. */
  variant?: "solid" | "ghost";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
};

/**
 * The cursor pulls the button toward it, and the label trails slightly behind
 * the shell so the movement reads as weight rather than as a slide.
 *
 * Under reduced motion the tracking never engages and this is a plain button
 * with a hover state — the affordance is identical, only the flourish is gone.
 */
export default function MagneticButton({
  href,
  children,
  variant = "solid",
  className = "",
  type = "button",
  disabled,
}: Props) {
  const shell = useRef<HTMLSpanElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  const move = (e: React.MouseEvent) => {
    if (prefersReduced() || !shell.current || !label.current) return;
    const r = shell.current.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width / 2);
    const y = e.clientY - (r.top + r.height / 2);
    gsap.to(shell.current, { x: x * 0.32, y: y * 0.42, duration: 0.7, ease: "power3.out" });
    gsap.to(label.current, { x: x * 0.14, y: y * 0.2, duration: 0.9, ease: "power3.out" });
  };

  const reset = () => {
    if (!shell.current || !label.current) return;
    gsap.to([shell.current, label.current], {
      x: 0,
      y: 0,
      duration: 1,
      ease: "elastic.out(1, 0.5)",
    });
  };

  const base =
    "relative inline-flex items-center justify-center gap-3 px-7 py-4 u-meta whitespace-nowrap transition-colors duration-300";
  const skin =
    variant === "solid"
      ? "bg-paper text-ink hover:bg-muted-dark"
      : "border border-current text-current hover:bg-paper hover:text-ink";

  const inner = (
    <span ref={shell} className={`${base} ${skin} ${className}`}>
      <span ref={label} className="inline-flex items-center gap-3">
        {children}
        <span aria-hidden="true">&#8594;</span>
      </span>
    </span>
  );

  // The padded wrapper is the magnet's catchment area — larger than the button
  // itself, so the pull starts before the cursor arrives.
  const magnet = "inline-block p-3 -m-3";

  if (href) {
    return (
      <a href={href} className={magnet} onMouseMove={move} onMouseLeave={reset}>
        {inner}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${magnet} disabled:opacity-50 disabled:cursor-not-allowed`}
      onMouseMove={move}
      onMouseLeave={reset}
    >
      {inner}
    </button>
  );
}
