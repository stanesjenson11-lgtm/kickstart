import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js/min";

/**
 * The number in international form ("+91 98765 43210"), or null if it is not a
 * real number for its country: an unknown country code, the wrong length, and
 * so on. A number without a +code is read as Indian, the placeholder's +91.
 *
 * Separate from brief-schema because it carries every country's numbering plan.
 * The route imports it directly; the form imports it on submit, so the page
 * never downloads it up front.
 */
export function formatPhone(raw: string): string | null {
  const value = raw.trim();
  return isValidPhoneNumber(value, "IN") ? parsePhoneNumber(value, "IN").format("INTERNATIONAL") : null;
}
