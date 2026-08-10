import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/runtime.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  target: "node18",
  // @material/material-color-utilities@0.4.0 ships extensionless relative imports
  // that Node's ESM resolver rejects. Bundling rewrites them, so consumers never
  // hit it -- which is also why it is a devDependency, not a dependency.
  noExternal: ["@material/material-color-utilities"],
  external: ["tailwindcss", "tailwindcss/plugin"],
});
