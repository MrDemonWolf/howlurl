import { execSync } from "node:child_process";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

/**
 * The commit this build came from. CI passes `GITHUB_SHA`; locally we ask git
 * directly. Empty string when neither works, and the footer simply omits it.
 */
function commitSha(): string {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA;
  try {
    return execSync("git rev-parse HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return "";
  }
}

export default defineConfig({
  root: "web",
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "web/src") } },
  define: { __COMMIT_SHA__: JSON.stringify(commitSha()) },
  build: { outDir: "../dist", emptyOutDir: true },
  // `bun run dev` serves the UI with HMR and forwards /api to `bun run dev:api`.
  server: { proxy: { "/api": "http://localhost:8787" } },
});
