import { areaServed, cities, clients, company, servicePages, site } from "@/lib/content";
import { allPosts } from "@/lib/blog";

export const dynamic = "force-static";

/**
 * The studio's entities and how they relate, as one JSON-LD graph: the
 * organisation, its founder, its services, the places it serves and its
 * profiles elsewhere. Not a standard any engine is known to require — the same
 * graph is in each page's JSON-LD — but it gives a crawler or an assistant the
 * whole picture in a single fetch. Built from lib/content.ts so it cannot drift.
 */
export function GET() {
  const u = site.url;
  const profiles = [site.instagram, site.linkedin, ...Object.values(company.profiles)].filter(
    (x): x is string => Boolean(x),
  );
  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": `${u}/#business`,
        name: site.name,
        legalName: site.legalName,
        url: u,
        email: site.email,
        telephone: `+${site.whatsapp}`,
        foundingDate: company.foundedIso,
        address: { "@type": "PostalAddress", addressLocality: "Bengaluru", addressRegion: "Karnataka", addressCountry: "IN" },
        areaServed,
        founder: { "@id": `${u}/#${company.founder.id}` },
        sameAs: profiles,
        knowsAbout: servicePages.map((s) => s.name),
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Services",
          itemListElement: servicePages.map((s) => ({ "@type": "Offer", itemOffered: { "@id": `${u}/services/${s.slug}#service` } })),
        },
      },
      {
        "@type": "Person",
        "@id": `${u}/#${company.founder.id}`,
        name: company.founder.name,
        jobTitle: company.founder.role,
        worksFor: { "@id": `${u}/#business` },
        ...(company.founder.linkedin ? { sameAs: [company.founder.linkedin] } : {}),
      },
      ...servicePages.map((s) => ({
        "@type": "Service",
        "@id": `${u}/services/${s.slug}#service`,
        name: s.name,
        description: s.line,
        url: `${u}/services/${s.slug}`,
        provider: { "@id": `${u}/#business` },
      })),
      ...cities.map((c) => ({ "@type": "WebPage", "@id": `${u}/${c.slug}`, name: c.h1, about: { "@id": `${u}/#business` } })),
      ...allPosts.map((p) => ({
        "@type": "BlogPosting",
        "@id": `${u}/blog/${p.slug}#post`,
        headline: p.title,
        url: `${u}/blog/${p.slug}`,
        dateModified: p.updated,
        about: { "@id": `${u}/services/${p.pillar}#service` },
      })),
      ...clients.map((c) => ({ "@type": "Organization", name: c.name, description: `Client of ${site.name}` })),
    ],
  };
  return Response.json(graph);
}
