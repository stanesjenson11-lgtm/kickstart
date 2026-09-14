"use client";

/**
 * Images are pre-sized at build time (scripts/images.mjs) into public/_img as
 * WebP, one file per width below. Cloudflare then serves them as static assets
 * from its edge cache: nothing is resized per request, so there is no wait on a
 * first view and no transformation quota to exhaust.
 *
 * No imports: next.config.ts and the Node generator both read WIDTHS from here.
 */
export const WIDTHS = [128, 256, 384, 640, 828, 1080, 1600, 2048];

/** The smallest generated width that covers the request, capped at the largest. */
export function imagePath(src: string, width: number) {
  const w = WIDTHS.find((x) => x >= width) ?? WIDTHS[WIDTHS.length - 1];
  // encodeURI: "/ks white.png" would otherwise split a srcset entry at the space.
  return encodeURI(`/_img${src.replace(/\.[a-z0-9]+$/i, "")}-${w}.webp`);
}

export default function imageLoader({ src, width }: { src: string; width: number }) {
  return imagePath(src, width);
}
