import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Scoped to tests/, otherwise the default glob also picks up test files in
    // any unrelated checkout sitting beside this one in the working directory.
    include: ["tests/**/*.test.ts"],
    // @material/material-color-utilities@0.4.0 ships extensionless relative
    // imports that Node's ESM resolver rejects. Inlining makes Vite resolve
    // them, matching how the published bundle handles it (see tsup.config.ts).
    server: { deps: { inline: ["@material/material-color-utilities"] } },
  },
});
