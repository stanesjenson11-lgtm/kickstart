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
  keywords: [
    "creative production studio",
    "corporate photography",
    "corporate headshots",
    "corporate event photography",
    "corporate videography",
    "advertising production",
    "social media marketing",
    "brand content",
    "event videography",
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
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: site.legalName,
  alternateName: site.name,
  url: site.url,
  email: site.email,
  description: site.description,
  foundingDate: "2025-08",
  areaServed: "IN",
  serviceType: [
    "Corporate photography",
    "Corporate videography",
    "Corporate headshots",
    "Event photography",
    "Advertising production",
    "Brand films",
    "Social media marketing",
  ],
  sameAs: [site.instagram, site.linkedin],
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
