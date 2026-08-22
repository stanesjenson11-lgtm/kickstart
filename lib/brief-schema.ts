import { z } from "zod";

import { form } from "./content";

/** Shared by the client form and the route handler, so validation cannot drift. */
export const briefSchema = z.object({
  name: z.string().trim().min(2, "Tell us your name.").max(120),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  email: z.string().trim().email("That email address does not look right."),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  needs: z.array(z.enum(form.needs)).min(1, "Pick at least one thing you need."),
  details: z.string().trim().min(10, "A sentence or two is plenty.").max(4000),
  timeline: z.enum(form.timelines, { message: "Pick a timeline." }),
  budget: z.enum(form.budgets).optional(),
  /** Honeypot. Deliberately permissive: the route accepts a tripped honeypot
      with a 200 so the bot learns nothing. Rejecting it here would 422 and
      tell the bot exactly which field caught it. */
  website: z.string().max(200).optional(),
});

export type Brief = z.infer<typeof briefSchema>;
