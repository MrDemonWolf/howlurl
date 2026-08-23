# HowlURL - Memorable Preview Domain Names

HowlURL is a small Cloudflare Worker that suggests memorable temporary
preview hostnames: two curated wolf-themed words and a random three-digit
number, joined to a base domain. It exists because
`test4-final-FINAL.mrdemonwolf.dev` is impossible to say out loud, and
because a preview site deserves a name you can read to somebody over a
call.

It suggests names. It provisions nothing.

Name the pack before you build the den.

## Features

- **Speakable names** - `lunar-pack-482.mrdemonwolf.dev` instead of a
  timestamp or a hash.
- **Runtime base domain** - the suffix comes from the `BASE_DOMAIN` Worker
  binding, so it changes without touching code.
- **Cryptographically random** - Web Crypto with rejection sampling, no
  modulo bias and no timestamp seeding.
- **One screen, no clutter** - a large result, three obvious actions, and
  nothing to configure.
- **Copy hostname or full URL** - with a selection-based fallback when the
  Clipboard API is unavailable.
- **On-device history** - the last five names live in `localStorage` and
  nowhere else.
- **Honest about what it is not** - the UI never claims a name is
  reserved, unique, or live.
- **No stored data** - no database, no accounts, no analytics, no cookies.

## Getting Started

1. Clone the repository and install dependencies with `bun install`.
2. Start the Worker with `bun run dev:api` in one terminal.
3. Start the UI with `bun run dev` in another, then open the address Vite
   prints.
4. A name is generated as soon as the page loads. Press **Generate
   another** for a new one.
5. Create the matching hostname in cPanel before you use it. HowlURL does
   not do that for you.

## Usage

The web interface is the main way to use HowlURL. The Worker also exposes
a single endpoint:

```bash
curl https://howlurl.mrdemonwolf.com/api/generate
```

```json
{
  "first": "lunar",
  "second": "pack",
  "number": 482,
  "hostname": "lunar-pack-482.mrdemonwolf.dev",
  "url": "https://lunar-pack-482.mrdemonwolf.dev"
}
```

Responses always carry `Cache-Control: no-store`. A missing or invalid
`BASE_DOMAIN` returns `500` rather than falling back to a hard-coded
domain.

### Making a generated name live

1. The wildcard DNS record already points every unclaimed subdomain at the
   hosting origin, so nothing needs adding in Cloudflare.
2. In cPanel, add the hostname as a domain with its own document root.
3. Install or copy the site into that document root, then issue the
   certificate.
4. Names are guessable, so if a preview must stay private put Cloudflare
   Access or cPanel basic auth on that hostname. The name itself is not a
   secret.

## Tech Stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Runtime    | Cloudflare Workers                  |
| Language   | TypeScript                          |
| Frontend   | React 19, Vite 7                    |
| Styling    | Tailwind CSS v4, shadcn/ui          |
| Icons      | Lucide                              |
| Static     | Cloudflare Workers Static Assets    |
| Tests      | Vitest                              |
| Tooling    | Bun, Wrangler                       |
| CI         | GitHub Actions                      |

## Development

### Prerequisites

- Bun 1.3 or newer
- Node.js 20 or newer (Wrangler and Vite run on it)
- A Cloudflare account, for deployment only

### Setup

1. Clone the repository.

   ```bash
   git clone https://github.com/MrDemonWolf/howlurl.git
   cd howlurl
   ```

2. Install dependencies.

   ```bash
   bun install
   ```

3. Generate the Worker binding types.

   ```bash
   bun run cf-typegen
   ```

4. Run the UI and the Worker side by side.

   ```bash
   bun run dev:api
   ```

   ```bash
   bun run dev
   ```

### Development Scripts

- `bun run dev` - Vite dev server with HMR, proxying `/api` to port 8787.
- `bun run dev:api` - `wrangler dev` on port 8787.
- `bun run build` - build the client into `dist/`.
- `bun run preview` - build, then serve the real thing through Wrangler.
- `bun run deploy` - build, then `wrangler deploy`.
- `bun run typecheck` - type-check the Worker and the web app.
- `bun run test` - run the Vitest suite.
- `bun run cf-typegen` - regenerate `worker-configuration.d.ts` from
  `wrangler.jsonc`.

### Code Quality

- TypeScript in strict mode, with `noUncheckedIndexedAccess`, across two
  project configs so Worker and DOM globals never mix.
- Vitest covers domain normalization, random distribution, name format,
  and every Worker response path.
- CI runs type-check, tests, build, and `wrangler deploy --dry-run` on
  every push and pull request.
- Accessibility is part of the definition of done: visible focus rings, a
  live region for announcements, a 320-pixel layout, and reduced-motion
  support.

## Project Structure

```text
howlurl/
├── src/                    Cloudflare Worker
│   ├── generator.ts        word lists, domain normalization, random
│   ├── index.ts            the single /api/generate route
│   └── generator.test.ts   Vitest suite
├── web/                    React single-page interface
│   ├── index.html
│   └── src/
│       ├── App.tsx         the whole screen
│       ├── components/ui/  shadcn/ui components
│       └── lib/            fetch, clipboard, on-device history
├── dist/                   built assets served by the Worker
├── wrangler.jsonc          Worker config, bindings, custom domain
├── vite.config.ts
└── AGENTS.md               project rules
```

## License

![GitHub license](https://img.shields.io/github/license/mrdemonwolf/howlurl.svg?style=for-the-badge&logo=github)

Released under the MIT License. See `LICENSE` for the full text.

## Contact

Questions, ideas, or a better wolf word? Open an issue on the repository
or come say hello.

- Discord: [Join my server](https://mrdwolf.net/discord)
- Website: [mrdemonwolf.com](https://www.mrdemonwolf.com)

Made with love by [MrDemonWolf, Inc.](https://www.mrdemonwolf.com)
