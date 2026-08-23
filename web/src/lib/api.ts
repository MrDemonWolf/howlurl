export interface GeneratedName {
  first: string;
  second: string;
  number: number;
  hostname: string;
  url: string;
}

export async function fetchName(signal?: AbortSignal): Promise<GeneratedName> {
  const res = await fetch("/api/generate", { cache: "no-store", signal });
  if (!res.ok) throw new Error(`Generator returned ${res.status}`);
  return (await res.json()) as GeneratedName;
}

/**
 * Copy with a fallback for browsers, insecure origins, and permission denials
 * where the async clipboard is unavailable. Returns false when the caller must
 * tell the user to press the copy shortcut themselves.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Ignored: fall through to the selection-based path below.
  }

  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.cssText = "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
  document.body.appendChild(field);
  field.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  document.body.removeChild(field);
  return ok;
}
