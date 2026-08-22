# Design

## Theme

**The production floor.** Not the finished magazine — the apparatus that makes the images.

The KS monogram is signage, not a wordmark: a fat stencil cut through by a lightning bolt, the kind
of marking stamped on a flight case, a clapperboard, a lens barrel, a lighting stand. The site
extends that logic into a whole system — slate metadata, roll and frame numbers, focus marks,
hairline rules, white-on-black because white-on-black is what survives a dark set.

Dark is not a stylistic default here. The physical scene: a colourist's suite at 11pm, the room
black so the image on the wall is the only thing with luminance. That forces the answer.

## Color

Monochrome only. The palette is the client's committed spec and is preserved exactly; the only
change is splitting the muted grey by ground, because one value cannot serve both.

Strategy: **Drenched.** Black is the surface (~70% of the page). White counter-drenches four
sections — Statement, Selected Work, Social, About — so the black returns with force each time.

| Token | OKLCH | Hex | Role |
|---|---|---|---|
| `--ink` | `oklch(0.145 0 0)` | `#050505` | Primary ground |
| `--ink-raised` | `oklch(0.205 0 0)` | `#151515` | Raised surfaces, inputs, hairline fills |
| `--paper` | `oklch(1 0 0)` | `#FFFFFF` | Counter-drench ground, text on ink |
| `--paper-warm` | `oklch(0.968 0.001 106)` | `#F5F5F3` | Secondary light ground |
| `--muted-on-dark` | `oklch(0.715 0 0)` | `#A0A0A0` | Secondary text on ink — 7.9:1 |
| `--muted-on-light` | `oklch(0.475 0 0)` | `#5A5A5A` | Secondary text on paper — 7.0:1 |
| `--rule-on-dark` | `oklch(1 0 0 / 0.14)` | — | Hairlines on ink |
| `--rule-on-light` | `oklch(0.145 0 0 / 0.14)` | — | Hairlines on paper |

**No accent colour, by brief.** The accent is motion, film grain, and the cut. `#A0A0A0` must never
appear on a white ground — it scores 2.5:1 and fails AA.

## Typography

Two families, contrasting on the grotesk↔mono axis. No serif: the optional editorial serif in the
brief would pull the page into a saturated aesthetic lane the theme deliberately rejects.

**Archivo Variable** — display and body. `wght 100–900`, `wdth 62–125`. Chosen because its expanded
heavy cut shares the monogram's fat squared geometry. The width axis is an expressive instrument,
not a fallback: headlines animate `wdth 115 → 85` on scroll, so type gains scale from width rather
than from oversized `font-size`.

**Martian Mono** — slate metadata only. Roll numbers, timecode, indices, field labels, section
counters (`A001_C007`, `00:00:32:14`, `01 / 07`). Mono earns its place because film metadata
genuinely is monospaced; it is never used for body copy.

### Scale

Modular, ratio 1.333, fluid `clamp()`.

| Step | Size | Use |
|---|---|---|
| `--t-display` | `clamp(3rem, 9vw, 6rem)` | Hero and final CTA |
| `--t-h1` | `clamp(2.25rem, 6vw, 4.5rem)` | Section headlines |
| `--t-h2` | `clamp(1.75rem, 4vw, 3rem)` | Sub-headlines |
| `--t-h3` | `clamp(1.25rem, 2.2vw, 1.75rem)` | Group titles |
| `--t-body` | `clamp(1rem, 1.15vw, 1.125rem)` | Body |
| `--t-meta` | `0.75rem` | Mono metadata, tracking `0.16em` |

Display tracking `-0.035em` (never tighter than `-0.04em`). Line-height `0.92` on display, `1.6` on
body, `1.65` for body on dark grounds — light type on black reads lighter and needs the air.
`text-wrap: balance` on h1–h3, `pretty` on prose. Measure capped at 68ch.

## The cut

One motif, five uses. A ~12° diagonal derived from the monogram's bolt.

```
--cut-angle: 12deg;
--cut: polygon(0 0, 100% 0, 100% 100%, 0 100%);   /* animated via clip-path */
```

1. **Section transitions** — sections wipe along the cut, never a plain fade
2. **Image reveals** — photographs unmask along the cut, not up from the bottom
3. **Work hover** — the image splits along the cut and the halves offset
4. **Link underline** — a hairline sweeping in at the cut angle
5. **Loader** — the bolt draws itself, then the cut opens the hero

A second ornamental motif would read as decoration. There isn't one.

## Layout

- Full-bleed by default; the container is the exception, not the rule
- Fluid gutters `clamp(1.25rem, 5vw, 6rem)`; section rhythm varies deliberately — the Statement
  breathes at `clamp(8rem, 18vh, 14rem)`, the Services list tightens to `0`
- Asymmetric compositions; the grid is broken on purpose at Headshots and Social
- Hairline rules instead of cards. The brief bans card-heavy UI; Services uses `1px` dividers
- Breakpoints 1920 / 1440 / 1280 / 1024 / 768 / 390 — composed per size, never shrunk

### z-index scale

Semantic, no arbitrary values.

```
--z-base: 0;  --z-media: 1;  --z-content: 2;  --z-sticky: 10;
--z-nav: 20;  --z-overlay: 30;  --z-menu: 40;  --z-loader: 50;
```

## Motion

Seven distinct mechanics across sixteen sections — never one entrance repeated. Each reveal is
shaped to what it reveals.

- **Engine:** Lenis (smooth scroll) bridged to GSAP ScrollTrigger. Lenis over ScrollSmoother because
  this design is built on `position: sticky`, which ScrollSmoother's transform wrapper fights.
- **Easing:** exponential ease-out (`expo.out`, `quart.out`). No bounce, no elastic, no spring
  except the magnetic button's cursor tracking.
- **Duration:** 240ms micro, 600ms reveal, 900ms+ orchestration. Scrubbed motion has no duration —
  it is bound to scroll position.
- **Materials:** transform, opacity, `clip-path`, `filter: blur()`, `mask`, and the variable-font
  width axis. Never animate layout properties.
- **Reduced motion:** a designed variant. Smooth scroll off, scrubs resolved to their end state,
  WebGL replaced by a graded still, horizontal pin relaid out as a vertical stack.
- **Reveal safety:** everything visible in CSS by default; GSAP sets from-states only after mount.

## Imagery

High-contrast black and white, strong shadows, dramatic lighting, editorial cropping, full-bleed.
Grading is applied in CSS (`grayscale(1) contrast(1.08)`) so a colour source can be swapped in
without re-editing files.

All media paths live in `lib/content.ts` — one file to replace placeholders with real Kickstart work.
Placeholder photography is verified Unsplash; every URL is checked for a 200 and visually confirmed
before it ships.

## Components

Hairline-first, no cards. `MagneticButton` (spring cursor tracking, plain hover under reduced
motion), `CutReveal` (clip-path mask on scroll), `SplitLines` (GSAP SplitText line/word reveal),
`Marquee`, `Field` and `Chip` for the brief form. Chips replace selects — a `<select>` in this
palette is the one element that would look like a template.
