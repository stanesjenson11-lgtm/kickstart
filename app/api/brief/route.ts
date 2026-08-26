import { NextResponse } from "next/server";
import { Resend } from "resend";
import { briefSchema } from "@/lib/brief-schema";
import { briefEmail } from "@/lib/brief-email";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const parsed = briefSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed.", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const brief = parsed.data;

  // Honeypot tripped: accept silently so the bot learns nothing.
  if (brief.website) return NextResponse.json({ ok: true });

  const key = process.env.RESEND_API_KEY;
  // Comma-separated so extra recipients are an env change, not a deploy.
  const to = (process.env.LEAD_TO_EMAIL ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (!key || !to.length) {
    console.error("[brief] RESEND_API_KEY or LEAD_TO_EMAIL is not set.");
    return NextResponse.json({ error: "Mail is not configured." }, { status: 500 });
  }

  const { subject, html, text, attachments } = await briefEmail(brief);

  try {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from: process.env.LEAD_FROM_EMAIL ?? "Kickstart <onboarding@resend.dev>",
      to,
      replyTo: brief.email,
      subject,
      html,
      text,
      attachments,
    });
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error("[brief] send failed", err);
    return NextResponse.json({ error: "Could not send." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
