import { defineConfig } from "vitest/config";

// Separate from vite.config.ts, whose root is `web/` (the browser app). Tests
// cover the Worker in `src/`, which needs no plugins and no DOM.
export default defineConfig({
  test: { include: ["src/**/*.test.ts"], environment: "node" },
});
