"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const STAGGER = 0.035;

/**
 * Hover a word and every character rolls up out of the line while a copy rolls
 * in from below. Ported from skiper-ui's `skiper58`, onto `motion/react` — the
 * package already here — rather than pulling in `framer-motion` beside it.
 *
 * `center` staggers outward from the middle of the word instead of left to
 * right, which reads better on short labels.
 *
 * Both layers hold the same text and are split per character, so both stay
 * hidden and the accessible name is a visually-hidden copy of the word.
 * Otherwise the label is announced twice, or spelled out one letter at a time.
 */
export default function TextRoll({
  children,
  className,
  center = false,
}: {
  children: string;
  className?: string;
  center?: boolean;
}) {
  const still = useReducedMotion();
  if (still) return <span className={className}>{children}</span>;

  const chars = [...children];
  const delayOf = (i: number) =>
    STAGGER * (center ? Math.abs(i - (chars.length - 1) / 2) : i);

  const layer = (from: string, to: string) =>
    chars.map((ch, i) => (
      <motion.span
        key={i}
        variants={{ initial: { y: from }, hovered: { y: to } }}
        transition={{ ease: "easeInOut", delay: delayOf(i) }}
        className="inline-block"
      >
        {ch === " " ? " " : ch}
      </motion.span>
    ));

  return (
    <motion.span
      initial="initial"
      whileHover="hovered"
      className={cn("relative block overflow-hidden", className)}
    >
      {/* A bare span's role is `generic`, which prohibits aria-label, so the
          name is real text instead. */}
      <span className="sr-only">{children}</span>
      <span aria-hidden="true" className="block">
        {layer("0%", "-100%")}
      </span>
      <span aria-hidden="true" className="absolute inset-0 block">
        {layer("100%", "0%")}
      </span>
    </motion.span>
  );
}
