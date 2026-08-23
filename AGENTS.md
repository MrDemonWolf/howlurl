# HowlURL — agent rules

HowlURL suggests memorable temporary preview hostnames like
`lunar-pack-482.mrdemonwolf.dev`: two curated wolf words plus a random three-digit number, with the
suffix read from the `BASE_DOMAIN` Worker binding.

## Hard rules

- **It generates names. It provisions nothing.** No DNS writes, no Cloudflare/cPanel/WordPress API
  calls, no certificates, no reservation of any kind. Anything that needs a privileged credential
  belongs in a separate, authenticated service — not here.
- **Never claim a name is unique, reserved, or live.** Nothing is stored server-side. 20 x 20 x 900
  = 360,000 combinations, and collisions follow the birthday problem.
- **No database, auth, analytics, KV, R2, D1, Durable Objects, or queue.** If a change seems to need
  one, that is the signal to stop and ask.
- **`BASE_DOMAIN` is public config, not a secret** — a plaintext `var` in `wrangler.jsonc` is
  correct. The only secret in the project is `CLOUDFLARE_API_TOKEN`, which lives in GitHub Actions
  secrets. Never put a Cloudflare token in client code or in git.
- **Fail loudly on bad config.** A missing or invalid `BASE_DOMAIN` returns 500. It must never fall
  back to a hard-coded production domain, and the invalid value must never be logged or returned.

## Shape

| Path | What it is |
| --- | --- |
| `src/generator.ts` | Word lists, domain normalization, unbiased random. Pure — no Worker globals. |
| `src/index.ts` | The Worker. One route: `GET /api/generate`, always `Cache-Control: no-store`. |
| `src/generator.test.ts` | Vitest, Node environment. Covers the generator and the Worker handler. |
| `web/` | React 19 + Vite + Tailwind v4 + shadcn/ui single screen. Built to `dist/`. |
| `wrangler.jsonc` | Worker config. `assets.directory` is `./dist`, so build before deploy. |

Static assets are served before the Worker runs, so the Worker only ever sees `/api/generate` and
genuine misses.

## Commands

```bash
bun run dev        # Vite with HMR on :5173, /api proxied to :8787
bun run dev:api    # wrangler dev on :8787 (run alongside `dev`)
bun run preview    # build, then serve the real thing through wrangler
bun run typecheck  # worker tsconfig + web tsconfig
bun run test       # vitest
bun run deploy     # build, then wrangler deploy
```

## Deployment

The app is served from `howlurl.mrdemonwolf.com`; generated names point at `mrdemonwolf.dev`, whose
`*` wildcard routes previews to the hosting origin. Different zones, so the app's own hostname can
never collide with the wildcard. The custom domain is declared in `wrangler.jsonc` `routes` with
`custom_domain: true` — `wrangler deploy` creates the DNS record itself. There is no Terraform.
