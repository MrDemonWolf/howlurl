const KEY = "howlurl:recent";
export const HISTORY_LIMIT = 5;

/** localStorage can throw (private mode, blocked storage). Never let it break generation. */
export function readHistory(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string").slice(0, HISTORY_LIMIT);
  } catch {
    return [];
  }
}

export function pushHistory(hostname: string, current: string[]): string[] {
  const next = [hostname, ...current.filter((h) => h !== hostname)].slice(0, HISTORY_LIMIT);
  writeHistory(next);
  return next;
}

export function writeHistory(next: string[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Nothing to do: history is a nicety, not a feature the app depends on.
  }
}
