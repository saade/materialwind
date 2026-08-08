import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/runtime.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  target: "node18",
  // @material/material-color-utilities@0.4.0 ships extensionless relative
  // imports (e.g. `from '../dynamiccolor/dynamic_scheme'`), which Node's ESM
  // resolver rejects outright. Bundling it rewrites those specifiers, so
  // consumers never hit the broken resolution. It is a devDependency for
  // exactly this reason -- it must not be resolved at consumer runtime.
  noExternal: ["@material/material-color-utilities"],
  external: ["tailwindcss", "tailwindcss/plugin"],
});
