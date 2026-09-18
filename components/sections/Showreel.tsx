"use client";

import { useEffect, useRef } from "react";
import { showreel } from "@/lib/content";
import { useGsap, gsap } from "@/lib/motion";

/**
 * The reel opens up. The plate is full-bleed from the start and a clip-path
 * inset opens outward while the section is pinned — the gesture of a screening
 * room going dark. Insets composite; animating width/height here would reflow
 * the whole section on every scroll tick.
 *
 * The reel runs muted on a loop as ambient footage — autoplay only survives
 * muted, so the file carries no audio track at all. It stays at
 * `preload="metadata"` and an observer starts it a viewport early, so the
 * homepage never pays for the file before the section is in reach.
 *
 * The encodes are `<source>`s in the server HTML (see `showreel.sources`), so
 * the browser picks one and reads its metadata while the page parses. Setting
 * `src` from an effect meant nothing loaded until the whole page had hydrated,
 * which on a slow phone left the reel black for seconds after it scrolled in.
 * `media` is only checked once, at load — which is all the effect did too.
 *
 * Phones letterbox rather than cover. The footage is 16:9 and a portrait
 * viewport is not, so covering it would crop the sides off every shot and
 * upscale what survives by ~3.5x — the montage is composed wide, and both
 * guitarists have to stay in frame. Contained against the black ground the
 * whole composition reads, and the video renders near 1:1 instead.
 */
export default function Showreel() {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = video.current;
    if (!el) return;

    // A refused play() — iOS Low Power Mode blocks even muted autoplay — is
    // lifted by any tap on the page, so arm the next one to try again. Only
    // while the reel is in reach: an AbortError from pausing mid-play() lands
    // in the catch too, and must not start it offscreen later.
    let near = false;
    const arm = () => {
      document.addEventListener("touchend", play, { once: true, passive: true });
      document.addEventListener("click", play, { once: true });
    };
    const play = () => {
      if (near) el.play().catch(arm);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        // play() pulls the media down; pausing offscreen keeps a decoder off
        // the main thread for the rest of the page.
        near = entry.isIntersecting;
        if (near) play();
        else el.pause();
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      document.removeEventListener("touchend", play);
      document.removeEventListener("click", play);
    };
  }, []);

  const scope = useGsap<HTMLElement>(({ self }) => {
    const frame = self.querySelector<HTMLElement>(".reel-frame");
    const meta = self.querySelectorAll<HTMLElement>(".reel-meta");
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
  }, []);

  return (
    <section
      ref={scope}
      id="work"
      // data-frame lands anchors flush at 0 rather than the usual -8px: this
      // section is pinned from `top top`, so stopping a few pixels short leaves
      // a sliver of the Statement above it and the pin not yet engaged.
      data-frame
      className="relative h-[100svh] overflow-hidden bg-black"
    >
      {/* Full-bleed plate, revealed by the opening inset. */}
      <div className="reel-frame absolute inset-0" style={{ clipPath: "inset(21% 19% 21% 19%)" }}>
        <video
          ref={video}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          className="h-full w-full object-contain md:object-cover"
          style={{ filter: "contrast(1.1) brightness(0.82)" }}
        >
          {/* Phones stop at 767px, the site's real `bar:` breakpoint (`md:`
              here is 1px, so the reel covers at every width). */}
          {showreel.sources.map((s) => (
            <source key={s.src} {...s} />
          ))}
        </video>
      </div>

      <div className="relative z-[var(--z-content)] flex h-full flex-col justify-between px-gutter py-24">
        <div className="reel-meta">
          <h2 className="u-display text-h1 max-w-[12ch]" style={{ ["--wdth" as string]: 108 }}>
            {showreel.headline}
          </h2>
        </div>
      </div>
    </section>
  );
}
