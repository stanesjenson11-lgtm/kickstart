"use client";

import Image from "next/image";
import { gallery } from "@/lib/content";
import { useGsap, gsap } from "@/lib/motion";
import TextRoll from "@/components/ui/text-roll";

type Photo = { src: string; alt: string };

/**
 * Drift per column, in pixels. Signs alternate so neighbouring columns pull
 * against each other rather than sliding as a block.
 *
 * Pixels, not yPercent: a percentage is measured against the column's own
 * height, so the taller column drifts further and rides up over the category
 * label. A fixed distance stays inside PAD whatever the column ends up holding.
 */
const DRIFT = [28, -16, 23];

/**
 * Clearance above and below the columns, in px. Must exceed max(|DRIFT|) — a
 * column sits at its full negative drift the moment its band enters the
 * viewport, so the difference is the gap left under the label at its tightest.
 *
 * This is the whole reason DRIFT stays modest: every pixel of drift has to be
 * bought with a pixel of clearance, and that clearance is dead space on the
 * page whether or not a column is currently using it.
 */
const PAD = 56;

/**
 * Split into three columns in reading order, the middle one deliberately the
 * shortest — five photos land as [2, 1, 2], so the band reads tall-short-tall
 * rather than as a row of equals. The arithmetic never empties the middle,
 * whatever number of photos a category ends up with.
 */
function intoColumns(photos: readonly Photo[]) {
  const n = photos.length;
  const side = Math.max(1, Math.floor(n / 2) - (n % 2 === 0 ? 1 : 0));
  return [photos.slice(0, side), photos.slice(side, n - side), photos.slice(n - side)];
}

/**
 * One category. Every frame keeps the 3:2 of the source — these were all shot
 * landscape, and cropping one to a portrait plate to square the columns up costs
 * half the picture. The short middle column centres instead.
 */
function Band({ name, photos }: { name: string; photos: readonly Photo[] }) {
  const columns = intoColumns(photos);

  return (
    <div className="gal-band">
      <div className="gal-head border-t border-[var(--rule-on-dark)] pt-5">
        <h3 className="u-display text-h2" style={{ ["--wdth" as string]: 100 }}>
          <TextRoll>{name}</TextRoll>
        </h3>
      </div>

      {/* The drift runs inside this track. Its padding is the clearance the
          columns move within, and the clip is the guarantee they stay there —
          so a drifting column can never cover the label above it. Columns run
          side by side at every width, so both the clearance and the drift do. */}
      <div
        className="relative overflow-hidden py-6 md:py-(--pad)"
        style={{ ["--pad" as string]: `${PAD}px` }}
      >
        <div className="flex flex-col gap-3 md:flex-row md:gap-tile">
          {columns.map((col, c) => (
            <div
              key={c}
              className={`gal-col flex flex-col gap-3 md:gap-tile ${
                col.length === 1 ? "md:flex-[1.3] md:justify-center" : "md:flex-1"
              }`}
            >
              {col.map((p) => (
                <div
                  key={p.src}
                  className="relative aspect-3/2 w-full overflow-hidden bg-ink-raised"
                >
                  <Image
                    src={p.src}
                    alt={p.alt}
                    fill
                    // Three columns at every width now, so roughly a third of
                    // the viewport at every width. The old 100vw below 768px
                    // fetched a full-width source for a ~100px slot.
                    sizes="32vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * The event categories, shown rather than listed.
 *
 * One band per category, each a set of columns drifting at its own rate as the
 * band passes. The parallax runs on ScrollTrigger rather than its own scroll
 * library: Lenis already drives this page from SmoothScroll, and a second
 * instance would fight it.
 *
 * Colour, not the monochrome grade used elsewhere — stage lighting, sparklers
 * and festival dress are the point of these frames.
 */
export default function Gallery() {
  const scope = useGsap<HTMLElement>(({ self }) => {
    // Ungated: the columns now run side by side at every width, so the drift
    // belongs at every width too. PAD is the clearance it moves within and is
    // applied at every width along with it.
    self.querySelectorAll<HTMLElement>(".gal-band").forEach((band) => {
      band.querySelectorAll<HTMLElement>(".gal-col").forEach((col, i) => {
        const d = DRIFT[i] ?? 0;
        gsap.fromTo(
          col,
          { y: -d },
          {
            y: d,
            ease: "none",
            scrollTrigger: {
              trigger: band,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          },
        );
      });
    });

    self.querySelectorAll<HTMLElement>(".gal-head").forEach((head) => {
      gsap.from(head, {
        opacity: 0,
        // Small on purpose: `from` applies this offset the moment it is created,
        // so a large one pushes the label down toward the frames until it plays.
        y: 12,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: head, start: "top 88%" },
      });
    });

    gsap.from(self.querySelectorAll<HTMLElement>(".gal-intro"), {
      opacity: 0,
      y: 26,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.08,
      scrollTrigger: { trigger: self, start: "top 72%" },
    });

    // No matchMedia scope to revert any more — useGsap's gsap.context collects
    // every tween and ScrollTrigger created here and reverts them on unmount.
  }, []);

  return (
    <section
      ref={scope}
      id="gallery"
      className="relative overflow-hidden bg-ink px-gutter py-section"
    >
      <h2 className="gal-intro u-display text-h1" style={{ ["--wdth" as string]: 106 }}>
        {gallery.headline}
      </h2>

      <div className="mt-12 flex flex-col gap-8 md:mt-16 md:gap-10">
        {gallery.categories.map((c) => (
          <Band key={c.name} name={c.name} photos={c.photos} />
        ))}
      </div>
    </section>
  );
}
