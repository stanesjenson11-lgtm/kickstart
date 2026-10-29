// default open-next.config.ts file created by @opennextjs/cloudflare
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

/**
 * Every page but /api/brief is prerendered at build, and none revalidates, so
 * the read-only static-assets cache is the right one: the Worker answers a page
 * from the HTML built for it instead of rendering it again on every request
 * (they were all `x-nextjs-cache: MISS`, 0.25–1.4 s to first byte). Cache
 * interception lets it do that before loading the Next server at all.
 * Switch to the R2 cache (https://opennext.js.org/cloudflare/caching) if ISR
 * or revalidate ever lands; this one cannot write.
 */
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
