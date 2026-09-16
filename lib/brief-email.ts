import { readFile } from "node:fs/promises";
import path from "node:path";
import { getCloudflareContext } from "@opennextjs/cloudflare";

import { site, footer as footerContent } from "./content";
import type { Brief } from "./brief-schema";

/**
 * The two emails a brief produces: the lead notification to the studio, and
 * the acknowledgement to whoever sent it.
 *
 * Tables and inline styles only. Gmail strips most of what a page can do,
 * Outlook renders through Word — no flex, no grid, no transform, no
 * border-radius — and half the Android clients ignore web fonts.
 *
 * The diagonal split is the one piece worth explaining. Outlook cannot skew or
 * clip anything, so the cut is not drawn in CSS: the column boundary is a
 * plain two-cell table at SPLIT px, and the wedge that leans the edge right as
 * it rises lives inside the paper cell's own background image, anchored
 * top-left. Below that image the cell simply continues in its background
 * colour, so the section tolerates any content height. A client that drops
 * background images degrades to a clean straight split, not a broken layout.
 */

/* --- palette -------------------------------------------------------------
   DESIGN.md tokens, flattened to hex: no oklch(), no custom properties. */
const INK = "#050505"; // --ink
const PAPER = "#f5f5f3"; // --paper-warm, the counter-drench
const MUTED_DARK = "#a0a0a0"; // --muted-on-dark, 7.9:1 on ink
const MUTED_LIGHT = "#5a5a5a"; // --muted-on-light, 7.0:1 on paper
const RULE_DARK = "#242424"; // hairline on ink
const RULE_LIGHT = "#d8d8d4"; // hairline on paper

/* The site's Archivo + Martian Mono pair cannot be relied on to load, so the
   voice is carried by weight, case and tracking over stacks already installed
   on the reading device. Single-quoted family names: these interpolate into
   style="..." attributes, and a double quote would close the attribute and
   drop every declaration after it. */
const DISPLAY = `'Archivo Black','Helvetica Neue',Helvetica,Arial,sans-serif`;
const MONO = `ui-monospace,'SF Mono',SFMono-Regular,Menlo,Consolas,monospace`;
const BODY = `-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif`;

/** Applied wherever user-supplied text lands: a 60-character email address or
    a run-on "needs" line would otherwise size its column past the viewport and
    drag the whole layout wide on a phone. */
const BREAK = "word-wrap:break-word;overflow-wrap:break-word";

/* --- geometry ------------------------------------------------------------
   Mirrors the script that generated public/email-cut*.png; changing one
   without the other misaligns the diagonal. */
const W = 640;
const SPLIT = 240;
const CUT_H = 420; // height over which the diagonal completes
/** Desktop runs full width. The ink column keeps SPLIT's share of it, so the
    footer wedge, which scales with the width, still meets the paper edge. */
const INK_COL = `${(SPLIT / W) * 100}%`;

/** Inlined as `cid:` so nothing is fetched over the network — no tracking
    pixel behaviour, and no broken boxes where remote images are blocked. */
const ASSETS = {
  logo: "email-logo.png",
  logoWhite: "email-logo-white.png",
  logoBlack: "email-logo-black.png",
  cut: "email-cut.png",
  cutfoot: "email-cutfoot.png",
  cutfootfull: "email-cutfootfull.png",
  instagram: "email-instagram.png",
  linkedin: "email-linkedin.png",
  whatsapp: "email-whatsapp.png",
} as const;

type AssetKey = keyof typeof ASSETS;
type Assets = Record<AssetKey, string | null>;

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );

/** Newlines survive as <br>: Outlook's Word engine ignores white-space:pre-wrap
    and would run the whole brief together into one paragraph. */
const para = (s: string) => esc(s).replace(/\n/g, "<br>");

/** The timeline arrives as YYYY-MM-DD from the form's date input, so no email
    shows a bare ISO string. Read back in UTC, the zone the schema bounds it in,
    or the date would slip a day for readers west of Greenwich. Anything
    unparseable passes through rather than throwing part-way through a render. */
