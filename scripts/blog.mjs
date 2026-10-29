// Builds the blog: content/blog/*.md → lib/blog.generated.json, which the pages
// import, so nothing reads the filesystem inside the Worker at runtime.
// Runs before `next dev` and `next build` (and as `npm run check:blog`).
//
// The fact gate is the seo-agent-kit seo-engine's deterministic gate, ported:
// a post that breaks a rule fails the build instead of shipping. Files starting
// with "_" are drafts and are skipped.
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { marked } from "marked";
import { servicePages, cities } from "../lib/content.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const DIR = path.join(ROOT, "content/blog");
const OUT = path.join(ROOT, "lib/blog.generated.json");
const facts = JSON.parse(await readFile(path.join(ROOT, "content/facts.json"), "utf8"));

const REQUIRED = ["title", "description", "date", "updated", "pillar", "keyword"];
const PRICE = /(₹|\bRs\.?\s?|\bINR\s?|\$)\s?\d[\d,.]*/;
const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;

/** `key: value` lines between the opening and closing `---`. */
function frontmatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return [null, src];
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i > 0) data[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"(.*)"$/, "$1");
  }
  return [data, m[2]];
}

const plain = (md) =>
  md
    .replace(LINK, "$1")
    .replace(/^\|?[-:| ]+\|?$/gm, " ")
    .replace(/[#>*_`|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const words = (s) => s.split(/\s+/).filter(Boolean).length;

/** Share of title words two posts have in common: the "distinct intent" guard. */
function overlap(a, b) {
  const t = (s) => new Set(s.toLowerCase().match(/[a-z0-9]+/g));
  const [x, y] = [t(a), t(b)];
  return [...x].filter((w) => y.has(w)).length / Math.min(x.size, y.size);
}

/** The FAQ section: `## Frequently asked questions`, then `### question` + answer. */
function faqOf(md) {
  const at = md.search(/^## Frequently asked questions\s*$/m);
  if (at < 0) return [];
  const rest = md.slice(at).split(/\r?\n/).slice(1).join("\n");
  const end = rest.search(/^## /m);
  return (end < 0 ? rest : rest.slice(0, end))
    .split(/^### /m)
    .slice(1)
    .map((block) => {
      const [q, ...a] = block.split(/\r?\n/);
      return { q: q.trim(), a: plain(a.join(" ")) };
    })
    .filter((f) => f.q && f.a);
}

const files = (await readdir(DIR)).filter((f) => f.endsWith(".md") && !f.startsWith("_"));
const slugs = files.map((f) => f.replace(/\.md$/, ""));
const routes = new Set([
  "/",
  "/blog",
  "/sitemap",
  "/privacy",
  ...servicePages.map((s) => `/services/${s.slug}`),
  ...cities.map((c) => `/${c.slug}`),
  ...slugs.map((s) => `/blog/${s}`),
]);

const errors = [];
const posts = [];

for (const file of files) {
  const slug = file.replace(/\.md$/, "");
  const src = await readFile(path.join(DIR, file), "utf8");
  const [data, md] = frontmatter(src);
  const fail = (msg) => errors.push(`${file}: ${msg}`);

  if (!data) {
    fail("no frontmatter");
    continue;
  }
  for (const k of REQUIRED) if (!data[k]) fail(`frontmatter is missing "${k}"`);
  if (data.description?.length > 160) fail(`description is ${data.description.length} chars (max 160)`);
  if (data.pillar && !servicePages.some((s) => s.slug === data.pillar))
    fail(`pillar "${data.pillar}" is not a service slug`);

  const text = plain(md);
  const lines = md.split(/\r?\n/);
  const faq = faqOf(md);
  const n = words(text);

  if (/[—–]/.test(src)) fail("contains an em or en dash; use a comma, colon or full stop");
  if (n < 700) fail(`${n} words (minimum 700)`);
  const h2 = lines.filter((l) => /^## /.test(l)).length;
  if (h2 < 4) fail(`${h2} H2s (minimum 4)`);
  if (faq.length < 2) fail("needs a '## Frequently asked questions' section with at least 2 '###' questions");

  for (const b of facts.banned) if (text.toLowerCase().includes(b.toLowerCase())) fail(`banned phrase "${b}"`);

  lines.forEach((l, i) => {
    const m = l.match(PRICE);
    if (!m) return;
    const allowed = facts.allowed_prices.some((p) => l.includes(p));
    const cited = /\]\(https?:\/\//.test(l);
    if (!allowed && !cited) fail(`line ${i + 1}: price "${m[0].trim()}" is neither in allowed_prices nor cited with a source link`);
  });

  for (const [, , href] of md.matchAll(LINK)) {
    if (!href.startsWith("/")) continue;
    const route = href.split("#")[0] || "/";
    if (!routes.has(route)) fail(`internal link to ${href}, which is not a page`);
  }

  posts.push({
    slug,
    title: data.title,
    description: data.description,
    date: data.date,
    updated: data.updated,
    pillar: data.pillar,
    keyword: data.keyword,
    words: n,
    minutes: Math.max(1, Math.round(n / 220)),
    faq,
    html: await marked.parse(md, { gfm: true }),
    text,
  });
}

for (let i = 0; i < posts.length; i++)
  for (let j = i + 1; j < posts.length; j++)
    if (overlap(posts[i].title, posts[j].title) > 0.8)
      errors.push(`${posts[i].slug} and ${posts[j].slug}: titles overlap; each post needs its own search intent`);

if (errors.length) {
  console.error(`blog: ${errors.length} problem(s)\n  ${errors.join("\n  ")}`);
  process.exit(1);
}

posts.sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
await writeFile(OUT, JSON.stringify(posts, null, 1) + "\n");
console.log(`blog: ${posts.length} post(s) passed the fact gate`);
