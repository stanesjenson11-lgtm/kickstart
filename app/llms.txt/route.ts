import { buildLlms } from "@/lib/llms";

export const dynamic = "force-static";

export const GET = () => buildLlms(false);
