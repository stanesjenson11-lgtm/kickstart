"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { showreel } from "@/lib/content";
import { useGsap, gsap } from "@/lib/motion";

/**
 * The reel opens up. The plate is full-bleed from the start and a clip-path
 * inset opens outward while the section is pinned — the gesture of a screening
 * room going dark. Insets composite; animating width/height here would reflow
 * the whole section on every scroll tick.
 *
 * `showreel.src` is empty until a real reel lands; the poster then carries the
 * section and no play control is offered, so nothing pretends to be footage
 * that does not exist.
 */
export default function Showreel() {
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const hasReel = Boolean(showreel.src);

  const scope = useGsap<HTMLElement>(({ self }) => {
    const frame = self.querySelector<HTMLElement>(".reel-frame");
    const meta = self.querySelectorAll<HTMLElement>(".reel-meta");
    const counter = self.querySelector<HTMLElement>(".reel-counter");
    if (!frame) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: self,
        start: "top top",
        end: "+=120%",
        pin: true,
        scrub: 0.6,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });

    tl.fromTo(
      frame,
      { clipPath: "inset(21% 19% 21% 19%)" },
      { clipPath: "inset(0% 0% 0% 0%)", ease: "power2.inOut", duration: 1 },
      0,
    ).to(meta, { opacity: 0, duration: 0.35 }, 0);

    // The frame counter runs with scroll progress, like a scrub bar. It rides
    // the same timeline rather than a second trigger over the pinned range.
    if (counter) {
      const obj = { f: 0 };
      tl.to(
        obj,
        {
          f: 1152,
          ease: "none",
          duration: 1,
          onUpdate: () => {
            const total = Math.round(obj.f);
            const s = Math.floor(total / 24);
            counter.textContent = `00:00:${String(s).padStart(2, "0")}:${String(total % 24).padStart(2, "0")}`;
          },
        },
        0,
      );
    }
  }, []);

  const play = () => {
    setPlaying(true);
    video.current?.play();
  };

  return (
    <section ref={scope} className="relative h-[100svh] overflow-hidden bg-ink">
      {/* Full-bleed plate, revealed by the opening inset. */}
      <div className="reel-frame absolute inset-0" style={{ clipPath: "inset(21% 19% 21% 19%)" }}>
        {hasReel ? (
          <video
            ref={video}
            poster={showreel.poster}
            preload="none"
            playsInline
            controls={playing}
            className="h-full w-full object-cover"
            style={{ filter: "grayscale(1) contrast(1.1) brightness(0.82)" }}
          >
            <source src={showreel.src} type="video/mp4" />
          </video>
        ) : (
          <Image
            src={showreel.poster}
            alt={showreel.posterAlt}
            fill
            sizes="100vw"
            className="object-cover"
            style={{ filter: "grayscale(1) contrast(1.14) brightness(0.78)" }}
          />
        )}
      </div>

      <div className="relative z-[var(--z-content)] flex h-full flex-col justify-between px-gutter py-24">
        <div className="reel-meta flex items-baseline justify-between gap-6">
          <h2 className="u-display text-h1 max-w-[12ch]" style={{ ["--wdth" as string]: 108 }}>
            {showreel.headline}
          </h2>
          <span className="u-meta hidden shrink-0 text-muted-dark sm:block">{showreel.roll}</span>
        </div>

        {hasReel && !playing && (
          <button
            onClick={play}
            className="mx-auto u-meta border border-paper px-8 py-5 transition-colors duration-300 hover:bg-paper hover:text-ink"
          >
            Play reel
          </button>
        )}

        <div className="flex items-center justify-between u-meta text-muted-dark">
          <span className="reel-counter tabular-nums">00:00:00:00</span>
          <span>{showreel.runtime}</span>
        </div>
      </div>
    </section>
  );
}
