export const config = { runtime: "edge" };

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF ?? "erjqikaafyefaujyzrax";
const ANON_KEY = process.env.SUPABASE_ANON_KEY!;

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  const targetPath = url.pathname.replace(/^\/iclock/, "/functions/v1/iclock");
  const target = new URL(targetPath + url.search, `https://${PROJECT_REF}.supabase.co`);

  const headers = new Headers(req.headers);
  headers.set("apikey", ANON_KEY);
  headers.delete("host");

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: "follow"
  };

  if (["POST","PUT","PATCH"].includes(req.method)) {
    init.body = req.body;
    (init as any).duplex = "half";
  }

  return fetch(target.toString(), init);
}