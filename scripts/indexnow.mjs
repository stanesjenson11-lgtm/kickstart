// Tells IndexNow (Bing, which feeds ChatGPT search and Copilot, plus Yandex,
// Seznam and Naver) that every URL in the live sitemap may have changed.
// Runs after `npm run deploy`; run it by hand with `node scripts/indexnow.mjs`.
// The key is the 32-hex-character file in public/, served at /<key>.txt, which
// is how the engines check the ping really came from this site.
import { readdir } from "node:fs/promises";
import path from "node:path";

const SITE = "https://kickstartcreativestudio.com";
const pub = path.resolve(import.meta.dirname, "../public");
const keyFile = (await readdir(pub)).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) throw new Error("indexnow: no <32-hex>.txt key file in public/");
const key = keyFile.slice(0, -4);

const xml = await (await fetch(`${SITE}/sitemap.xml`)).text();
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!urlList.length) throw new Error("indexnow: the live sitemap listed no URLs");

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({ host: new URL(SITE).host, key, keyLocation: `${SITE}/${keyFile}`, urlList }),
});
// 200 and 202 both mean accepted; 403 means the key file is not live yet.
console.log(`indexnow: ${res.status} for ${urlList.length} URLs`);
if (!res.ok) process.exitCode = 1;
