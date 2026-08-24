/** Join class names, skipping falsy values. No conflicting-class merge (the
 * codebase never passes conflicting Tailwind classes to the same slot), so a
 * plain join covers it without pulling in clsx + tailwind-merge. */
export function cn(...inputs: Array<string | false | null | undefined>) {
  return inputs.filter(Boolean).join(" ");
}
