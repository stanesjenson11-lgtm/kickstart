/**
 * Single source of truth for every string and media path on the site.
 *
 * Replacing the placeholder photography with real Kickstart work is a one-file
 * change: swap the `src` values below. Nothing else references image URLs.
 *
 * Placeholder photography is Unsplash. Every URL was verified (HTTP 200) and
 * visually reviewed before being committed here.
 */

export const IMG = (id: string, w = 1600, q = 80) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=${q}`;

/**
 * Same image, desaturated by the CDN rather than by a CSS filter.
 *
 * Used where the picture is in constant motion: a `filter` on a moving element
 * repaints it every frame, and forty of those cost more than half the hero's
 * frame budget. The CDN does it once, at the edge, for free.
 */
export const MONO = (id: string, w = 700, q = 75) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&sat=-100&w=${w}&q=${q}`;

export const site = {
  name: "Kickstart Creative Studio",
  legalName: "Kickstart Creative Studio Pvt Ltd",
  title: "Kickstart Creative Studio | Media Production & Social Media",
  description:
    "Creative production studio for corporate photography, brand films, event coverage, advertising and social media. We make brands look remarkable.",
  url: "https://kickstartcreativestudio.com",
  email: "hello@kickstartcreative.studio",
  phone: "+91 00000 00000",
  whatsapp: "910000000000",
  instagram: "https://instagram.com/",
  linkedin: "https://linkedin.com/",
} as const;

