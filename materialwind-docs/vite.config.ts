import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/** GitHub Pages serves project sites from `/<repo>/`. The deploy workflow sets
 *  BASE_PATH; local dev and custom domains fall back to the root. */
const base = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
});
