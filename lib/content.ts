/**
 * Single source of truth for every string and media path on the site.
 *
 * Replacing the placeholder photography with real Kickstart work is a one-file
 * change: swap the `src` values below. Nothing else references image URLs.
 *
 * Placeholder photography is Unsplash, downloaded once into public/placeholders
 * so every image is same-origin and pre-sized by scripts/images.mjs.
 */


export const site = {
  name: "Kickstart Creative Studio",
  legalName: "Kickstart Creative Studio Pvt Ltd",
  /* title and description only reach search results and link previews, never the page. */
  title: "Kickstart Creative Studio | Media Production, Marketing & Events",
  description:
    "Kickstart Creative Studio is a Bangalore media and production company: corporate photography, brand films, advertising, digital marketing, social media and event management.",
  url: "https://kickstartcreativestudio.com",
  email: "business@kickstartcreativestudio.com",
  whatsapp: "919677827166",
  instagram: "https://www.instagram.com/kickstartcreativestudio/",
  linkedin: "https://www.linkedin.com/company/kickstart-creativestudio/",
  /** Cloudflare Turnstile site key. Public by design (it ships in every page), so it
      lives here instead of a build variable a missed dashboard setting leaves empty.
      Must stay paired with the TURNSTILE_SECRET_KEY Secret on the Worker — a key from
      a different widget verifies as a failure, so every brief would 403.
      NEXT_PUBLIC_TURNSTILE_SITE_KEY still overrides it, e.g. test keys locally. */
  turnstileSiteKey: "0x4AAAAAAEzk8ZnvA-izyZ17",
  /** The Turnstile bot check on the contact form. Requires TURNSTILE_SECRET_KEY on
      the Worker as a Secret; without it the brief route answers 500, not a bypass. */
  turnstile: true as boolean,
} as const;

