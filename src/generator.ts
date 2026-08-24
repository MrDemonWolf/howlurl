/**
 * Pure name generation. No Worker or DOM globals beyond Web Crypto, so this
 * runs identically in the Worker, in Node, and in tests.
 */

/**
 * Curated, lowercase-ASCII wolf words. 20 x 20 x 900 numbers = 360,000 possible
 * names. Nothing reserves a name, so repeats follow the birthday problem: a
 * collision becomes likely somewhere around 700 names, which is why the UI never
 * claims a name is unique or available.
 *
 * ponytail: growing the space means adding words here, not adding storage.
 */
export const FIRST_WORDS = [
  "amber",
  "arctic",
  "aurora",
  "boreal",
  "cinder",
  "dusk",
  "ember",
  "frost",
  "glacier",
  "hollow",
  "lunar",
  "midnight",
  "moonlit",
  "quiet",
  "shadow",
  "silver",
  "solstice",
  "storm",
  "timber",
  "winter",
] as const;

export const SECOND_WORDS = [
  "cairn",
  "den",
  "fang",
  "glade",
  "howl",
  "hunt",
  "moon",
  "muzzle",
  "pack",
  "paw",
  "pelt",
  "pine",
  "ridge",
  "roamer",
  "scout",
  "tail",
  "thicket",
  "trail",
  "tundra",
  "wolf",
] as const;

export const MIN_NUMBER = 100;
export const MAX_NUMBER = 999;

export interface GeneratedName {
  first: string;
  second: string;
  number: number;
  hostname: string;
  url: string;
}

/** A hostname label: no leading/trailing hyphen, 1-63 chars. */
const LABEL = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

/**
 * Turn whatever `BASE_DOMAIN` holds into a bare, lowercase domain.
 *
 * Throws on anything that is not a plausible multi-label domain. Deliberately
 * no fallback: a misconfigured Worker must fail loudly rather than quietly
 * printing somebody else's domain.
 */
export function normalizeBaseDomain(raw: string | undefined | null): string {
  const trimmed = (raw ?? "").trim().toLowerCase();
  const withoutScheme = trimmed.replace(/^[a-z][a-z0-9+.-]*:\/\//, "");
  const host = withoutScheme.split(/[/?#]/, 1)[0] ?? "";
  const bare = host.replace(/^\.+/, "").replace(/\.+$/, "");

  const labels = bare.split(".");
  if (labels.length < 2 || bare.length > 253 || !labels.every((l) => LABEL.test(l))) {
    throw new Error("BASE_DOMAIN is not a valid domain");
  }
  return bare;
}

/** Uniform integer in [min, max] via rejection sampling — no modulo bias. */
export function randomInt(min: number, max: number): number {
  const range = max - min + 1;
  const limit = Math.floor(0xffffffff / range) * range;
  const buf = new Uint32Array(1);
  let value: number;
  do {
    crypto.getRandomValues(buf);
    value = buf[0] as number;
  } while (value >= limit);
  return min + (value % range);
}

function pick<T>(list: readonly T[]): T {
  return list[randomInt(0, list.length - 1)] as T;
}

export function generate(baseDomain: string): GeneratedName {
  const first = pick(FIRST_WORDS);
  const second = pick(SECOND_WORDS);
  const number = randomInt(MIN_NUMBER, MAX_NUMBER);
  const hostname = `${first}-${second}-${number}.${baseDomain}`;
  return { first, second, number, hostname, url: `https://${hostname}` };
}
