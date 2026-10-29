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
  title: "Video Production, Web Design & AI | Bangalore & Coimbatore | Kickstart",
  description:
    "Media production company in Bangalore and Coimbatore: corporate films, ad films, event photography, social media, website design and development, and AI integration.",
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

/** Schema.org areaServed, shared by the business and every service page.
    sameAs pins each name to the one city it means. */
export const areaServed = [
  {
    "@type": "City",
    name: "Bengaluru",
    alternateName: "Bangalore",
    sameAs: "https://en.wikipedia.org/wiki/Bengaluru",
  },
  { "@type": "City", name: "Coimbatore", sameAs: "https://en.wikipedia.org/wiki/Coimbatore" },
  { "@type": "Country", name: "India" },
];

export const nav = {
  links: [
    { label: "Home", href: "#top" },
    { label: "Work", href: "#work" },
    { label: "Services", href: "#services" },
    // menu: the web and software services drop down from it (Nav.tsx).
    { label: "Web & AI", href: "#web", menu: true },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ],
  cta: { label: "Work with Us", href: "#contact" },
} as const;

/* 01 — HERO ------------------------------------------------------------- */
export const hero = {
  headline: ["We make brands", "look remarkable."],
  support:
    "Media production, social media, websites and AI for ambitious brands in Bangalore, Coimbatore and across India.",
  primary: { label: "View our work", href: "#work" },
  secondary: { label: "Work with Us", href: "#contact" },
  disciplines: ["Media production", "Corporate", "Advertising", "Events", "Social"],
  /**
   * The hero renders these as a slow WebGL cross-dissolve montage with film
   * grain, halation and cursor displacement — cinematic motion without a video
   * asset. The footage itself lives in `showreel.sources`.
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
  /**
   * Tried in order: the browser plays the first whose `media` matches and whose
   * `type` it can decode. Phones (under `bar:`) get 720p, touch-first screens —
   * tablets — 1080p, everything else the desktop plate. HEVC comes first in each
   * tier: a third to 40% smaller than the H.264 file behind it at a higher VMAF
   * against the master, and the H.264 file plays where HEVC won't decode.
   * ffmpeg -i master.mp4 -an -vf scale=W:H:flags=lanczos -c:v libx265 -preset slow
   *   -crf C -x265-params keyint=50:vbv-maxrate=R:vbv-bufsize=2R -tag:v hvc1
   *   -movflags +faststart
   * 1920x1080 at C=27, R=6000; 1280x720 at C=31, R=1800 — the phone cap keeps
   * a 4G link ahead of playback. The codec strings carry the levels x265 picked,
   * 4.0 and 3.1, so a device that can't decode them skips to the next source.
   */
  sources: [
    { src: "/showreel-sm-hevc.mp4", type: 'video/mp4; codecs="hvc1.1.6.L93.90"', media: "(max-width: 767px)" },
    { src: "/showreel-sm.mp4", type: "video/mp4", media: "(max-width: 767px)" },
    { src: "/showreel-hevc.mp4", type: 'video/mp4; codecs="hvc1.1.6.L120.90"', media: "(pointer: coarse)" },
    { src: "/showreel.mp4", type: "video/mp4" },
  ],
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

/* 06 — WEBSITES ----------------------------------------------------------- */
export const web = {
  label: "Websites, apps & software",
  headline: "Your website is the first frame.",
  body: "We design and develop websites, online stores, apps and custom software for brands in Bangalore, Coimbatore and across India. Fast, built for search, and filled with photography and film we shoot ourselves.",
  /* The service line beside the mock-up is the `web` group of servicePages below. */
  /** The site in the mock-up is fictional. Stock: Unsplash, Puscas Adryan. */
  mock: {
    src: "/placeholders/web-launch.jpg",
    url: "yourbrand.in",
    brand: "Obsidian",
    links: ["Shop", "Story", "Stockists"],
    headline: ["Bottled", "after dark."],
    cta: "Shop the launch",
  },
} as const;

/* 07 — AI INTEGRATION ------------------------------------------------------ */
export const ai = {
  label: "AI integration",
  headline: "AI that earns its keep.",
  body: "We wire AI into the way your business already works, for teams in Bangalore, Coimbatore and across India: assistants that answer customers, automations that clear the busywork, and content tools run by the crew that shoots your brand.",
  items: [
    {
      title: "Assistants",
      text: "Website and WhatsApp assistants that answer questions, qualify leads and book calls, in your customer's language.",
    },
    {
      title: "Automation",
      text: "Enquiries, invoices and reports moved between the tools you already use, without the copy and paste.",
    },
    {
      title: "Content",
      text: "AI-assisted edits, captions and product imagery, made by the same team that shoots your brand.",
    },
    {
      title: "Custom tools",
      text: "Search and answers built on your own documents, so your team stops digging through folders.",
    },
  ],
  /** Demo transcript: what an assistant on a client's site does with an enquiry. */
  transcript: [
    { who: "Visitor", text: "Can you shoot our product launch in Coimbatore on the 14th?" },
    {
      who: "Assistant",
      text: "Yes, we cover Coimbatore and Bangalore. Roughly how many guests, and do you need photos, film or both?",
    },
    { who: "Visitor", text: "Both. Around 200 guests." },
    { who: "Assistant", text: "Done. Your date, city and headcount are with the team as a brief." },
  ],
  /** What happened behind that last line — a real sequence, so it is ordered. */
  route: ["Brief created", "CRM updated", "Team notified"],
  link: { label: "AI integration services", href: "/services/ai-integration" },
  /** Stock: Unsplash, Denny Müller. Graded to monochrome in the section. */
  bg: "/placeholders/ai-fibre.jpg",
} as const;

/* SERVICE PAGES ------------------------------------------------------------ */
/**
 * One page per search intent, at /services/<slug>. The home page cannot be the
 * best answer to "video production company in Bangalore" and "website design
 * company in Coimbatore" at once; each of these can.
 *
 * Every page's copy is its own: near-identical pages with the service name
 * swapped are what Google demotes as doorways. `image` is the first screen's
 * photograph and `detail` the second's. `short` is the label for the
 * home page's service line. `line` is the one-sentence
 * summary the hub, the home page and llms.txt reuse. `updated` is shown on the
 * page and fed to the sitemap, so change it when the copy changes.
 *
 * Stock (Unsplash): web-desk and svc-software by Mohammad Rahmani, ai-board by
 * Jorge Salvador, svc-mobile by Rami Al-zayat, svc-cloud by Domaintechnik,
 * svc-api by Manuel Luikenga, web-launch by Puscas Adryan, svc-ecommerce by
 * Vitaly Gariev.
 */

export const servicePages = [
  {
    slug: "video-production",
    name: "Video production",
    short: "Video",
    group: "media",
    line: "Corporate films, ad films, event coverage and reels, shot and cut by one crew.",
    metaTitle: "Corporate Video Production Company in Bangalore & Coimbatore | Kickstart",
    description:
      "Corporate films, ad films, brand films, event coverage and reels, produced by Kickstart Creative Studio in Bangalore for brands in Bangalore, Coimbatore and across India.",
    h1: "Video production in Bangalore and Coimbatore.",
    intro:
      "Kickstart is a Bangalore video production company making corporate films, ad films and event coverage for brands in Bangalore, Coimbatore and across India. One crew takes the work from script to final grade, then cuts the reels from the same footage.",
    image: {
      src: "/gallery/conferences/img-8437.webp",
      alt: "A panel on stage seen over the heads of a packed national conference audience",
    },
    detail: {
      src: "/placeholders/services-2.jpg",
      alt: "A video edit on a monitor, clips and audio tracks laid out along the timeline",
    },
    offer: [
      "Corporate films",
      "Ad films & commercials",
      "Brand films",
      "Product videos",
      "Event & conference coverage",
      "Reels & short-form video",
      "Corporate photography & headshots",
    ],
    stack: [],
    updated: "2026-10-27",
  },
  {
    slug: "website-design",
    name: "Website development",
    short: "Websites",
    group: "web",
    line: "Fast, search-ready websites, designed in-house and easy for your team to update.",
    metaTitle: "Website Design & Development Company in Coimbatore & Bangalore | Kickstart",
    description:
      "Custom website design and development for brands in Bangalore, Coimbatore and across India: responsive, fast, search-ready sites on Next.js, Astro or WordPress.",
    h1: "Website design and development in Coimbatore and Bangalore.",
    intro:
      "Kickstart designs and builds websites for brands in Bangalore, Coimbatore and across India. Custom design, not templates, built so pages load fast, rank well and stay easy for your team to update. Because we are also a production studio, your site can launch with photography and film made for it.",
    image: {
      src: "/placeholders/web-desk.jpg",
      alt: "A developer at a desk in a dark room, code across two monitors",
    },
    detail: {
      src: "/placeholders/web-launch.jpg",
      alt: "A dark perfume bottle lit on a stone pedestal, shot for a product launch",
    },
    offer: [
      "Corporate & brand websites",
      "Campaign landing pages",
      "Responsive design for every screen",
      "Content management your team can edit",
      "SEO metadata & structured data",
      "Accessibility & Core Web Vitals",
      "Website redesigns",
    ],
    stack: ["Next.js", "Astro", "React", "Tailwind CSS", "WordPress"],
    updated: "2026-10-27",
  },
  {
    slug: "ecommerce-development",
    name: "E-commerce development",
    short: "E-commerce",
    group: "web",
    line: "Online stores with dependable checkout, payments and an admin your team can run.",
    metaTitle: "E-commerce Website Development Company in Bangalore & Coimbatore | Kickstart",
    description:
      "E-commerce website development in Bangalore and Coimbatore: Shopify, WooCommerce and custom Next.js stores with Indian payment gateways, order management and mobile-first checkout.",
    h1: "E-commerce development in Bangalore and Coimbatore.",
    intro:
      "Kickstart builds online stores for brands in Bangalore, Coimbatore and across India, on Shopify, WooCommerce or a custom Next.js build. You get a catalogue that is easy to browse, a checkout that works on any phone, and an admin your team can run without calling a developer.",
    image: {
      src: "/placeholders/web-launch.jpg",
      alt: "A dark perfume bottle lit on a stone pedestal, shot for a product launch",
    },
    detail: {
      src: "/placeholders/svc-ecommerce.jpg",
      alt: "A shopper at a laptop paying for an order on her phone with a card",
    },
    offer: [
      "Product catalogue & filters",
      "Payment gateway integration",
      "Orders, inventory & invoices",
      "Admin dashboard",
      "Mobile-first checkout",
      "Product photography & video",
    ],
    stack: ["Shopify", "WooCommerce", "Next.js", "Razorpay", "Stripe", "PostgreSQL"],
    updated: "2026-10-27",
  },
  {
    slug: "mobile-app-development",
    name: "Mobile app development",
    short: "Mobile apps",
    group: "web",
    line: "iOS and Android apps from one codebase, designed, built and published to the stores.",
    metaTitle: "Mobile App Development Company in Bangalore & Coimbatore | Kickstart",
    description:
      "iOS and Android app development in Bangalore and Coimbatore: one Flutter or React Native codebase, UI/UX design, API integration, push notifications and store submission.",
    h1: "Mobile app development in Bangalore and Coimbatore.",
    intro:
      "Kickstart builds iOS and Android apps for businesses in Bangalore, Coimbatore and across India, usually from one Flutter or React Native codebase so both platforms ship together. We design the app, build it, connect it to your systems and take it through App Store and Play Store review.",
    image: {
      src: "/placeholders/svc-mobile.jpg",
      alt: "A smartphone lying in the dark, its home screen of apps lit up",
    },
    detail: {
      src: "/placeholders/services-3.jpg",
      alt: "A phone in one hand and a laptop open on a café table",
    },
    offer: [
      "iOS & Android from one codebase",
      "UI/UX design",
      "API & backend integration",
      "Push notifications",
      "App Store & Play Store submission",
      "Fixes and updates after launch",
    ],
    stack: ["Flutter", "React Native", "Swift", "Firebase", "Node.js"],
    updated: "2026-10-27",
  },
  {
    slug: "custom-software-development",
    name: "Custom software & automation",
    short: "Custom software",
    group: "web",
    line: "Web apps, dashboards, CRMs and internal tools built around how your business works.",
    metaTitle: "Custom Software & Web Application Development in Bangalore | Kickstart",
    description:
      "Custom software and web application development in Bangalore and Coimbatore: dashboards, CRMs, client portals, internal tools and automation, built in sprints and fully tested.",
    h1: "Custom software and web apps in Bangalore and Coimbatore.",
    intro:
      "Kickstart builds custom software for businesses in Bangalore, Coimbatore and across India: web applications, dashboards, CRMs, client portals and internal tools that replace spreadsheets and copy-paste. We design the system with you, build it in short sprints and document it so it outlives the project.",
    image: {
      src: "/placeholders/svc-software.jpg",
      alt: "A developer working late at two monitors, a web page on one and code on the other",
    },
    detail: {
      src: "/placeholders/web-desk.jpg",
      alt: "A developer at a desk in a dark room, code across two monitors",
    },
    offer: [
      "Requirements & architecture",
      "Web applications & client portals",
      "Dashboards & CRMs",
      "API & webhook integrations",
      "AI & automation pipelines",
      "QA, testing & documentation",
    ],
    stack: ["React", "Node.js", "Python", "PostgreSQL", "AWS", "OpenAI"],
    updated: "2026-10-27",
  },
  {
    slug: "cloud-devops",
    name: "Cloud & DevOps",
    short: "Cloud & DevOps",
    group: "web",
    line: "Hosting, deployments, monitoring and backups set up so releases are routine.",
    metaTitle: "Cloud & DevOps Services in Bangalore & Coimbatore | Kickstart",
    description:
      "Cloud and DevOps services in Bangalore and Coimbatore: AWS architecture, CI/CD pipelines, Docker and Kubernetes, monitoring, automated backups and security hardening.",
    h1: "Cloud and DevOps in Bangalore and Coimbatore.",
    intro:
      "Kickstart sets up and runs cloud infrastructure for businesses in Bangalore, Coimbatore and across India: hosting, automated deployments, monitoring, backups and access control. The aim is plain: releases that are routine, outages you hear about first, and data you can always restore.",
    image: {
      src: "/placeholders/svc-cloud.jpg",
      alt: "A rack of servers in a dark data centre, status lights glowing green",
    },
    detail: {
      src: "/placeholders/svc-api.jpg",
      alt: "Network cables plugged into the back of a server",
    },
    offer: [
      "Cloud architecture & setup",
      "CI/CD pipelines",
      "Containers & orchestration",
      "Monitoring, logs & alerts",
      "Automated backups & recovery",
      "Security hardening & access control",
    ],
    stack: ["AWS", "Docker", "Kubernetes", "GitHub Actions", "Terraform", "Nginx"],
    updated: "2026-10-27",
  },
  {
    slug: "api-integration",
    name: "API & systems integration",
    short: "API integration",
    group: "web",
    line: "Your CRM, ERP, payments and other tools connected so data moves on its own.",
    metaTitle: "API & Systems Integration Services in Bangalore & Coimbatore | Kickstart",
    description:
      "API development and systems integration in Bangalore and Coimbatore: REST and GraphQL APIs, payment gateways, ERP and CRM sync, webhooks and legacy modernisation.",
    h1: "API and systems integration in Bangalore and Coimbatore.",
    intro:
      "Kickstart connects the systems businesses in Bangalore, Coimbatore and across India already run on: CRMs, ERPs, payment gateways, accounting tools and WhatsApp. We build the APIs and sync jobs between them, so an order, a lead or an invoice is entered once and appears everywhere it should.",
    image: {
      src: "/placeholders/svc-api.jpg",
      alt: "Network cables plugged into the back of a server",
    },
    detail: {
      src: "/placeholders/svc-cloud.jpg",
      alt: "A rack of servers in a dark data centre, status lights glowing green",
    },
    offer: [
      "REST & GraphQL APIs",
      "Payment gateway integration",
      "ERP & CRM data sync",
      "Webhooks & event pipelines",
      "Legacy system modernisation",
      "API documentation & versioning",
    ],
    stack: ["Node.js", "Python", "GraphQL", "REST", "PostgreSQL", "Redis"],
    updated: "2026-10-27",
  },
  {
    slug: "ai-integration",
    name: "AI agents & automation",
    short: "AI agents",
    group: "ai",
    line: "AI agents, chat and voice assistants, and automations wired into the tools you use.",
    metaTitle: "AI Integration, Agents & Automation Company in Bangalore & Coimbatore | Kickstart",
    description:
      "AI integration in Bangalore and Coimbatore: custom AI agents, WhatsApp and website chatbots, AI calling and voice agents, LLM integration with OpenAI and Anthropic, and automated workflows.",
    h1: "AI integration and agents in Bangalore and Coimbatore.",
    intro:
      "Kickstart builds and integrates AI for businesses in Bangalore, Coimbatore and across India: custom agents, website and WhatsApp chatbots, AI calling and voice agents, and automated workflows. We build on established models from OpenAI and Anthropic, connect them to the tools you already use, and monitor them once they are live.",
    image: {
      src: "/placeholders/ai-board.jpg",
      alt: "Close-up of a computer motherboard in black and white",
    },
    detail: {
      src: "/placeholders/ai-fibre.jpg",
      alt: "Strands of fibre-optic light streaming through the dark",
    },
    offer: [
      "Custom AI agents",
      "AI calling & voice agents",
      "Website & WhatsApp chatbots",
      "LLM integration (OpenAI, Anthropic)",
      "Automated workflows & pipelines",
      "AI-assisted content production",
      "Monitoring & tuning",
    ],
    stack: ["OpenAI", "Anthropic", "Python", "Node.js", "LangChain", "Vapi", "ElevenLabs"],
    updated: "2026-10-27",
  },
] as const;

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

/* COMPANY FACTS ------------------------------------------------------------ */
/**
 * Checkable facts only. llms.txt, entitymap.json and the site-wide JSON-LD read
 * them, so a search engine or an AI assistant gets the same answer everywhere.
 * `null` is data the studio has not supplied yet; every consumer leaves those
 * out rather than guess. content/facts.json is the blog's copy of the same truth.
 */
export const company = {
  /* Founded and incorporated the same day: Kickstart Creative Studio Pvt Ltd. */
  founded: "17 March 2026",
  foundedIso: "2026-03-17",
  areas: [
    "Bangalore, where the studio is based",
    "Coimbatore, remotely for web, software and AI, in person for shoots and events",
    "Anywhere in India for shoots and events",
  ],
  founder: {
    name: "Jerry Joshan",
    role: "Founder",
    id: "jerry-joshan",
    // TODO(studio): Jerry's LinkedIn profile URL. Feeds the Person entity's sameAs.
    linkedin: null as string | null,
  },
  // TODO(studio): add each profile once it exists. These are the knowledge-graph links.
  profiles: {
    youtube: null as string | null,
    googleBusiness: null as string | null,
    crunchbase: null as string | null,
    wikidata: null as string | null,
  },
} as const;

/* CITY PAGES --------------------------------------------------------------- */
/**
 * /bangalore and /coimbatore. Honest about where the studio is: Bangalore is
 * home, Coimbatore is served remotely and visited for shoots. Two pages with
 * their own copy, not a service-by-city grid of near-duplicates.
 */
export const cities = [
  {
    slug: "bangalore",
    name: "Bangalore",
    metaTitle: "Video Production, Web Design & AI Company in Bangalore | Kickstart",
    description:
      "Kickstart Creative Studio is a Bangalore media production and technology studio: corporate video, event photography, websites, apps, software and AI integration.",
    h1: "Kickstart in Bangalore.",
    intro:
      "Kickstart Creative Studio is based in Bangalore. From here we shoot corporate films, ads and events, and design and build websites, apps, software and AI tools for companies across the city.",
    paragraphs: [
      "Being in the city means a shoot can be scouted, lit and wrapped without travel days on the invoice, and a website or software project can start with a workshop in your office rather than a video call.",
      "Brands we have worked with include Swiggy, CRED, Hilton, WeWork, Micron, Embassy and Sattva. The work runs from corporate events, conferences and award nights to brand films, headshots and monthly social content.",
      "On the technology side we build websites, online stores, mobile apps, custom software and AI agents for Bangalore teams, and we often pair the two: the site launches with photography and film we shot for it.",
    ],
    image: {
      src: "/gallery/corporate-events/toast-63.webp",
      alt: "A speaker addressing the room from the stage against an illuminated brand wall",
    },
  },
  {
    slug: "coimbatore",
    name: "Coimbatore",
    metaTitle: "Website Design, App Development & AI Company for Coimbatore | Kickstart",
    description:
      "Kickstart builds websites, e-commerce stores, apps, software and AI integrations for Coimbatore businesses, and travels to Coimbatore for corporate video and event shoots.",
    h1: "Kickstart for Coimbatore.",
    intro:
      "Kickstart works with Coimbatore businesses from our Bangalore studio. Websites, online stores, apps, software and AI projects run remotely, and our crew travels to Coimbatore for shoots and events.",
    paragraphs: [
      "Coimbatore's manufacturers, textile and engineering firms, hospitals, colleges and startups need the same things a Bangalore company does: a website that wins enquiries, systems that talk to each other, and video that explains what they make.",
      "Remote does not mean distant. Projects run on scheduled calls, shared boards and working previews you can open on your phone, and we come to Coimbatore when a shoot, an event or a workshop needs us in the room.",
      "Travel for shoots is costed in the quote up front, so there are no surprises after the event. Send a brief with your city, date and budget and the reply starts from there.",
    ],
    image: {
      src: "/gallery/launches/micron-27.webp",
      alt: "Leadership cutting a branded ribbon at the opening of a new facility",
    },
  },
] as const;

/* 14 — FAQ --------------------------------------------------------------- */
export const faq = [
  {
    q: "What type of companies do you work with?",
    a: "Corporates, funded startups, agencies and established consumer brands anyone who needs their visual output to look as considered as the rest of their business. We work with teams of five and teams of five thousand.",
  },
  {
    q: "Which cities do you work in?",
    a: "Bangalore and Coimbatore, and anywhere in India a shoot or event takes us. We budget travel transparently in the quote rather than surfacing it afterwards. Websites and AI projects run remotely, wherever you are.",
  },
  {
    q: "Do you build websites and AI tools too?",
    a: "Yes. Alongside media production we design and develop websites and integrate AI into businesses, so your film, your site and your customer assistant come from one team.",
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