const longDate = (v: string) => {
  const d = new Date(`${v}T00:00:00Z`);
  return Number.isNaN(d.getTime())
    ? v
    : d.toLocaleDateString("en-GB", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" });
};

/** The studio works out of India; a brief stamped in UTC would be filed under
    the wrong day about a quarter of the time. */
const stamp = () =>
  new Date()
    .toLocaleDateString("en-GB", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .toUpperCase();

/** Tags one brief's log lines in the route, so a send and its failure can be
    matched. Never shown in the emails. Random rather than time-derived: the low
    digits of a base36 timestamp cycle every ~28 minutes, so two briefs half an
    hour apart would share a tag. */
export const briefRef = () =>
  `KS-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

/**
 * public/ straight off disk under Node (next dev, Vercel). A Cloudflare Worker
 * has no disk, so there the same file comes through the static-assets binding,
 * which only reads the URL's path — the host is a placeholder.
 */
async function readPublic(file: string) {
  try {
    return await readFile(path.join(process.cwd(), "public", file));
  } catch (err) {
    const assets = getCloudflareContext().env.ASSETS;
    if (!assets) throw err;
    const res = await assets.fetch(new URL(`/${file}`, "https://assets.local"));
    if (!res.ok) throw new Error(`${file}: ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  }
}

/**
 * Reads only the assets an email actually references. A missing file degrades
 * that one element — never the send.
 */
async function loadAssets(keys: readonly AssetKey[]) {
  const entries = await Promise.all(
    keys.map(async (key) => {
      try {
        const file = await readPublic(ASSETS[key]);
        return [key, file.toString("base64")] as const;
      } catch {
        // ponytail: a missing asset must never cost us the lead.
        return [key, null] as const;
      }
    }),
  );

  const loaded = entries.filter((e): e is readonly [AssetKey, string] => e[1] !== null);

  return {
    a: Object.fromEntries(entries) as Assets,
    attachments: loaded.length
      ? loaded.map(([key, data]) => ({
          filename: ASSETS[key],
          content: data,
          contentId: key,
        }))
      : undefined,
  };
}

const wordmark = (available: boolean, width: number, key: AssetKey = "logo", colour = "#ffffff") =>
  available
    ? `<img src="cid:${key}" width="${width}" alt="${esc(site.name)}" style="display:block;width:${width}px;max-width:100%;height:auto;border:0;outline:none">`
    : `<span style="font-family:${DISPLAY};font-size:${Math.round(width / 8)}px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:${colour}">${esc(site.name)}</span>`;

/** Phone only: a paper strip above everything else. The white logo on paper
    (and the black one in the phone footer) is deliberate, chosen for mail
    apps that invert the email in dark mode; in normal view neither shows.
    Hidden inline and kept out of Outlook; the media query reveals it, so a
    client that strips <style> just keeps the desktop header. */
const phoneLogo = (available: boolean) => `
  <!--[if !mso]><!-->
  <tr class="m-only" style="display:none">
    <td bgcolor="${PAPER}" style="background:${PAPER};padding:30px 28px 26px">
      ${wordmark(available, 150, "logoWhite")}
    </td>
  </tr>
  <!--<![endif]-->`;

/** Slate metadata — mono, tracked, uppercase. The site's vocabulary for roll
    numbers and timecode, carrying the date here. */
const slate = (parts: string[], colour: string, size = 11, track = ".16em") =>
  `<p style="margin:0;font-family:${MONO};font-size:${size}px;line-height:1.6;letter-spacing:${track};text-transform:uppercase;color:${colour};${BREAK}">${parts
    .map(esc)
    .join(" &nbsp;·&nbsp; ")}</p>`;

/** Label over value — one cell of the paper column's field grid. */
const field = (label: string, value: string, href?: string) => `
  <p style="margin:0 0 6px;font-family:${MONO};font-size:11px;line-height:1.5;letter-spacing:.14em;text-transform:uppercase;color:${MUTED_LIGHT}">${esc(label)}</p>
  <p style="margin:0;font-family:${BODY};font-size:17px;line-height:1.5;color:${INK};${BREAK}">${
    href
      ? `<a href="${esc(href)}" style="color:${INK};text-decoration:none">${esc(value)}</a>`
      : esc(value)
  }</p>`;

/** One grid row, hairline under it. A pair sits side by side on desktop and
    stacks on a phone in the same reading order; a lone field spans the row. */
