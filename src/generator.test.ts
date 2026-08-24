import { describe, expect, it } from "vitest";
import worker from "./index";
import {
  FIRST_WORDS,
  MAX_NUMBER,
  MIN_NUMBER,
  SECOND_WORDS,
  generate,
  normalizeBaseDomain,
  randomInt,
} from "./generator";

describe("normalizeBaseDomain", () => {
  it.each([
    ["mrdemonwolf.dev", "mrdemonwolf.dev"],
    ["https://x.dev/path?q=1", "x.dev"],
    ["  .X.DEV.  ", "x.dev"],
    ["http://a.b.c.dev", "a.b.c.dev"],
  ])("normalizes %j -> %j", (input, expected) => {
    expect(normalizeBaseDomain(input)).toBe(expected);
  });

  it.each([undefined, null, "", "   ", "nodot", "-bad.dev", "bad-.dev", "a..b", "https://"])(
    "rejects %j",
    (input) => {
      expect(() => normalizeBaseDomain(input as string)).toThrow();
    },
  );
});

describe("randomInt", () => {
  it("stays in range and covers both ends", () => {
    const seen = new Set<number>();
    for (let i = 0; i < 2000; i++) {
      const n = randomInt(0, 3);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThanOrEqual(3);
      seen.add(n);
    }
    expect(seen.size).toBe(4);
  });
});

describe("generate", () => {
  it("produces a well-formed hostname from the curated words", () => {
    for (let i = 0; i < 1000; i++) {
      const r = generate("example.test");
      expect(r.hostname).toMatch(/^[a-z]+-[a-z]+-\d{3}\.example\.test$/);
      expect(FIRST_WORDS).toContain(r.first);
      expect(SECOND_WORDS).toContain(r.second);
      expect(r.number).toBeGreaterThanOrEqual(MIN_NUMBER);
      expect(r.number).toBeLessThanOrEqual(MAX_NUMBER);
      expect(r.hostname).toBe(`${r.first}-${r.second}-${r.number}.example.test`);
      expect(r.url).toBe(`https://${r.hostname}`);
    }
  });

  it("does not keep returning the same name", () => {
    const names = new Set(Array.from({ length: 50 }, () => generate("example.test").hostname));
    expect(names.size).toBeGreaterThan(1);
  });
});

const call = (path: string, env: { BASE_DOMAIN?: string }, method = "GET") =>
  worker.fetch(new Request(`https://howlurl.test${path}`, { method }), env as Env);

describe("worker", () => {
  it("serves a generated name with no-store", async () => {
    const res = await call("/api/generate", { BASE_DOMAIN: "example.test" });
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    const body = (await res.json()) as { hostname: string };
    expect(body.hostname).toMatch(/\.example\.test$/);
  });

  it("fails loudly when BASE_DOMAIN is unusable, without leaking it", async () => {
    for (const env of [{}, { BASE_DOMAIN: "nope" }]) {
      const res = await call("/api/generate", env);
      expect(res.status).toBe(500);
      expect(await res.text()).not.toContain("nope");
    }
  });

  it("404s anything else and rejects non-GET", async () => {
    expect((await call("/anything", { BASE_DOMAIN: "example.test" })).status).toBe(404);
    expect((await call("/api/generate", { BASE_DOMAIN: "example.test" }, "POST")).status).toBe(405);
  });
});
