# Product

## Register

brand

## Users

Decision-makers at companies commissioning creative production: marketing heads, brand managers,
founders, HR/internal-comms leads, and event organisers. They arrive from an Instagram profile, a
referral, or a WhatsApp link — usually on a phone, usually with a shoot or campaign already in mind
and a shortlist of two or three studios open in other tabs.

Their job to be done is not "learn about Kickstart." It is **decide whether Kickstart is good enough
to trust with a budget, then start a conversation without hunting for contact details.**

A secondary audience matters commercially: brands that arrive for one shoot and could become a
monthly content retainer. The Social Media section exists to plant that idea.

## Product Purpose

A single-page site for Kickstart Creative Studio Pvt Ltd (founded August 2025, incorporated March
2026) — a creative production studio doing corporate photography and film, headshots, events,
advertising, and social media.

The site exists for **lead generation and credibility**, not information display. Its whole job is
to make the quality of the work obvious before it explains the service list, and to make starting a
project the easiest action on the page.

Success looks like: a visitor understands who Kickstart is, what they make, and how to start a
project within roughly five seconds; the qualified ones send a project brief with budget and
timeline attached, so the first reply can be a real conversation instead of a discovery call.

## Brand Personality

**Cinematic. Exacting. Kinetic.**

The voice is a working crew's, not a marketing department's: short declaratives, no hedging, no
adjective stacking. It states what it makes and lets the frame carry the persuasion. Confident
without boasting — the site should feel like it was art-directed by people who light things for a
living.

Emotionally it should evoke *confidence* — the visitor's confidence that this studio will not
embarrass them in front of their CEO — with an undercurrent of momentum. The name is a verb.

## Anti-references

Taken directly from the client brief, which is unusually specific about what to avoid:

- **Generic digital agency websites.** The brief's single most emphatic instruction.
- Excessive rounded cards; identical card grids; card-heavy service listings
- Stock-looking imagery and cheap icon sets
- Colourful gradients, neon, excessive glassmorphism
- Cluttered layouts and overcomplicated animation
- Component-registry house style (Aceternity / Skiper / 21st.dev defaults) — gradient borders, glow,
  glass. The techniques are welcome; the look is banned.

Two further anti-references from design analysis, not in the brief:

- **Vercel/Linear monochrome minimalism.** The first-order reflex for any black-and-white brand.
- **Editorial-magazine pastiche** — display serif, italic drop caps, ruled three-column grids. The
  brief lists "editorial magazine" as one of four ingredients; it must not become the whole dish.

## Design Principles

1. **Show the work before explaining the work.** Hierarchy is IMPACT → WORK → TRUST → SERVICES →
   PROCESS → CONTACT. Any section that explains before it demonstrates is in the wrong place.

2. **Motion is the portfolio.** With no colour and, initially, no real client footage, the scroll
   itself has to prove the studio can direct attention. Every transition is an audition — which
   means none of them may be decorative.

3. **One cut, everywhere.** The diagonal slash in the KS monogram is the only ornamental vocabulary
   the site gets. Reused as transition, mask, hover, and underline, it reads as identity; a second
   competing motif would read as decoration.

4. **Never make them look for the contact.** A lead action is reachable from every screen height.
   The form asks what a real quote needs — need, timeline, budget — so the first reply can be
   substantive.

5. **Restraint is not the same as emptiness.** Negative space is a compositional tool here, not an
   excuse to ship a page with nothing on it. Where the brief implies photography, photography ships.

## Accessibility & Inclusion

Target **WCAG 2.2 AA**.

- All text ≥4.5:1 against its ground (≥3:1 for large). The client palette's `#A0A0A0` passes on
  black (7.9:1) and fails on white (2.5:1), so the muted grey is split into on-dark and on-light
  tokens rather than used as specified.
- `prefers-reduced-motion: reduce` is a first-class variant, not a switch that disables the site:
  smooth scroll off, scrubs resolved to final state, WebGL replaced by a graded still, pinned
  horizontal section relaid out as a vertical stack. The page must remain complete and readable.
- Content is visible by default; animation only enhances. Nothing is gated behind a scroll trigger,
  so crawlers, headless renderers, and background tabs never see blank sections.
- Full keyboard path with visible focus. No hover-only functionality — every hover reveal has a
  focus or always-on equivalent.
- Touch targets ≥44px. The site is read on phones first.
