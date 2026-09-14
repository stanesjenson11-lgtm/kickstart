import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { briefSchema } from "@/lib/brief-schema";
import { ackEmail, briefRef, leadEmail } from "@/lib/brief-email";

/** Far above any honest brief — the schema caps the details at 4,000 characters. */
const MAX_BODY = 16_000;

/** The Turnstile token travels with the brief but is not part of it. */
const requestSchema = briefSchema.extend({ token: z.string().min(1).max(2048) });

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

export async function POST(req: Request) {
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
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const { token, ...brief } = parsed.data;

  // Honeypot tripped: accept silently so the bot learns nothing.
  if (brief.website) return NextResponse.json({ ok: true });

  const key = process.env.RESEND_API_KEY;
  const secret = process.env.TURNSTILE_SECRET_KEY;
  // Comma-separated so extra recipients are an env change, not a deploy.
  const to = (process.env.LEAD_TO_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (!key || !secret || !to.length) {
    console.error("[brief] RESEND_API_KEY, TURNSTILE_SECRET_KEY or LEAD_TO_EMAIL is not set.");
    return NextResponse.json({ error: "Mail is not configured." }, { status: 500 });
  }

  if (!(await isHuman(token, secret, req.headers.get("cf-connecting-ip")))) {
    return NextResponse.json({ error: "Verification failed." }, { status: 403 });
  }

  const ref = briefRef();
  const from = process.env.LEAD_FROM_EMAIL ?? "Kickstart <onboarding@resend.dev>";
  const resend = new Resend(key);

  try {
    const lead = await leadEmail(brief, ref);
    const { data, error } = await resend.emails.send({
      from,
      to,
      replyTo: brief.email,
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
    const ack = await ackEmail(brief, ref);
    await resend.emails.send({
      from,
      to: [brief.email],
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
