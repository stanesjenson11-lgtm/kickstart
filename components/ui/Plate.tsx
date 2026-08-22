"use client";

import Image from "next/image";
import { useGsap, gsap } from "@/lib/motion";

type Props = {
  src: string;
  alt: string;
  /** Wrapper classes. The wrapper must establish size — the image fills it. */
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Slow push-in as the plate crosses the viewport. */
  scale?: boolean;
  /** Unmask along the cut instead of appearing outright. */
  reveal?: boolean;
  /** Vertical drift, as a fraction of height. 0 disables parallax. */
  parallax?: number;
};

/**
 * A photograph, treated: graded monochrome in CSS, unmasked along the cut,
 * pushed in slowly as it crosses the viewport.
 *
 * Grading lives in CSS (.plate) so a colour source can be dropped in without
 * re-editing files. The image is fully visible by default; the reveal is set
 * up only after mount, so crawlers and reduced-motion users see the picture.
 */
export default function Plate({
  src,
  alt,
  className = "",
  sizes = "100vw",
  priority = false,
  scale = false,
  reveal = true,
  parallax = 0,
}: Props) {
  const scope = useGsap<HTMLDivElement>(({ self }) => {
    const img = self.querySelector("img");

    if (reveal) {
      gsap.fromTo(
        self,
        { "--p": 0 },
        {
          "--p": 1,
          ease: "power2.inOut",
          duration: 1.1,
          scrollTrigger: { trigger: self, start: "top 88%" },
        },
      );
    }

    if (scale && img) {
      gsap.fromTo(
        img,
        { scale: 1.16 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: { trigger: self, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    }

    if (parallax && img) {
      gsap.fromTo(
        img,
        { yPercent: -parallax * 100 },
        {
          yPercent: parallax * 100,
          ease: "none",
          scrollTrigger: { trigger: self, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    }
  }, []);

  return (
    <div
      ref={scope}
      className={`plate relative overflow-hidden bg-ink-raised ${reveal ? "cut-reveal" : ""} ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
        style={parallax ? { scale: 1 + parallax * 2.4 } : undefined}
      />
    </div>
  );
}
