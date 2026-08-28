import { NextResponse } from "next/server";
import { Resend } from "resend";
import { briefSchema } from "@/lib/brief-schema";
import { ackEmail, briefRef, leadEmail } from "@/lib/brief-email";

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
