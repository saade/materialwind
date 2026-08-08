import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // @material/material-color-utilities@0.4.0 ships extensionless relative
    // imports that Node's ESM resolver rejects. Inlining makes Vite resolve
    // them, matching how the published bundle handles it (see tsup.config.ts).
    server: { deps: { inline: ["@material/material-color-utilities"] } },
  },
});
