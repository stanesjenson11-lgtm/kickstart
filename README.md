# Kickstart Creative Studio

One-page site for Kickstart Creative Studio Pvt Ltd — corporate photography and
film, headshots, events, advertising and social media.

Built from `KICKSTART_CREATIVE_STUDIO_PVT_LTD.md`. The strategic and visual
decisions behind it live in **PRODUCT.md** and **DESIGN.md**; read those before
changing anything visual.

## Run it

```bash
npm install
npm run dev          # http://localhost:3000
npm run build && npm run start
```

## Where things are

| | |
|---|---|
| `lib/content.ts` | **Every string and image URL on the site.** One file to swap placeholder photography for real Kickstart work. |
| `app/globals.css` | Design tokens: colour, type scale, the cut, grain, z-index. |
| `components/sections/` | One file per section, in the order they appear on the page. |
| `components/gl/` | The WebGL hero — `shaders.ts` is the grade. |
| `lib/motion.ts` | GSAP + Lenis setup and the reduced-motion guard. |
| `app/api/brief/route.ts` | Project-brief form handler. |

## Before going live

1. **Replace the photography.** Every image is a verified Unsplash placeholder.
   Swap the `IMG(...)` calls in `lib/content.ts` for real work. Nothing else
   references image URLs.

2. **Add the showreel.** Drop a 30–60s monochrome cut at `public/showreel.mp4`
   and set `showreel.src` in `lib/content.ts`. Until then the section shows its
   poster and offers no play control, so nothing implies footage that does not
   exist. This is the highest-value asset to replace — the brief calls the reel
   one of the site's main selling points.

3. **Fill in the real contact details.** `site.email`, `site.phone`,
   `site.whatsapp`, `site.instagram`, `site.linkedin` in `lib/content.ts` are
   placeholders.

4. **Add clients and testimonials.** `clients` and `testimonials` in
   `lib/content.ts` are empty arrays, so both sections are hidden. Add real
   entries and they appear automatically. Per the brief: genuine ones only.

5. **Configure mail.** Copy `.env.example` to `.env.local` and set
   `RESEND_API_KEY` and `LEAD_TO_EMAIL`. Without them the form renders and
   validates but `/api/brief` returns 500 and the visitor sees the error state.

6. **Set the real domain** in `site.url` (`lib/content.ts`) so canonical URLs,
   the sitemap and the Open Graph card point at production.

7. **Supply a vector logo.** `public/ks-mark.jpg` is the file that came with the
   brief — a 545×482 JPEG named `.PNG`. It is fine at favicon size and too small
   for anything else. The bolt used through the site (`public/bolt.svg`,
   `app/icon.svg`, the loader, the footer watermark) is hand-drawn vector and
   needs no replacement.

## Deploy

Vercel, zero config. Set `RESEND_API_KEY` and `LEAD_TO_EMAIL` (and optionally
`LEAD_FROM_EMAIL`) as environment variables.

`.npmrc` pins the public npm registry — this machine's global npm config points
at a private CodeArtifact endpoint that cannot resolve public packages.

## Notes

- **Motion.** GSAP ScrollTrigger drives seven distinct scroll mechanics; Lenis
  provides the smooth scroll. Every section renders complete and visible in CSS,
  and animation is only ever added on top — so crawlers, headless renderers and
  `prefers-reduced-motion` users get a finished page, never a blank one.
- **Reduced motion** is a designed variant, not a kill switch: smooth scroll off,
  scrubs resolved to their end state, WebGL replaced by a graded still.
- **Contrast.** The brief's light grey `#A0A0A0` fails AA on white (2.5:1), so it
  is split into `--color-muted-dark` (on black) and `--color-muted-light` (on
  white). Do not use the light grey on a white ground.
