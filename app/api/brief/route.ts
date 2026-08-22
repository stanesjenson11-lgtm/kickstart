import { NextResponse } from "next/server";
import { Resend } from "resend";
import { briefSchema } from "@/lib/brief-schema";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

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
  const to = process.env.LEAD_TO_EMAIL;
  if (!key || !to) {
    console.error("[brief] RESEND_API_KEY or LEAD_TO_EMAIL is not set.");
    return NextResponse.json({ error: "Mail is not configured." }, { status: 500 });
  }

  const rows: [string, string][] = [
    ["Name", brief.name],
    ["Company", brief.company || "—"],
    ["Email", brief.email],
    ["Phone", brief.phone || "—"],
    ["Needs", brief.needs.join(", ")],
    ["Timeline", brief.timeline],
    ["Budget", brief.budget || "Not stated"],
  ];

  const html = `
    <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:640px">
      <p style="font:600 11px/1.4 ui-monospace,monospace;letter-spacing:.16em;text-transform:uppercase;color:#666">
        New project brief
      </p>
      <h1 style="font-size:22px;margin:8px 0 20px">${esc(brief.name)}${
        brief.company ? ` &middot; ${esc(brief.company)}` : ""
      }</h1>
      <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse">
        ${rows
          .map(
            ([k, v]) => `<tr>
              <td style="padding:9px 0;border-bottom:1px solid #eee;color:#666;width:150px;font-size:13px">${esc(k)}</td>
              <td style="padding:9px 0;border-bottom:1px solid #eee;font-size:14px">${esc(v)}</td>
            </tr>`,
          )
          .join("")}
      </table>
      <p style="margin:22px 0 6px;color:#666;font-size:13px">Project details</p>
      <p style="white-space:pre-wrap;line-height:1.6;font-size:14px">${esc(brief.details)}</p>
    </div>`;

  try {
    const resend = new Resend(key);
    const { error } = await resend.emails.send({
      from: process.env.LEAD_FROM_EMAIL ?? "Kickstart <onboarding@resend.dev>",
      to: [to],
      replyTo: brief.email,
      subject: `Project brief — ${brief.name}${brief.company ? ` (${brief.company})` : ""}`,
      html,
    });
    if (error) throw new Error(error.message);
  } catch (err) {
    console.error("[brief] send failed", err);
    return NextResponse.json({ error: "Could not send." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