const fieldRow = (cells: string[], last: boolean) => {
  const rule = last ? "" : `border-bottom:1px solid ${RULE_LIGHT};`;
  return cells.length === 1
    ? `<tr><td colspan="2" style="padding:20px 0;${rule}">${cells[0]}</td></tr>`
    : `<tr>
    <td class="col pair-l" width="50%" valign="top" style="width:50%;padding:20px 32px 20px 0;${rule}">${cells[0]}</td>
    <td class="col" width="50%" valign="top" style="width:50%;padding:20px 0;${rule}">${cells[1]}</td>
  </tr>`;
};

/** Full-bleed black footer, shared by both emails. */
function siteFooter(a: Assets) {
  const social = [
    { key: "instagram", label: "Instagram", href: site.instagram },
    { key: "linkedin", label: "LinkedIn", href: site.linkedin },
    { key: "whatsapp", label: "WhatsApp", href: `https://wa.me/${site.whatsapp}` },
  ]
    .map(({ key, label, href }) =>
      a[key as AssetKey]
        ? `<a href="${esc(href)}" style="text-decoration:none"><img src="cid:${key}" width="30" height="30" alt="${label}" style="width:30px;height:30px;border:0;outline:none"></a>`
        : `<a href="${esc(href)}" style="font-family:${MONO};font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${MUTED_DARK};text-decoration:none">${label}</a>`,
    )
    .join('<span style="display:inline-block;width:14px">&nbsp;</span>');

  return `
  <tr>
    <td class="foot" bgcolor="${INK}" style="background:${INK};padding:44px 56px 38px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%">
        <tr>
          <td class="foot-cell" valign="top" style="padding:0 16px 32px 0">
            <div class="d-only">${wordmark(Boolean(a.logo), 120)}</div>
            <!--[if !mso]><!--><div class="m-block" style="display:none">${wordmark(Boolean(a.logoBlack), 120, "logoBlack", INK)}</div><!--<![endif]-->
            <p style="margin:14px 0 0;font-family:${BODY};font-size:13px;line-height:1.6;color:${MUTED_DARK}">${esc(footerContent.services.join(", "))}.</p>
          </td>
          <td class="foot-cell foot-social" valign="top" align="right" style="text-align:right;padding:0 0 32px">
            <p style="margin:0 0 12px;font-family:${MONO};font-size:11px;line-height:1.5;letter-spacing:.16em;text-transform:uppercase;color:${MUTED_DARK}">Follow us</p>
            ${social}
          </td>
        </tr>
      </table>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%">
        <tr>
          <td style="padding:26px 0 0;border-top:1px solid ${RULE_DARK}">
            <p style="margin:0;font-family:${BODY};font-size:12px;line-height:1.6;color:${MUTED_DARK}">&copy; ${new Date().getFullYear()} ${esc(site.name)}. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

/** The paper-to-ink transition. `key` picks the variant whose wedge starts
    where the paper above it actually begins. */
const cutBottom = (available: boolean, key: "cutfoot" | "cutfootfull" = "cutfoot") =>
  available
    ? `
  <tr>
    <td class="cut-bottom" bgcolor="${INK}" style="background:${INK};font-size:0;line-height:0">
      <img src="cid:${key}" width="100%" alt="" style="display:block;width:100%;height:auto;border:0;outline:none">
    </td>
  </tr>`
    : "";

function shell({
  preheader,
  title,
  content,
}: {
  preheader: string;
  title: string;
  content: string;
}) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${esc(title)}</title>
<style>
  /* Stacks the split on a phone, where a 225px column is unreadable. Gmail,
     Apple Mail, iOS Mail and Outlook.com honour this; the few clients that
     strip it show the full-width desktop split instead. */
  @media only screen and (max-width:640px) {
    .col { display:block !important; width:100% !important; max-width:100% !important; }
    .pad-ink { padding:36px 28px 40px !important; }
    .pad-paper { padding:34px 28px 40px !important; }
    .col-paper-bg { background-image:none !important; }
    .cut-bottom { display:none !important; }
    .foot { padding:32px 28px !important; }
    .foot-cell { display:block !important; width:100% !important; text-align:left !important; padding:0 !important; }
    .foot-social { padding-top:28px !important; }
    .grid, .grid tbody, .grid tr, .grid td { display:block !important; width:100% !important; }
    .pair-l { padding-right:0 !important; }
    .m-only { display:table-row !important; }
    .m-block { display:block !important; }
    .d-only { display:none !important; }
    .ink-h1 { margin-top:0 !important; }
    .ack-head { padding:0 0 30px !important; }
    .ack-body { padding:30px 0 0 !important; border-left:0 !important; border-top:1px solid ${RULE_LIGHT} !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${INK};-webkit-text-size-adjust:100%">
  <!-- Inbox preview line, hidden in the body itself. -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${INK}" style="background:${INK};margin:0;padding:0">
    <tr>
      <td align="center" style="padding:0">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%">
${content}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* --- the studio's copy --------------------------------------------------- */

export async function leadEmail(brief: Brief) {
  const { a, attachments } = await loadAssets([
    "logo",
    "logoWhite",
    "logoBlack",
    "cut",
    "cutfoot",
    "instagram",
    "linkedin",
    "whatsapp",
  ]);
  const who = brief.company ? `${brief.name} · ${brief.company}` : brief.name;
  const tel = (brief.phone ?? "").replace(/[^\d+]/g, "");
  const first = brief.name.split(" ")[0];

  const fields = [
    brief.company ? field("Company", brief.company) : "",
    field("Email", brief.email, `mailto:${brief.email}`),
    field("Phone", brief.phone || "—", tel ? `tel:${tel}` : undefined),
    field("Needs", brief.needs),
    field("Timeline", longDate(brief.timeline)),
  ].filter(Boolean);
  const fieldRows: string[] = [];
  for (let i = 0; i < fields.length; i += 2) {
    fieldRows.push(fieldRow(fields.slice(i, i + 2), i + 2 >= fields.length));
  }

  const cutBg = a.cut
    ? `background-image:url('cid:cut');background-repeat:no-repeat;background-position:top left;background-size:${W - SPLIT}px ${CUT_H}px;`
    : "";

  const content = `${phoneLogo(Boolean(a.logoWhite))}
  <tr>
    <td style="padding:0">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;table-layout:fixed">
        <tr>
          <td class="col" width="${INK_COL}" valign="top" bgcolor="${INK}" style="width:${INK_COL};background:${INK}">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%"><tr><td class="pad-ink" style="padding:56px 48px 60px 56px">
            <div class="d-only">${wordmark(Boolean(a.logo), 150)}</div>
            <h1 class="ink-h1" style="margin:54px 0 0;font-family:${DISPLAY};font-size:27px;line-height:1.12;font-weight:800;letter-spacing:-.02em;text-transform:uppercase;color:#ffffff;${BREAK}">New brief<br>submitted</h1>
            <p style="margin:16px 0 0;font-family:${BODY};font-size:14px;line-height:1.65;color:${MUTED_DARK}">You have received a new brief submission. Here are the details shared by the client.</p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%">
              <tr><td height="34" style="height:34px;font-size:0;line-height:0">&nbsp;</td></tr>
              <tr><td style="border-top:1px solid #4a4a4a;font-size:0;line-height:0">&nbsp;</td></tr>
              <tr><td height="40" style="height:40px;font-size:0;line-height:0">&nbsp;</td></tr>
            </table>
            <p style="margin:0;font-family:${MONO};font-size:11px;line-height:1.5;letter-spacing:.14em;text-transform:uppercase;color:${MUTED_DARK}">The brief</p>
            <p style="margin:14px 0 0;font-family:${BODY};font-size:15px;line-height:1.65;color:#ffffff;${BREAK}">${para(brief.details)}</p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:36px">
              <tr>
                <td bgcolor="#ffffff" style="background:#ffffff">
                  <a href="mailto:${esc(brief.email)}?subject=${encodeURIComponent(`Re: your brief — ${site.name}`)}"
                     style="display:inline-block;padding:15px 18px;font-family:${MONO};font-size:11px;font-weight:700;letter-spacing:.13em;text-transform:uppercase;text-decoration:none;color:${INK};${BREAK}">Reply to ${esc(first)} &rarr;</a>
                </td>
              </tr>
            </table>
            </td></tr></table>
          </td>

          <td class="col col-paper-bg" valign="top" bgcolor="${PAPER}" background="cid:cut" style="background-color:${PAPER};${cutBg}">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%"><tr><td class="pad-paper" style="padding:56px 56px 60px 120px">
            ${slate(["New brief", stamp()], MUTED_LIGHT, 10, ".1em")}
            <h2 style="margin:30px 0 22px;font-family:${DISPLAY};font-size:24px;line-height:1.1;font-weight:800;letter-spacing:-.02em;text-transform:uppercase;color:${INK};${BREAK}">${esc(brief.name)}</h2>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="grid" style="width:100%;border-collapse:collapse;table-layout:fixed">
              <tr><td colspan="2" style="border-top:1px solid ${RULE_LIGHT};font-size:0;line-height:0">&nbsp;</td></tr>
              ${fieldRows.join("")}
            </table>
            </td></tr></table>
          </td>
        </tr>
      </table>
    </td>
  </tr>${cutBottom(Boolean(a.cutfoot))}${siteFooter(a)}`;

  const text = [
    `NEW BRIEF SUBMITTED · ${stamp()}`,
    "",
    who,
    "",
    `Email:    ${brief.email}`,
    `Phone:    ${brief.phone || "—"}`,
    `Needs:    ${brief.needs}`,
    `Timeline: ${longDate(brief.timeline)}`,
    "",
    "THE BRIEF",
    brief.details,
    "",
    `Reply to: ${brief.email}`,
  ].join("\n");

  return {
    subject: `New brief — ${who}`,
    html: shell({
      preheader: `${who} — ${brief.needs} · ${longDate(brief.timeline)}`,
      title: "New brief submitted",
      content,
    }),
    text,
    attachments,
  };
}

/* --- the sender's copy --------------------------------------------------- */

export async function ackEmail() {
  const { a, attachments } = await loadAssets([
    "logo",
    "logoWhite",
    "logoBlack",
    "cutfootfull",
    "instagram",
    "linkedin",
    "whatsapp",
  ]);

  const content = `${phoneLogo(Boolean(a.logoWhite))}
  <tr class="d-only">
    <td bgcolor="${INK}" style="background:${INK};padding:44px 56px 40px">
      ${wordmark(Boolean(a.logo), 150)}
    </td>
  </tr>
  <tr>
    <td class="pad-paper" bgcolor="${PAPER}" style="background:${PAPER};padding:56px 56px 64px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="width:100%;table-layout:fixed">
        <tr>
          <td class="col ack-head" width="${INK_COL}" valign="top" style="width:${INK_COL};padding:0 48px 0 0">
            ${slate(["Brief received", stamp()], MUTED_LIGHT)}
            <h1 style="margin:24px 0 0;font-family:${DISPLAY};font-size:34px;line-height:1.08;font-weight:800;letter-spacing:-.02em;text-transform:uppercase;color:${INK};${BREAK}">Brief<br>received.</h1>
          </td>
          <td class="col ack-body" valign="top" style="padding:4px 0 0 48px;border-left:1px solid ${RULE_LIGHT}">
            <p style="margin:0;font-family:${BODY};font-size:17px;line-height:1.7;color:${INK};${BREAK}">Thank you for reaching out to ${esc(site.name)}.</p>
            <p style="margin:18px 0 0;font-family:${BODY};font-size:17px;line-height:1.7;color:${MUTED_LIGHT};${BREAK}">We&rsquo;ve successfully received your brief, and our team will be in touch with you soon regarding the next steps.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>${cutBottom(Boolean(a.cutfootfull), "cutfootfull")}${siteFooter(a)}`;

  const text = [
    `BRIEF RECEIVED · ${stamp()}`,
    "",
    `Thank you for reaching out to ${site.name}.`,
    "",
    "We've successfully received your brief, and our team will be in touch with",
    "you soon regarding the next steps.",
    "",
    `${site.legalName} · ${site.url}`,
  ].join("\n");

  return {
    subject: `Brief received — ${site.name}`,
    html: shell({
      preheader: "We've received your brief. Our team will be in touch soon.",
      title: "Brief received",
      content,
    }),
    text,
    attachments,
  };
}
