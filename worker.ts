// `.open-next/worker.js` only exists after `opennextjs-cloudflare build`, so the
// import errors before one and resolves after: expect-error would fail after.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { default as handler } from "./.open-next/worker.js";

type Env = { ASSETS: { fetch: (request: Request | string) => Promise<Response> } };
// Workers runtime global: https://developers.cloudflare.com/workers/runtime-apis/streams/transformstream/
declare const FixedLengthStream: new (length: number) => TransformStream<Uint8Array, Uint8Array>;

/** Video sizes by ETag, so a redeployed file is counted again. */
const sizes = new Map<string, number>();

/**
 * OpenNext's worker, plus byte ranges for the showreel. Workers Static Assets
 * ignores `Range` and always answers with the whole file and a 200. iOS Safari
 * won't start a video from that until every byte has arrived, so on phones and
 * iPads the reel sat black until the viewer had already scrolled past it. With
 * a 206 it starts from the first chunk, as the files are `+faststart`.
 * `run_worker_first` in wrangler.jsonc sends only `*.mp4` here ahead of assets.
 */
const worker = {
  async fetch(request: Request, env: Env, ctx: unknown): Promise<Response> {
    if (!new URL(request.url).pathname.endsWith(".mp4")) return handler.fetch(request, env, ctx);

    const res = await env.ASSETS.fetch(request);
    const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get("range") ?? "");
    const headers = new Headers(res.headers);
    headers.set("Accept-Ranges", "bytes");
    // ponytail: one range, no If-Range. Multi-range asks get the whole file,
    // which the spec allows; video players only ever ask for one.
    if (res.status !== 200 || !res.body || !range || (!range[1] && !range[2])) {
      return new Response(res.body, { status: res.status, headers });
    }

    const size = await sizeOf(res, env, request.url);
    const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
    const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
    if (start > end) {
      res.body.cancel();
      return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
    }

    // A stream of known length is what makes workerd send Content-Length
    // rather than chunk the 206; a header set by hand is dropped.
    headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
    const body = slice(res.body, start, end).pipeThrough(new FixedLengthStream(end - start + 1));
    return new Response(body, { status: 206, headers });
  },
};

export default worker;

/** A 206 has to state the file's total size, and the binding streams bodies
    with no Content-Length, so each file is read through once and remembered. */
async function sizeOf(res: Response, env: Env, url: string) {
  const tag = res.headers.get("etag") ?? url;
  let size = Number(res.headers.get("content-length")) || sizes.get(tag);
  if (!size) {
    const reader = (await env.ASSETS.fetch(url)).body!.getReader();
    size = 0;
    for (let r; !(r = await reader.read()).done; ) size += r.value.byteLength;
    sizes.set(tag, size);
  }
  return size;
}

/** Bytes start..end (inclusive) of a stream, cancelling the rest once passed. */
function slice(body: ReadableStream<Uint8Array>, start: number, end: number) {
  let pos = 0;
  return body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, out) {
        const from = Math.max(start - pos, 0);
        const to = Math.min(end + 1 - pos, chunk.length);
        pos += chunk.length;
        if (from < to) out.enqueue(chunk.subarray(from, to));
        if (pos > end) out.terminate();
      },
    }),
  );
}