export const nav = {
  links: [
    { label: "Work", href: "#work" },
    { label: "Services", href: "#services" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ],
  cta: { label: "Start a project", href: "#contact" },
} as const;

/* 01 — HERO ------------------------------------------------------------- */
export const hero = {
  headline: ["We make brands", "look remarkable."],
  support: "Creative production & social media for ambitious businesses.",
  primary: { label: "View our work", href: "#work" },
  secondary: { label: "Start a project", href: "#contact" },
  disciplines: ["Media production", "Advertising", "Social"],
  /**
   * The showreel renders these as a slow WebGL cross-dissolve montage with film
   * grain, halation and cursor displacement — cinematic motion without a video
   * asset. Set `showreel.src` to a real MP4 and the reel takes over there.
   * `plates[0]` alone also grounds the hero, behind the contact sheet below.
   */
  plates: [
    IMG("photo-1478720568477-152d9b164e26", 2000),
    IMG("photo-1573164713988-8665fc963095", 2000),
    IMG("photo-1493225457124-a3eb161ffa5f", 2000),
    IMG("photo-1516035069371-29a1b244cc32", 2000),
  ],
  alt: "A studio light cutting a hard beam through haze on a Kickstart set",

  /**
   * The hero's contact sheet: the frames that tile infinitely behind the
   * headline. Deliberately the same work that appears in the sections below —
   * a contact sheet shows the studio's actual output, not a separate set.
   * Twelve unique frames tile to fill any viewport, so this is twelve requests
   * however far the visitor drags.
   */
  sheet: [
    MONO("photo-1519085360753-af0119f7cbe7", 700),
    MONO("photo-1531058020387-3be344556be6", 700),
    MONO("photo-1542291026-7eec264c27ff", 700),
    MONO("photo-1505236858219-8359eb29e329", 700),
    MONO("photo-1516035069371-29a1b244cc32", 700),
    MONO("photo-1573164713988-8665fc963095", 700),
    MONO("photo-1585951237318-9ea5e175b891", 700),
    MONO("photo-1493225457124-a3eb161ffa5f", 700),
    MONO("photo-1592878904946-b3cd8ae243d0", 700),
    MONO("photo-1478737270239-2f02b77fc618", 700),
    MONO("photo-1511795409834-ef04bbd61622", 700),
    MONO("photo-1478720568477-152d9b164e26", 700),
  ],
} as const;

/* 02 — BRAND STATEMENT --------------------------------------------------- */
export const statement = {
  headline: "Your business deserves more than ordinary content.",
  body: "Visual content and social experiences that make ambitious brands impossible to ignore.",
} as const;

/* 03 — SHOWREEL ---------------------------------------------------------- */
export const showreel = {
  label: "Showreel",
  headline: "Watch the work.",
  poster: IMG("photo-1585951237318-9ea5e175b891", 2000),
  /** Drop a real 30-60s monochrome reel at /public/showreel.mp4 and set this. */
  src: "" as string,
  runtime: "00:00:48:00",
  roll: "A001_KS_REEL",
} as const;

/* 04 — SELECTED WORK ----------------------------------------------------- */
export type Project = {
  index: string;
  category: string;
  client: string;
  services: string[];
  blurb: string;
  src: string;
  alt: string;
};

export const work: { label: string; headline: string; projects: Project[] } = {
  label: "Selected work",
  headline: "A few things we have made.",
  projects: [
    {
      index: "01",
      category: "Corporate",
      client: "Meridian Group",
      services: ["Brand film", "Corporate photography", "Social content"],
      blurb: "Shot across three floors in a day, cut for the AGM and nine ways for social.",
      src: IMG("photo-1573164713988-8665fc963095", 1800),
      alt: "An executive walking a corridor, lit hard from one side, shot for a brand film",
    },
    {
      index: "02",
      category: "Events",
      client: "Northline Summit",
      services: ["Event photography", "Videography", "Aftermovie"],
      blurb:
        "Two days, four halls, 1,400 delegates. Stills delivered same-night, aftermovie inside a week.",
      src: IMG("photo-1531058020387-3be344556be6", 1800),
      alt: "A full conference hall under arched windows during a keynote",
    },
    {
      index: "03",
      category: "Advertising",
      client: "Fieldwork Athletic",
      services: ["Commercial", "Campaign content", "Paid social"],
      blurb:
        "A product campaign built to survive being cropped to a square, a story and a thumbnail.",
      src: IMG("photo-1542291026-7eec264c27ff", 1800),
      alt: "A single running shoe lit against a seamless backdrop for a product campaign",
    },
    {
      index: "04",
      category: "Headshots",
      client: "Aster Capital",
      services: ["Executive headshots", "Team photography"],
      blurb: "Forty-one portraits, one afternoon, one lighting setup — no one kept waiting.",
      src: IMG("photo-1592878904946-b3cd8ae243d0", 1800),
      alt: "A tailored suit and watch, cropped close, from an executive portrait session",
    },
    {
      index: "05",
      category: "Brand",
      client: "Halden and Co.",
      services: ["Event coverage", "Reels", "Campaign content"],
      blurb: "A launch covered like a campaign shoot — content that outlived the night.",
      src: IMG("photo-1505236858219-8359eb29e329", 1800),
      alt: "Confetti bursting over a crowd with hands raised at a launch party",
    },
  ],
};

/* 05 — SERVICES ---------------------------------------------------------- */
export const services = {
  label: "What we do",
  headline: "From one frame to an entire campaign.",
  groups: [
    {
      title: "Corporate visuals",
      items: [
        "Corporate photography",
        "Executive headshots",
        "Team photography",
        "Office photography",
        "Corporate films",
        "Brand films",
      ],
      src: IMG("photo-1516035069371-29a1b244cc32", 1400),
    },
    {
      title: "Events",
      items: [
        "Corporate events",
        "Conferences",
        "Award nights",
        "Launch events",
        "Corporate parties",
        "Event photography",
        "Event videography",
        "Aftermovies",
      ],
      src: IMG("photo-1560439514-4e9645039924", 1400),
    },
    {
      title: "Advertising",
      items: [
        "Commercials",
        "Advertising films",
        "Campaign content",
        "Creative production",
        "Social ads",
      ],
      src: IMG("photo-1546435770-a3e426bf472b", 1400),
    },
    {
      title: "Social media",
      items: [
        "Social media strategy",
        "Content planning",
        "Reels",
        "Photography",
        "Short-form video",
        "Monthly content production",
        "Social media management",
      ],
      src: IMG("photo-1478737270239-2f02b77fc618", 1400),
    },
  ],
} as const;

/* 06 — WHY KICKSTART ----------------------------------------------------- */
export const why = {
  headline: ["We do not just create content.", "We create perception."],
  principles: [
    {
      index: "01",
      title: "Strategy",
      body: "We understand what the content needs to achieve before we create it.",
    },
    {
      index: "02",
      title: "Craft",
      body: "We care about lighting, composition, cinematography, editing and detail.",
    },
    {
      index: "03",
      title: "Consistency",
      body: "We create content systems that keep your brand looking strong everywhere.",
    },
  ],
} as const;

/* 07 — CORPORATE HEADSHOTS ----------------------------------------------- */
export const headshots = {
  headline: "Your people are part of your brand.",
  body: "Portraits for founders, executives and teams — as credible as the business they run.",
  tags: ["Founders", "Executives", "Teams", "Leadership portraits"],
  src: IMG("photo-1519085360753-af0119f7cbe7", 1600),
  alt: "An executive portrait lit hard from one side against near-black, arms folded",
} as const;

/* 08 — EVENTS ------------------------------------------------------------ */
export type EventMedia = { src: string; alt: string; video?: string };

export const events = {
  headline: ["The moment ends.", "The content lives on."],
  categories: ["Corporate events", "Conferences", "Launches", "Award nights", "Corporate parties"],
  cta: { label: "Plan event coverage", href: "#contact" },
  /**
   * Swipeable gallery — real coverage, not one placeholder frame. Drop a real
   * clip's URL into `video` on any item (poster stays `src`) and that slide
   * plays footage instead of a photo; empty until then, same convention as
   * `showreel.src` above.
   */
  gallery: [
    {
      src: IMG("photo-1493225457124-a3eb161ffa5f", 900),
      alt: "A figure on stage with arms raised, backlit through smoke at a live event",
      video: "",
    },
    {
      src: IMG("photo-1531058020387-3be344556be6", 900),
      alt: "A full conference hall under arched windows during a keynote",
    },
    {
      src: IMG("photo-1560439514-4e9645039924", 900),
      alt: "A stage set for a corporate award night",
    },
    {
      src: IMG("photo-1519671482749-fd09be7ccebf", 900),
      alt: "Glasses raised in a toast at a corporate evening",
    },
    {
      src: IMG("photo-1505236858219-8359eb29e329", 900),
      alt: "Confetti bursting over a crowd with hands raised at a launch party",
    },
    {
      src: IMG("photo-1511795409834-ef04bbd61622", 900),
      alt: "A long banquet table dressed for an awards dinner",
    },
  ] satisfies EventMedia[],
} as const;

/* 09 — SOCIAL MEDIA ------------------------------------------------------ */
export const social = {
  headline: "Do not let your brand disappear between campaigns.",
  body: "Consistent content systems that keep your brand visible, relevant and recognisable.",
  cta: { label: "Build our social presence", href: "#contact" },
  formats: [
    {
      label: "Reels",
      src: IMG("photo-1502920917128-1aa500764cbd", 900),
      alt: "A camera body on a clean seamless backdrop, shot for a carousel",
    },
    {
      label: "Stories",
      src: IMG("photo-1519671482749-fd09be7ccebf", 900),
      alt: "Glasses raised in a toast at a corporate evening",
    },
    {
      label: "Carousels",
      src: IMG("photo-1572635196237-14b3f281503f", 900),
      alt: "Sunglasses shot flat against a bright seamless backdrop",
    },
    {
      label: "Photography",
      src: IMG("photo-1511795409834-ef04bbd61622", 900),
      alt: "A long banquet table dressed for an awards dinner",
    },
    {
      label: "Campaigns",
      src: IMG("photo-1523275335684-37898b6baf30", 900),
      alt: "Two watches arranged for a product campaign",
    },
    {
      label: "Short-form",
      src: IMG("photo-1485846234645-a62644f84728", 900),
      alt: "A clapperboard marking the top of a take on location",
    },
  ],
} as const;

/* 10 — PROCESS ----------------------------------------------------------- */
export const process = {
  headline: "How we kickstart.",
  steps: [
    { index: "01", title: "Discover", body: "Understand the brand, audience and objective." },
    { index: "02", title: "Define", body: "Create the creative direction." },
    { index: "03", title: "Create", body: "Production, photography, filming and editing." },
    { index: "04", title: "Amplify", body: "Adapt content for social and digital channels." },
    { index: "05", title: "Grow", body: "Analyse, learn and improve." },
  ],
} as const;

/* 11 — CLIENTS ----------------------------------------------------------- */
/** Real clients only. While this is empty the section does not render. */
export const clients: { name: string; logo?: string }[] = [];

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
  label: "About Kickstart",
  headline: "Every frame has to earn its place.",
  body: "A creative production studio for ambitious brands — visual production, advertising and social media, working as one.",
  src: IMG("photo-1531058020387-3be344556be6", 1400),
  alt: "A full hall under arched windows, mid-keynote, shot from the back",
} as const;

