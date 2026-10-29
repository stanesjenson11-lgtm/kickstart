import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** shadcn's class helper — later Tailwind utilities win over earlier ones. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** JSON-LD for a <script> body. `<` escaped so no string in it can close the tag. */
export function ldJson(data: object) {
  return { __html: JSON.stringify(data).replace(/</g, "\u003c") };
}

/** Canonical plus hreflang for a path. One language, so en-IN and x-default
    both point at the page itself: it tells search engines the page is for India
    without implying a translation exists. */
export function alternates(path: string) {
  return { canonical: path, languages: { "en-IN": path, "x-default": path } };
}

/** "2026-10-27" → "27 October 2026", the way the rest of the site writes dates. */
export function longDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
