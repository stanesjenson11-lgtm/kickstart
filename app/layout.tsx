import type { Metadata, Viewport } from "next";
import { Archivo, Martian_Mono } from "next/font/google";
import { areaServed, company, servicePages, site } from "@/lib/content";
import { alternates, ldJson } from "@/lib/utils";
import "./globals.css";

/* Archivo carries a width axis (62–125). Headlines gain scale from width
   rather than from oversized font-size — see DESIGN.md. */
const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

/* Slate metadata only: roll numbers, timecode, indices. Never body copy. */
const martian = Martian_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-martian",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  keywords: [
    "media production company Bangalore",
    "media production company Coimbatore",
    "video production company Bangalore",
    "video production company Coimbatore",
    "corporate video production",
    "website design company Coimbatore",
    "website design company Bangalore",
    "web development company Coimbatore",
    "AI integration company Bangalore",
    "AI integration company Coimbatore",
    "corporate photography",
    "corporate event photography",
    "social media marketing",
  ],
  alternates: alternates("/"),
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title: site.title,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description,
  },
  /* Snippets unlimited and large image previews: answer engines and rich results
     may quote and show as much of a page as they like. */
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 },
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
  /* Pinch-zoom stays available. Capping maximumScale or clearing userScalable
     takes zoom away from anyone who needs it to read the page — a WCAG 1.4.4
     failure, and what Lighthouse flags on this element. */
  initialScale: 1,
};

/* WebSite is what Google reads for the site name shown above the result;
   the business entry carries the logo and the brand's other profiles. */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      name: site.name,
      alternateName: "Kickstart",
      url: site.url,
      publisher: { "@id": `${site.url}/#business` },
    },
    {
      "@type": "ProfessionalService",
      "@id": `${site.url}/#business`,
      name: site.name,
      legalName: site.legalName,
      alternateName: "Kickstart",
      url: site.url,
      logo: `${site.url}/logo-black.png`,
      image: `${site.url}/opengraph-image`,
      email: site.email,
      telephone: `+${site.whatsapp}`,
      description: site.description,
      founder: { "@id": `${site.url}/#${company.founder.id}` },
      foundingDate: company.foundedIso,
      // Locality only: the studio works from Bangalore. A street address goes
      // here once it matches the Google Business Profile exactly.
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bengaluru",
        addressRegion: "Karnataka",
        addressCountry: "IN",
      },
      areaServed,
      serviceType: [
        "Video production",
        "Corporate photography",
        "Corporate headshots",
        "Event photography",
        "Advertising production",
        "Brand films",
        "Social media marketing",
        ...servicePages.filter((p) => p.group !== "media").map((p) => p.name),
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Services",
        itemListElement: servicePages.map((p) => ({
          "@type": "Offer",
          itemOffered: { "@id": `${site.url}/services/${p.slug}#service`, "@type": "Service", name: p.name },
        })),
      },
      // Every profile elsewhere: the knowledge-graph links. Bare-domain
      // placeholders and the empty company.profiles slots (YouTube, Google
      // Business, Crunchbase, Wikidata) are skipped until they hold real URLs.
      sameAs: [site.instagram, site.linkedin, ...Object.values(company.profiles)].filter(
        (u): u is string => !!u && new URL(u).pathname.length > 1,
      ),
    },
    // The founder, so `founder` above and the blog's author box resolve to a
    // real entity. His LinkedIn joins sameAs once company.founder.linkedin is set.
    {
      "@type": "Person",
      "@id": `${site.url}/#${company.founder.id}`,
      name: company.founder.name,
      jobTitle: company.founder.role,
      image: `${site.url}/jerry-joshan.png`,
      worksFor: { "@id": `${site.url}/#business` },
      ...(company.founder.linkedin ? { sameAs: [company.founder.linkedin] } : {}),
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${archivo.variable} ${martian.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[var(--z-loader)] focus:bg-paper focus:px-4 focus:py-2 focus:text-ink u-meta"
        >
          Skip to content
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={ldJson(jsonLd)}
        />
      </body>
    </html>
  );
}
