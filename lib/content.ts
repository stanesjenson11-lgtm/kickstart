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
  src: "/showreel.mp4" as string,
  srcSmall: "/showreel-sm.mp4" as string,
  runtime: "00:00:33:00",
  roll: "A001_KS_REEL",
} as const;

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

/* 09 — EVENT GALLERY ----------------------------------------------------- */
/** Real client work. Category order matches `events.categories` — this section
 *  is that list, shown rather than named. Photos live in `public/gallery/<slug>`,
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

export const contact = {
  headline: "Contact us",
  bg: IMG("photo-1531058020387-3be344556be6", 2400),
  alt: "",
} as const;

export const form = {
  submit: "Submit form",
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
