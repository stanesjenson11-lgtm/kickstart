// default open-next.config.ts file created by @opennextjs/cloudflare
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// ponytail: no incremental cache — every page but /api/brief is static. Add the
// R2 cache (https://opennext.js.org/cloudflare/caching) if ISR/revalidate lands.
export default defineCloudflareConfig({});
