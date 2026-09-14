// Pre-sizes every raster in public/ into public/_img/<path>-<width>.webp, one
// file per loader width, so lib/image-loader.ts never points at a missing file.
// Runs before `next dev` and `next build`; unchanged sources are skipped.
import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { WIDTHS } from "../lib/image-loader.ts";

const PUBLIC = path.resolve(import.meta.dirname, "../public");
const OUT = path.join(PUBLIC, "_img");
const RASTER = /\.(png|jpe?g|webp)$/i;

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (p !== OUT) yield* walk(p);
    } else if (RASTER.test(entry.name) && !entry.name.startsWith("email-")) {
      // email-* stay out: mail clients get the original PNGs inlined.
      yield p;
    }
  }
}

const fresh = (file, since) => stat(file).then((s) => s.mtimeMs >= since, () => false);

let written = 0;
for await (const file of walk(PUBLIC)) {
  const since = (await stat(file)).mtimeMs;
  const base = path.join(OUT, path.relative(PUBLIC, file).replace(/\.[^.]+$/, ""));
  const todo = [];
  for (const w of WIDTHS) if (!(await fresh(`${base}-${w}.webp`, since))) todo.push(w);
  if (!todo.length) continue;

  await mkdir(path.dirname(base), { recursive: true });
  await Promise.all(
    todo.map((w) =>
      sharp(file)
        // Widths past the source reuse its own size: never upscale.
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: 75, alphaQuality: 90 })
        .toFile(`${base}-${w}.webp`),
    ),
  );
  written += todo.length;
}

console.log(`images: ${written} written to public/_img`);
