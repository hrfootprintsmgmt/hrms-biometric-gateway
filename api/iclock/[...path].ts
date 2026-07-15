
export const config = { runtime: "edge" };

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF!;
const ANON_KEY = process.env.SUPABASE_ANON_KEY!;

export default async function handler(req: Request): Promise<Response> {

console.log("=== ICLOCK REQUEST ===");
  console.log({
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries()),
  });

  if (!PROJECT_REF || !ANON_KEY) {
    return new Response("Gateway configuration is missing", { status: 500 });
  }

  const incoming = new URL(req.url);

  // Map /iclock/<anything> and /api/iclock/<anything>
  // to /functions/v1/iclock/<anything>
  const suffix = incoming.pathname.replace(/^\/(?:api\/)?iclock/, "");

  const target = new URL(
    `/functions/v1/iclock${suffix}${incoming.search}`,
    `https://${PROJECT_REF}.supabase.co`
  );

  const headers = new Headers(req.headers);
  headers.set("apikey", ANON_KEY);
  headers.set("Authorization", `Bearer ${ANON_KEY}`);
  headers.delete("host");
  headers.delete("content-length");

  const upstream = await fetch(target, {
    method: req.method,
    headers,
    body:
      req.method === "GET" || req.method === "HEAD"
        ? undefined
        : req.body,
    redirect: "manual",
  });

  const out = new Headers(upstream.headers);
  out.set("Access-Control-Allow-Origin", "*");
  out.set("Cache-Control", "no-store");

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: out,
  });
}