import type { Metadata, Viewport } from "next";
import { Archivo, Martian_Mono } from "next/font/google";
import { site } from "@/lib/content";
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
  // ponytail: Google ignores meta keywords; rankings come from the visible copy and title.
  keywords: [
    "Kickstart Creative Studio",
    "media company",
    "media production company",
    "digital marketing agency",
    "event management company",
    "corporate event management",
    "corporate photography",
    "corporate videography",
    "advertising production",
    "social media marketing",
  ],
  alternates: { canonical: "/" },
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
  robots: { index: true, follow: true },
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
/* The registered name in full, as people search it. The page itself keeps
   site.legalName's "Pvt Ltd". */
const LEGAL_NAME = "Kickstart Creative Studio Private Limited";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      name: site.name,
      alternateName: ["Kickstart", "Kickstart Creative", LEGAL_NAME],
      url: site.url,
      publisher: { "@id": `${site.url}/#business` },
    },
    {
      "@type": "ProfessionalService",
      "@id": `${site.url}/#business`,
      name: site.name,
      legalName: LEGAL_NAME,
      alternateName: ["Kickstart", "Kickstart Creative", site.legalName],
      url: site.url,
      logo: `${site.url}/logo-black.png`,
      image: `${site.url}/opengraph-image`,
      email: site.email,
      telephone: `+${site.whatsapp}`,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Bengaluru",
        addressRegion: "Karnataka",
        addressCountry: "IN",
      },
      description: site.description,
      founder: { "@type": "Person", name: "Jerry Joshan" },
      foundingDate: "2025-08",
      areaServed: "IN",
      serviceType: [
        "Media production",
        "Video production",
        "Digital marketing",
        "Event management",
        "Corporate event management",
        "Corporate photography",
        "Corporate videography",
        "Corporate headshots",
        "Event photography",
        "Advertising production",
        "Brand films",
        "Social media marketing",
      ],
      // ponytail: skips the bare instagram.com/linkedin.com placeholders in
      // lib/content.ts; real profile URLs there flow in with no change here.
      sameAs: [site.instagram, site.linkedin].filter((u) => new URL(u).pathname.length > 1),
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
