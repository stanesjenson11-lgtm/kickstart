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