/* 14 — FAQ --------------------------------------------------------------- */
export const faq = [
  {
    q: "What type of companies do you work with?",
    a: "Corporates, funded startups, agencies and consumer brands — teams of five or five thousand.",
  },
  {
    q: "Do you travel for shoots and events?",
    a: "Yes — multi-city shoots and events, with travel budgeted transparently upfront.",
  },
  {
    q: "Do you offer monthly social media packages?",
    a: "Yes — retainers covering strategy, production and editing, starting from one production day a month.",
  },
  {
    q: "Can you handle both production and social media?",
    a: "Yes — the same team that shoots your brand film cuts the reels, so campaign and feed come from one shoot.",
  },
  {
    q: "How do we start a project?",
    a: "Send a brief below with what you need and when — you'll get a considered reply, not a discovery call.",
  },
] as const;

/* 15 — CONTACT ------------------------------------------------------------ */
export const form = {
  needs: [
    "Corporate photography",
    "Event coverage",
    "Advertising",
    "Brand film",
    "Social media",
    "Other",
  ],
  timelines: ["ASAP", "This month", "1-3 months", "Just exploring"],
  submit: "Send project brief",
} as const;

/* FOOTER ----------------------------------------------------------------- */
export const footer = {
  services: ["Media production", "Advertising", "Social media"],
  /** The closing marquee. Same words as the footer lists, said out loud. */
  marquee: [
    "Media production",
    "Advertising",
    "Social media",
    "Corporate film",
    "Event coverage",
    "Executive portraits",
    "Brand films",
    "Reels",
  ],
  socials: [
    { label: "Instagram", href: site.instagram },
    { label: "LinkedIn", href: site.linkedin },
    { label: "WhatsApp", href: `https://wa.me/${site.whatsapp}` },
  ],
  copyright: "© 2026 Kickstart Creative Studio Pvt Ltd",
} as const;
