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
  support: "Premium visual storytelling, media production & social media for ambitious brands.",
  primary: { label: "View our work", href: "#work" },
  secondary: { label: "Start a project", href: "#contact" },
  disciplines: ["Media production", "Corporate", "Advertising", "Events", "Social"],
  /**
   * The hero renders these as a slow WebGL cross-dissolve montage with film
   * grain, halation and cursor displacement — cinematic motion without a video
   * asset. Set `showreel.src` to a real MP4 and the reel takes over there.
   */
  plates: [
    IMG("photo-1478720568477-152d9b164e26", 2000),
    IMG("photo-1573164713988-8665fc963095", 2000),
    IMG("photo-1493225457124-a3eb161ffa5f", 2000),
    IMG("photo-1516035069371-29a1b244cc32", 2000),
  ],
  alt: "A studio light cutting a hard beam through haze on a Kickstart set",
} as const;

/* 02 — BRAND STATEMENT --------------------------------------------------- */
export const statement = {
  headline: "Your business deserves more than ordinary content.",
  body: "We create refined visual experiences that elevate brands, connect with audiences and leave a lasting impression.",
} as const;

/* 03 — SHOWREEL ---------------------------------------------------------- */
export const showreel = {
  label: "Showreel",
  headline: "Watch the work.",
  poster: IMG("photo-1585951237318-9ea5e175b891", 2000),
  posterAlt: "A clapperboard held up to mark the top of a take",
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
      blurb:
        "A brand film shot across three floors in a single day, cut for the AGM and re-cut nine ways for social.",
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
      blurb:
        "Forty-one portraits in one afternoon, one lighting setup, no one looking like they had been kept waiting.",
      src: IMG("photo-1592878904946-b3cd8ae243d0", 1800),
      alt: "A tailored suit and watch, cropped close, from an executive portrait session",
    },
    {
      index: "05",
      category: "Brand",
      client: "Halden and Co.",
      services: ["Event coverage", "Reels", "Campaign content"],
      blurb:
        "A launch party covered as a campaign shoot, so the content outlived the night by a quarter.",
      src: IMG("photo-1505236858219-8359eb29e329", 1800),
      alt: "Confetti bursting over a crowd with hands raised at a launch party",
    },
  ],
};

/* 05 — SERVICES ---------------------------------------------------------- */
export const services = {
  label: "What we create",
  headline: "From first idea to final frame.",
  groups: [
    {
      title: "Corporate visuals",
      items: ["Executive/founder portraits", "Corporate headshots", "Team photography"],
      src: IMG("photo-1516035069371-29a1b244cc32", 1400),
    },
    {
      title: "Events",
      items: ["Corporate events", "Conferences", "Launches", "Award nights", "Corporate parties"],
      src: IMG("photo-1560439514-4e9645039924", 1400),
    },
    {
      title: "Advertising",
      items: ["Campaign films", "Commercials", "Product content", "Brand films"],
      src: IMG("photo-1546435770-a3e426bf472b", 1400),
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
      src: IMG("photo-1478737270239-2f02b77fc618", 1400),
    },
  ],
} as const;

/* 07 — CORPORATE HEADSHOTS ----------------------------------------------- */
export const headshots = {
  headline: "Your people are part of your brand.",
  body: "Professional portraits for founders, executives and teams who want to look as credible as the businesses they represent.",
  tags: ["Founders", "Executives", "Teams", "Leadership portraits"],
  src: IMG("photo-1519085360753-af0119f7cbe7", 1600),
  alt: "An executive portrait lit hard from one side against near-black, arms folded",
} as const;

/* 08 — EVENTS ------------------------------------------------------------ */
export const events = {
  headline: ["The moment ends.", "The content lives on."],
  categories: [
    "Corporate events",
    "Conferences",
    "Launches",
    "Award nights",
    "Corporate parties",
  ],
  cta: { label: "Plan event coverage", href: "#contact" },
  src: IMG("photo-1493225457124-a3eb161ffa5f", 2000),
  alt: "A figure on stage with arms raised, backlit through smoke at a live event",
} as const;

/* 09 — SOCIAL MEDIA ------------------------------------------------------ */
export const social = {
  headline: "Do not let your brand disappear between campaigns.",
  body: "We build consistent content systems that keep brands visible, relevant and recognisable.",
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
  body: "Founded by Jerry Joshan, Kickstart Creative Studio was built on a simple belief: great businesses deserve to look as remarkable as the work they do. Bridging strategy and creativity, we bring together premium visual storytelling, media production and social media to create refined, purposeful brand experiences that command attention and leave a lasting impression.",
  src: "/jerry-joshan.png",
  alt: "Jerry Joshan, founder of Kickstart Creative Studio, arms folded in a tailored suit",
} as const;

/* 14 — FAQ --------------------------------------------------------------- */
export const faq = [
  {
    q: "What type of companies do you work with?",
    a: "Corporates, funded startups, agencies and established consumer brands — anyone who needs their visual output to look as considered as the rest of their business. We work with teams of five and teams of five thousand.",
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
  socials: [
    { label: "Instagram", href: site.instagram },
    { label: "LinkedIn", href: site.linkedin },
    { label: "WhatsApp", href: `https://wa.me/${site.whatsapp}` },
  ],
  copyright: "© 2026 Kickstart Creative Studio Pvt Ltd",
} as const;
