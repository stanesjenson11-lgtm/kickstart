import { z } from "zod";

/** Single-line fields end up in email subjects and headers, where a line break
    is how extra headers get smuggled in. Only `details` may span lines. */
const oneLine = /^[^\r\n]*$/;
const ONE_LINE = "Keep this to a single line.";

/** Shared by the client form and the route handler, so validation cannot drift. */
export const briefSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name.").max(120).regex(oneLine, ONE_LINE),
  company: z.string().trim().max(160).regex(oneLine, ONE_LINE).optional().or(z.literal("")),
  email: z.string().trim().email("That email address does not look right."),
  phone: z.string().trim().max(40).regex(oneLine, ONE_LINE).optional().or(z.literal("")),
  needs: z.string().trim().min(2, "Tell us what you need.").max(300).regex(oneLine, ONE_LINE),
  details: z.string().trim().min(10, "A sentence or two is plenty.").max(4000),
  timeline: z.string().trim().min(2, "Tell us your timeline.").max(120).regex(oneLine, ONE_LINE),
  /** Honeypot. Deliberately permissive: the route accepts a tripped honeypot
      with a 200 so the bot learns nothing. Rejecting it here would 422 and
      tell the bot exactly which field caught it. */
  website: z.string().max(200).optional(),
});

export type Brief = z.infer<typeof briefSchema>;
