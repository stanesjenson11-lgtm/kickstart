import { cities, clients, company, servicePages, site } from "@/lib/content";
import { allPosts } from "@/lib/blog";

/**
 * llms.txt (https://llmstxt.org): a plain-text map of the site for AI
 * assistants, generated from the same content as the pages so it never drifts.
 * `full` adds every service page's detail and every post's text — that is
 * /llms-full.txt, for assistants that want the whole thing in one fetch.
 */
export function buildLlms(full: boolean) {
  const u = site.url;
  const out = [
    `# ${site.name}`,
    "",
    `> ${site.legalName} is a media production and technology studio based in Bangalore (Bengaluru), India, founded by ${company.founder.name} on ${company.founded}. It makes corporate films, ad films, event coverage, photography and social media content, and builds websites, e-commerce stores, mobile apps, custom software, cloud infrastructure, API integrations and AI agents for businesses in Bangalore, Coimbatore and across India.`,
    "",
    `Areas served: ${company.areas.join("; ")}.`,
    `Clients include ${clients.map((c) => c.name).join(", ")}.`,
    "",
    "## Services",
    "",
    ...servicePages.map((p) => `- [${p.name}](${u}/services/${p.slug}): ${p.line}`),
    "",
    "## Cities",
    "",
    ...cities.map((c) => `- [${c.name}](${u}/${c.slug}): ${c.intro}`),
    "",
    "## Blog",
    "",
    ...allPosts.map((p) => `- [${p.title}](${u}/blog/${p.slug}): ${p.description}`),
    "",
    "## Company",
    "",
    `- [Send a project brief](${u}/#contact)`,
    `- Email: ${site.email}`,
    `- WhatsApp: +${site.whatsapp}`,
    `- Instagram: ${site.instagram}`,
    `- LinkedIn: ${site.linkedin}`,
    "",
  ];

  if (full) {
    for (const p of servicePages) {
      out.push(`## ${p.h1}`, "", `Source: ${u}/services/${p.slug}`, "", p.intro, "");
      out.push(`Includes: ${p.offer.join("; ")}.`);
      if (p.stack.length) out.push(`Built with: ${p.stack.join(", ")}.`);
      out.push("");
    }
    for (const p of allPosts) {
      out.push(`## ${p.title}`, "", `Source: ${u}/blog/${p.slug} (updated ${p.updated})`, "", p.text, "");
    }
  }

  return new Response(out.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