export const nav = {
  links: [
    { label: "Work", href: "#work" },
    { label: "Services", href: "#services" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ],
  cta: { label: "Work with Us", href: "#contact" },
} as const;

/* 01 — HERO ------------------------------------------------------------- */
export const hero = {
  headline: ["We make brands", "look remarkable."],
  support: "Premium visual storytelling, media production & social media for ambitious brands.",
  primary: { label: "View our work", href: "#work" },
  secondary: { label: "Work with Us", href: "#contact" },
  disciplines: ["Media production", "Corporate", "Advertising", "Events", "Social"],
  /**
   * The hero renders these as a slow WebGL cross-dissolve montage with film
   * grain, halation and cursor displacement — cinematic motion without a video
   * asset. Set `showreel.src` to a real MP4 and the reel takes over there.
   */
  /**
   * One plate: the projector cutting its beam through haze.
   *
   * HeroCanvas still runs its cross-dissolve, which resolves to a no-op at this
   * length — tA and tB land on the same texture — so the frame holds still while
   * the grain, halation, drifting bolt and cursor displacement carry the motion.
   * Add entries here and the montage starts cycling again on its own.
   */
  plates: ["/placeholders/hero-plate.jpg"],
  /* Phones held upright. */
  platesPortrait: ["/hero/projector-phone.png"],
  /**
   * Where the fog starts, per plate set, as a fraction of texture width: the
   * lens sits at ~0.55 in the landscape frame and ~0.52 in the portrait one, so
   * the shader needs the boundary told to it rather than hard-coded.
   */
  // Portrait: the lens face ends at ~0.48 and the crate's lit top-right corner
  // sits at ~0.57, so the ramp starts just clear of the lens and is still
  // shallow at the corner — the crate edge barely moves.
  fog: { landscape: [0.56, 0.70], portrait: [0.53, 0.66] },
  /* The projector shot. Mattes from scripts/cutout.py, per plate set. */
  shot: {
    masks: { landscape: "/hero/mask-desktop.png", portrait: "/hero/mask-phone.png" },
    /**
     * The projector as scripts/cutout.py cut it. `rect` is the cutout's bounds
     * in plate texture space (the script prints it), `aspect` the plate's own
     * width/height, `lens` the lens face within the cutout. `cutoutLeft` is the
     * same photograph mirrored with its lettering put back the right way round,
     * for after the projector turns; its lens sits at x = 1 - lens[0].
     */
    plates: {
      landscape: {
        cutout: "/hero/cutout-desktop.png",
        cutoutLeft: "/hero/cutout-desktop-left.png",
        aspect: 4000 / 2667,
        rect: { x: 0.11925, y: 0.27634, w: 0.411, h: 0.6078 },
        lens: [0.996, 0.377],
      },
      portrait: {
        cutout: "/hero/cutout-phone.png",
        cutoutLeft: "/hero/cutout-phone-left.png",
        aspect: 941 / 1672,
        rect: { x: 0.09777, y: 0.53349, w: 0.39426, h: 0.2183 },
        lens: [0.982, 0.385],
      },
    },
    /**
     * Where the projector comes to rest in the pinned Statement frame, turned
     * round to face the headline from the right: centre and width as fractions
     * of the viewport, angles in degrees (positive roll tips the lens up),
     * `spread` the beam's half-angle in radians.
     *
     * Desktop sits level with the headline so the light crosses the frame
     * almost flat. On a phone the headline fills the top of the screen, so the
     * projector sits low and tilts up to reach it, with a wider cone.
     */
    end: {
      landscape: { cx: 0.76, cy: 0.55, width: 0.27, roll: 8, yaw: 12, pitch: 3, spread: 0.14 },
      portrait: { cx: 0.7, cy: 0.72, width: 0.56, roll: 32, yaw: 10, pitch: 3, spread: 0.22 },
    },
  },
} as const;

/* 02 — BRAND STATEMENT --------------------------------------------------- */
export const statement = {
  headline: "Your business deserves more than ordinary content.",
  body: "We create refined visual experiences that elevate brands, connect with audiences and leave a lasting impression.",
} as const;

/* 03 — SHOWREEL ---------------------------------------------------------- */
export const showreel = {
  headline: "Watch the work.",
  src: "/showreel.mp4" as string,
  srcSmall: "/showreel-sm.mp4" as string,
} as const;

/* 05 — SERVICES ---------------------------------------------------------- */
export const services = {
  label: "We create",
  headline: "From first idea to final frame.",
  groups: [
    {
      title: "Corporate visuals",
      items: ["Executive/founder portraits", "Corporate headshots", "Team photography"],
      src: "/placeholders/services-1.jpg",
    },
    {
      title: "Events",
      items: ["Corporate events", "Conferences", "Launches", "Award nights", "Corporate parties"],
      src: "/gallery/conferences/toast-53.webp",
    },
    {
      title: "Advertising",
      items: ["Campaign films", "Commercials", "Product content", "Brand films"],
      src: "/placeholders/services-2.jpg",
    },
    {
      title: "Social media",
      items: [
        "Content strategy",
        "Monthly content production",
        "Reels & short-form video",
        "Social campaigns",
        "Social media management",
        "Paid ads management",
      ],
      src: "/placeholders/services-3.jpg",
    },
  ],
} as const;

/* 09 — EVENT GALLERY ----------------------------------------------------- */
/** Real client work. Photos live in `public/gallery/<slug>`,
 *  resized from the originals in `assets/`. */
export const gallery = {
  headline: "Gallery",
  categories: [
    {
      name: "Corporate events",
      photos: [
        {
          src: "/gallery/corporate-events/adyen-nl-201.webp",
          alt: "Colleagues talking and laughing over drinks at an office networking evening",
        },
        {
          src: "/gallery/corporate-events/cgi-82.webp",
          alt: "Delegates in suits in conversation, drinks in hand, in front of a lit brand backdrop",
        },
        {
          src: "/gallery/corporate-events/toast-63.webp",
          alt: "A speaker addressing the room from the stage against an illuminated brand wall",
        },
        {
          src: "/gallery/corporate-events/wsa-225.webp",
          alt: "A host presenting to a standing audience across an open-plan office floor",
        },
        {
          src: "/gallery/corporate-events/wsa-39.webp",
          alt: "A full team lined up for a group photograph in a bright office atrium",
        },
      ],
    },
    {
      name: "Conferences",
      photos: [
        {
          src: "/gallery/conferences/cgi-225.webp",
          alt: "A delegate putting a question to the panel from the floor of a conference hall",
        },
        {
          src: "/gallery/conferences/img-8435.webp",
          alt: "Four panellists mid-discussion in armchairs on a conference stage",
        },
        {
          src: "/gallery/conferences/img-8437.webp",
          alt: "A panel on stage seen over the heads of a packed national conference audience",
        },
        {
          src: "/gallery/conferences/micron-56.webp",
          alt: "Two speakers in conversation on an orange stage against a branded backdrop",
        },
        {
          src: "/gallery/conferences/toast-53.webp",
          alt: "A ballroom of delegates seated at round tables through a keynote",
        },
      ],
    },
    {
      name: "Launches",
      photos: [
        {
          src: "/gallery/launches/cgi-43.webp",
          alt: "Guests lighting the ceremonial lamp at an office inauguration",
        },
        {
          src: "/gallery/launches/micron-27.webp",
          alt: "Leadership cutting a branded ribbon at the opening of a new facility",
        },
        {
          src: "/gallery/launches/micron-40.webp",
          alt: "A guest lighting the ceremonial lamp beside a garlanded green wall",
        },
        {
          src: "/gallery/launches/wsa-121.webp",
          alt: "Executives touring a cleanroom production floor at a plant opening",
        },
        {
          src: "/gallery/launches/wsa-205.webp",
          alt: "A team holding an oversized commemorative key at a site launch",
        },
      ],
    },
    {
      name: "Award nights",
      photos: [
        {
          src: "/gallery/award-nights/cgi-254.webp",
          alt: "A banquet hall of guests applauding under chandeliers at an awards night",
        },
        {
          src: "/gallery/award-nights/toast-51.webp",
          alt: "A guest standing to be recognised among the seated audience",
        },
        {
          src: "/gallery/award-nights/toast-79.webp",
          alt: "A winner collecting a trophy and certificate on stage beside their citation",
        },
        {
          src: "/gallery/award-nights/toast-80.webp",
          alt: "A recipient shaking hands as they take their award on stage",
        },
        {
          src: "/gallery/award-nights/toast-82.webp",
          alt: "Two colleagues holding their trophies up for the camera on stage",
        },
      ],
    },
    {
      name: "Corporate parties",
      photos: [
        {
          src: "/gallery/corporate-parties/cw-172.webp",
          alt: "A team in festive dress posed together at a Diwali office celebration",
        },
        {
          src: "/gallery/corporate-parties/dsc-3873.webp",
          alt: "A DJ performing behind the decks under stage lighting",
        },
        {
          src: "/gallery/corporate-parties/dsc00730.webp",
          alt: "Sparklers firing above a crowd at an outdoor evening party",
        },
        {
          src: "/gallery/corporate-parties/dsc01162.webp",
          alt: "A crowd dancing with hands raised under warm light",
        },
        {
          src: "/gallery/corporate-parties/equinoxdiwali-111.webp",
          alt: "Guests seated at round tables in a chandelier-lit banquet hall",
        },
      ],
    },
  ],
} as const;

/* 11 — CLIENTS ----------------------------------------------------------- */
/**
 * Real clients only. While this is empty the section does not render.
 *
 * Logos are normalised to flat-white silhouettes in `public/clients/` — the
 * originals in `Logos/` are a mix of transparent marks, white plates and one
 * purple gradient lockup, which on an ink ground either vanish or show as
 * bright rectangles. Ordered strongest-first, not alphabetically.
 */
export const clients: { name: string; logo?: string }[] = [
  { name: "Swiggy", logo: "/clients/swiggy.png" },
  { name: "CRED", logo: "/clients/cred.png" },
  { name: "Hilton", logo: "/clients/hilton.png" },
  { name: "WeWork", logo: "/clients/wework.png" },
  { name: "Micron", logo: "/clients/micron.png" },
  { name: "Absolut", logo: "/clients/absolut.png" },
  { name: "CGI", logo: "/clients/cgi.png" },
  { name: "Toast", logo: "/clients/toast.png" },
  { name: "Cushman & Wakefield", logo: "/clients/cushman-wakefield.png" },
  { name: "Embassy", logo: "/clients/embassy.png" },
  { name: "Kennametal", logo: "/clients/kennametal.png" },
  { name: "Sattva", logo: "/clients/sattva.png" },
  { name: "Sigmoid", logo: "/clients/sigmoid.png" },
  { name: "Spark by Hilton", logo: "/clients/spark-by-hilton.png" },
  { name: "Stonehill", logo: "/clients/stonehill.png" },
  { name: "Superhealth", logo: "/clients/superhealth.png" },
  { name: "Vizipa", logo: "/clients/vizipa.png" },
  { name: "WSA", logo: "/clients/wsa.png" },
  { name: "Internal Auditors", logo: "/clients/iia.png" },
  { name: "080 Lounges", logo: "/clients/080lounges.png" },
];

/* 12 — TESTIMONIALS ------------------------------------------------------ */
/** Real testimonials only. While this is empty the section does not render. */
export const testimonials: {
  quote: string;
  name: string;
  role: string;
  company: string;
}[] = [];

/* 13 — ABOUT ------------------------------------------------------------- */
export const about = {
  headline: "About\nKickstart",
  body: "Founded by Jerry Joshan, Kickstart Creative Studio was built on a simple belief: great businesses deserve to look as remarkable as the work they do. Bridging strategy and creativity, we bring together premium visual storytelling, media production and social media to create refined, purposeful brand experiences that command attention and leave a lasting impression.",
  src: "/jerry-joshan.png",
  alt: "Jerry Joshan, founder of Kickstart Creative Studio, arms folded in a tailored suit",
} as const;

/* 14 — FAQ --------------------------------------------------------------- */
export const faq = [
  {
    q: "What type of companies do you work with?",
    a: "Corporates, funded startups, agencies and established consumer brands anyone who needs their visual output to look as considered as the rest of their business. We work with teams of five and teams of five thousand.",
  },
  {
    q: "Do you travel for shoots and events?",
    a: "Yes. We cover multi-city shoots and events regularly, and we budget travel transparently in the quote rather than surfacing it afterwards.",
  },
  {
    q: "Do you offer monthly social media packages?",
    a: "Yes. Monthly retainers cover strategy, content planning, production days, editing and scheduling. Most partners start with a single production day per month and scale from there.",
  },
  {
    q: "Can you handle both production and social media?",
    a: "That is the point of the studio. The same team shooting your brand film cuts the reels from it, so the campaign and the feed come out of one production rather than two briefs.",
  },
  {
    q: "How do we start a project?",
    a: "Send a project brief using the form below. Tell us what you need and when you need it, and you will get a considered reply rather than a discovery call.",
  },
] as const;

/* 15 — CONTACT ------------------------------------------------------------ */

export const contact = {
  headline: "Contact us",
  /* Downloaded with `rect=0,0,1740,1861`: the source cropped to its left 62%. The
     full frame has a costumed dancer on the marks at ~0.65 across who reads as
     unprofessional at background scale; cropping there keeps the operator, the
     cinema camera, the magenta rim and the LED tubes — and the grade, which is
     the whole reason for this picture. Crop, not a different photo: nothing
     free-licensed pairs this lighting with a professional model. */
  bg: "/placeholders/contact-bg.jpg",
} as const;

export const form = {
  submit: "Submit form",
} as const;

/* FOOTER ----------------------------------------------------------------- */
export const footer = {
  /* Not in the site footer any more — this is the line under the wordmark in
     the brief emails (lib/brief-email.ts), which is the only consumer left. */
  services: ["Media production", "Advertising", "Social media"],
  socials: [
    { label: "Instagram", href: site.instagram },
    { label: "LinkedIn", href: site.linkedin },
    { label: "WhatsApp", href: `https://wa.me/${site.whatsapp}` },
  ],
  copyright: "© 2026 Kickstart Creative Studio Pvt Ltd",
} as const;
