import { NextResponse } from "next/server";
import { Resend } from "resend";
import * as z from "zod/mini";
import { briefSchema } from "@/lib/brief-schema";
import { site } from "@/lib/content";
import { formatPhone } from "@/lib/phone";
import { ackEmail, briefRef, leadEmail } from "@/lib/brief-email";

/** Far above any honest brief — the longest field is capped at 2,000 characters. */
const MAX_BODY = 16_000;

/** The Turnstile token travels with the brief but is not part of it. Optional
    here; required below whenever the check is switched on. */
const requestSchema = z.extend(briefSchema, {
  token: z.optional(z.string().check(z.maxLength(2048))),
});

const PHONE_INVALID = "Enter a valid phone number with its country code, like +91 98765 43210.";

/**
 * Cloudflare Turnstile's verdict on the widget token. Every failure — a bad or
 * reused token, a timeout, Cloudflare unreachable — counts as a bot: this route
 * spends email quota and mails an address the sender chose, so it fails closed.
 */
async function isHuman(token: string, secret: string, ip: string | null) {
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token, remoteip: ip ?? undefined }),
      signal: AbortSignal.timeout(5000),
    });
    const verdict = (await res.json()) as { success?: boolean };
    return verdict.success === true;
  } catch {
    return false;
  }
}

/** JSON from the page's own submit; url-encoded when the form posts without
    JavaScript, with Turnstile's own field name for the token. */
function parseBody(raw: string, type: string): unknown {
  if (!type.includes("application/x-www-form-urlencoded")) return JSON.parse(raw);
  const fields = Object.fromEntries(new URLSearchParams(raw));
  return { ...fields, token: fields["cf-turnstile-response"] ?? fields.token };
}

const invalid = (issues: { path: string[]; message: string }[]) =>
  NextResponse.json({ error: "Validation failed.", issues }, { status: 422 });

export async function POST(req: Request) {
  // The form only ever posts to its own origin, so a cross-site post is refused.
  const origin = req.headers.get("origin");
  if (origin && origin !== new URL(req.url).origin) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  // Refuse on the declared length before buffering, then again on what arrived,
  // since a chunked request declares none.
  if (Number(req.headers.get("content-length") ?? 0) > MAX_BODY) {
    return NextResponse.json({ error: "Request too large." }, { status: 413 });
  }
  const raw = await req.text();
  if (raw.length > MAX_BODY) {
    return NextResponse.json({ error: "Request too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = parseBody(raw, req.headers.get("content-type") ?? "");
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return invalid(
      parsed.error.issues.map((i) => ({ path: i.path.map(String), message: i.message })),
    );
  }

  const { token, ...brief } = parsed.data;

  // Honeypot tripped: accept silently so the bot learns nothing.
  if (brief.website) return NextResponse.json({ ok: true });

  const phone = formatPhone(brief.phone);
  if (!phone) return invalid([{ path: ["phone"], message: PHONE_INVALID }]);

  const key = process.env.RESEND_API_KEY;
  const secret = process.env.TURNSTILE_SECRET_KEY;
  // Comma-separated so extra recipients are an env change, not a deploy.
  const to = (process.env.LEAD_TO_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  const missing = [
    !key && "RESEND_API_KEY",
    !to.length && "LEAD_TO_EMAIL",
    site.turnstile && !secret && "TURNSTILE_SECRET_KEY",
  ].filter(Boolean);
  if (missing.length) {
    // Names only, never values: this is what to add under Variables and Secrets.
    console.error(`[brief] Not configured, missing: ${missing.join(", ")}`);
    return NextResponse.json({ error: "Mail is not configured." }, { status: 500 });
  }

  // Switched in lib/content.ts (site.turnstile). While it is off, the honeypot,
  // validation, size cap and origin check are the form's only guards.
  if (site.turnstile && !(token && secret && (await isHuman(token, secret, req.headers.get("cf-connecting-ip"))))) {
    return NextResponse.json({ error: "Verification failed." }, { status: 403 });
  }

  const ref = briefRef();
  const from = process.env.LEAD_FROM_EMAIL ?? "Kickstart <onboarding@resend.dev>";
  const resend = new Resend(key);
  const clean = { ...brief, phone };

  try {
    const lead = await leadEmail(clean, ref);
    const { data, error } = await resend.emails.send({
      from,
      to,
      replyTo: clean.email,
      subject: lead.subject,
      html: lead.html,
      text: lead.text,
      attachments: lead.attachments,
    });
    if (error) throw new Error(error.message);
    // Resend only reports acceptance here — bounces land minutes later, and
    // this id is the only handle for finding the send in the dashboard.
    console.log(`[brief] ${ref} accepted ${data?.id} -> ${to.join(", ")}`);
  } catch (err) {
    console.error(`[brief] ${ref} send failed`, err);
    return NextResponse.json({ error: "Could not send." }, { status: 502 });
  }

  // The acknowledgement is a courtesy; the lead is the thing that matters and
  // it has already gone. A failure here is logged, never surfaced.
  try {
    const ack = await ackEmail(clean, ref);
    await resend.emails.send({
      from,
      to: [clean.email],
      replyTo: to[0],
      subject: ack.subject,
      html: ack.html,
      text: ack.text,
      attachments: ack.attachments,
    });
  } catch (err) {
    console.error(`[brief] ${ref} acknowledgement failed`, err);
  }

  return NextResponse.json({ ok: true });
}
