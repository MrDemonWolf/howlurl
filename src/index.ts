import { generate, normalizeBaseDomain } from "./generator";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      // A name is picked fresh per request; caching it anywhere would be a bug.
      "cache-control": "no-store",
    },
  });
}

export default {
  fetch(request: Request, env: Env): Response {
    // Static assets are served before the Worker runs, so anything reaching
    // here is a miss. Only /api/generate is ours.
    if (new URL(request.url).pathname !== "/api/generate") {
      return json({ error: "Not found" }, 404);
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      return json({ error: "Method not allowed" }, 405);
    }

    let baseDomain: string;
    try {
      baseDomain = normalizeBaseDomain(env.BASE_DOMAIN);
    } catch {
      // Log the fact, never the value.
      console.error("BASE_DOMAIN is missing or invalid");
      return json({ error: "Server misconfigured: BASE_DOMAIN" }, 500);
    }

    return json(generate(baseDomain));
  },
} satisfies ExportedHandler<Env>;
