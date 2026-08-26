import { readFile } from "node:fs/promises";
import path from "node:path";

import { site } from "./content";
import type { Brief } from "./brief-schema";

/**
 * The lead notification email.
 *
 * Table layout and inline styles only — Gmail strips <style> blocks and Outlook
 * ignores flex/grid, so anything cleverer than this renders as a stack of
 * unstyled paragraphs in half the clients that matter.
 */

const INK = "#050505";
const RAISED = "#101010";
const HAIRLINE = "#242424";
const PAPER = "#ffffff";
const MUTED = "#a0a0a0";

/** Referenced from the HTML as `cid:` so the logo shows even when a client
    blocks remote images — nothing is fetched over the network. */
const LOGO_CID = "ks-logo";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

/** 440px source, rendered at 160px so it stays crisp on retina. */
async function logo() {
  try {
    const file = await readFile(path.join(process.cwd(), "public", "logo-email.png"));
    return file.toString("base64");
  } catch {
    // ponytail: falls back to a type-set wordmark below. A missing asset must
    // never cost us the lead.
    return null;
  }
}

function row(label: string, value: string, href?: string) {
  const inner = href
    ? `<a href="${esc(href)}" style="color:${PAPER};text-decoration:none;border-bottom:1px solid ${MUTED}">${esc(value)}</a>`
    : esc(value);

  return `<tr>
    <td style="padding:14px 0;border-bottom:1px solid ${HAIRLINE};color:${MUTED};font-size:11px;letter-spacing:.14em;text-transform:uppercase;vertical-align:top;width:150px">${esc(label)}</td>
    <td style="padding:14px 0;border-bottom:1px solid ${HAIRLINE};color:${PAPER};font-size:15px;line-height:1.5;vertical-align:top">${inner}</td>
  </tr>`;
}

export async function briefEmail(brief: Brief) {
  const logoBase64 = await logo();
  const who = brief.company ? `${brief.name} · ${brief.company}` : brief.name;

  const mark = logoBase64
    ? `<img src="cid:${LOGO_CID}" width="160" alt="${esc(site.name)}" style="display:block;width:160px;max-width:160px;height:auto;border:0;outline:none">`
    : `<span style="color:${PAPER};font-size:18px;font-weight:700;letter-spacing:.18em;text-transform:uppercase">${esc(site.name)}</span>`;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>New project brief</title>
</head>
<body style="margin:0;padding:0;background:${INK};color:${PAPER}">
  <!-- Inbox preview line. Hidden in the body itself. -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">
    ${esc(who)} — ${esc(brief.needs)} · ${esc(brief.timeline)}
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${INK}" style="background:${INK};margin:0;padding:0">
    <tr>
      <td align="center" style="padding:40px 20px">

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:100%;max-width:600px;background:${INK}">

          <!-- Masthead -->
          <tr>
            <td style="padding:0 0 28px">${mark}</td>
          </tr>

          <tr>
            <td style="border-top:1px solid ${HAIRLINE};padding:28px 0 0">
              <p style="margin:0;color:${MUTED};font-size:11px;letter-spacing:.16em;text-transform:uppercase">New project brief</p>
              <h1 style="margin:12px 0 0;color:${PAPER};font-size:26px;line-height:1.2;font-weight:600;letter-spacing:-.02em">${esc(who)}</h1>
            </td>
          </tr>

          <!-- Submitted fields -->
          <tr>
            <td style="padding:28px 0 0">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;border-collapse:collapse">
                ${row("Name", brief.name)}
                ${row("Company", brief.company || "—")}
                ${row("Email", brief.email, `mailto:${brief.email}`)}
                ${row("Phone", brief.phone || "—", brief.phone ? `tel:${brief.phone.replace(/[^\d+]/g, "")}` : undefined)}
                ${row("Needs", brief.needs)}
                ${row("Timeline", brief.timeline)}
              </table>
            </td>
          </tr>

          <!-- Free-text brief, boxed so it reads apart from the field list -->
          <tr>
            <td style="padding:28px 0 0">
              <p style="margin:0 0 10px;color:${MUTED};font-size:11px;letter-spacing:.14em;text-transform:uppercase">Project details</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%">
                <tr>
                  <td bgcolor="${RAISED}" style="background:${RAISED};border:1px solid ${HAIRLINE};padding:20px;color:${PAPER};font-size:15px;line-height:1.65;white-space:pre-wrap">${esc(brief.details)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Reply is the only action, so it is the only button -->
          <tr>
            <td style="padding:28px 0 0">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td bgcolor="${PAPER}" style="background:${PAPER}">
                    <a href="mailto:${esc(brief.email)}?subject=${encodeURIComponent(`Re: your brief — ${site.name}`)}"
                       style="display:inline-block;padding:14px 28px;color:${INK};font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;text-decoration:none">
                      Reply to ${esc(brief.name)} &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:32px 0 0;border-top:1px solid ${HAIRLINE};margin-top:32px">
              <p style="margin:28px 0 0;color:${MUTED};font-size:12px;line-height:1.6">
                Sent by the brief form at
                <a href="${site.url}" style="color:${MUTED}">${esc(site.url.replace(/^https?:\/\//, ""))}</a>.
                Hitting reply goes straight to ${esc(brief.email)}.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // Plain-text alternative. Spam filters weight multipart messages better, and
  // it is what a watch or a screen reader actually reads out.
  const text = [
    `NEW PROJECT BRIEF — ${site.name}`,
    "",
    `Name:     ${brief.name}`,
    `Company:  ${brief.company || "—"}`,
    `Email:    ${brief.email}`,
    `Phone:    ${brief.phone || "—"}`,
    `Needs:    ${brief.needs}`,
    `Timeline: ${brief.timeline}`,
    "",
    "Project details",
    "---------------",
    brief.details,
    "",
    `Reply to: ${brief.email}`,
  ].join("\n");

  return {
    subject: `Project brief — ${who}`,
    html,
    text,
    attachments: logoBase64
      ? [{ filename: "kickstart.png", content: logoBase64, contentId: LOGO_CID }]
      : undefined,
  };
}
