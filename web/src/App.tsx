import { Check, Copy, Link2, Moon, RotateCw, Trash2, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type GeneratedName, copyText, fetchName } from "@/lib/api";
import { HISTORY_LIMIT, pushHistory, readHistory, writeHistory } from "@/lib/history";

const REPO_URL = "https://github.com/MrDemonWolf/howlurl";

export function App() {
  const [name, setName] = useState<GeneratedName | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);
  const [recent, setRecent] = useState<string[]>(() => readHistory());
  const [copied, setCopied] = useState<"hostname" | "url" | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const generate = useCallback(async () => {
    setBusy(true);
    setCopied(null);
    try {
      const next = await fetchName();
      setName(next);
      setError(null);
      setRecent((current) => pushHistory(next.hostname, current));
      setAnnouncement(`New name: ${next.hostname}`);
    } catch {
      setError("Could not reach the generator. Try again in a moment.");
      setAnnouncement("Could not reach the generator.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void generate();
  }, [generate]);

  const copy = useCallback(async (value: string, kind: "hostname" | "url") => {
    const ok = await copyText(value);
    setCopied(ok ? kind : null);
    setAnnouncement(
      ok ? `Copied ${value}` : "Copy failed. The text is selected — press Ctrl or Command + C.",
    );
    if (ok) window.setTimeout(() => setCopied(null), 2000);
  }, []);

  const clearHistory = useCallback(() => {
    writeHistory([]);
    setRecent([]);
    setAnnouncement("Recent names cleared.");
  }, []);

  return (
    <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-16">
      <header className="flex flex-col gap-4">
        <Badge className="self-start">
          <Moon aria-hidden className="size-3 text-amber" />
          preview domain names
        </Badge>
        <h1 className="font-display text-5xl leading-[0.95] font-semibold tracking-tight text-white sm:text-7xl">
          Howl<span className="text-amber">URL</span>
        </h1>
        <p className="max-w-md text-balance-pretty text-base leading-relaxed text-muted">
          Two wolf-themed words. One random number. A preview domain you can actually say out loud.
        </p>
      </header>

      <main className="flex flex-col gap-8">
        <Card className="overflow-hidden">
          {/* A thin moonlit seam across the top edge of the card. */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-moon/70 to-transparent"
          />
          <CardContent className="flex flex-col gap-6 p-6 sm:p-8">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted">
              your preview domain
            </p>

            <div className="min-h-24">
              {/* Keyed so every new name remounts and replays the rise-in. */}
              <p
                key={name?.hostname ?? error ?? "loading"}
                className="animate-rise font-mono text-2xl leading-tight [overflow-wrap:anywhere] text-white sm:text-4xl"
              >
                {error ? (
                  <span className="text-xl text-amber sm:text-2xl">{error}</span>
                ) : name ? (
                  <>
                    <span className="text-moon/60">https://</span>
                    {name.first}-{name.second}-{name.number}
                    <span className="text-muted">
                      .{name.hostname.split(".").slice(1).join(".")}
                    </span>
                  </>
                ) : (
                  <span className="text-muted">summoning the pack…</span>
                )}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={() => void generate()} disabled={busy}>
                <RotateCw aria-hidden className={busy ? "animate-spin motion-reduce:animate-none" : ""} />
                Generate another
              </Button>
              <Button
                variant="outline"
                disabled={!name}
                onClick={() => name && void copy(name.hostname, "hostname")}
              >
                {copied === "hostname" ? <Check aria-hidden className="text-amber" /> : <Copy aria-hidden />}
                Copy hostname
              </Button>
              <Button
                variant="outline"
                disabled={!name}
                onClick={() => name && void copy(name.url, "url")}
              >
                {copied === "url" ? <Check aria-hidden className="text-amber" /> : <Link2 aria-hidden />}
                Copy URL
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="flex items-start gap-3 rounded-2xl border border-amber/25 bg-amber/[0.06] p-4 text-sm leading-relaxed text-silver">
          <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-amber" />
          <span>
            This reserves nothing. The name is only a suggestion until you create the matching
            hostname in cPanel.
          </span>
        </p>

        <details className="group rounded-2xl border border-hairline bg-surface/50 p-5">
          <summary className="cursor-pointer list-none font-display text-lg text-white outline-none marker:hidden focus-visible:ring-2 focus-visible:ring-moon focus-visible:ring-offset-4 focus-visible:ring-offset-midnight">
            How to make it live
            <span aria-hidden className="ml-2 text-muted transition-transform group-open:hidden">
              +
            </span>
            <span aria-hidden className="ml-2 hidden text-muted group-open:inline">
              −
            </span>
          </summary>
          <ol className="mt-4 flex list-decimal flex-col gap-2 pl-5 text-sm leading-relaxed text-muted">
            <li>
              The wildcard DNS record already points every unclaimed subdomain at the hosting
              origin, so nothing needs adding in Cloudflare.
            </li>
            <li>In cPanel, add the hostname as a domain and point it at its own document root.</li>
            <li>Install or copy the site into that document root, then issue the certificate.</li>
            <li>
              Names are guessable, so if a preview must stay private put Cloudflare Access or cPanel
              basic auth on that hostname — the name itself is not a secret.
            </li>
          </ol>
        </details>

        {recent.length > 0 && (
          <section aria-labelledby="recent-heading" className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-4">
              <h2
                id="recent-heading"
                className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted"
              >
                last {HISTORY_LIMIT} on this device
              </h2>
              <Button variant="ghost" size="sm" onClick={clearHistory}>
                <Trash2 aria-hidden />
                Clear history
              </Button>
            </div>
            <ul className="flex flex-col divide-y divide-hairline rounded-2xl border border-hairline bg-surface/40">
              {recent.map((hostname) => (
                <li key={hostname} className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="font-mono text-sm [overflow-wrap:anywhere] text-silver">{hostname}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void copy(hostname, "hostname")}
                    aria-label={`Copy ${hostname}`}
                  >
                    <Copy aria-hidden />
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <footer className="mt-auto border-t border-hairline pt-6 text-sm text-muted">
        <p>
          HowlURL by{" "}
          <a
            href="https://www.mrdemonwolf.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-silver underline-offset-4 hover:underline"
          >
            MrDemonWolf, Inc.
          </a>
          {__COMMIT_SHA__ ? (
            <>
              {" · built from "}
              <a
                href={`${REPO_URL}/commit/${__COMMIT_SHA__}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-silver underline-offset-4 hover:underline"
              >
                {__COMMIT_SHA__.slice(0, 7)}
              </a>
            </>
          ) : null}
        </p>
      </footer>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
