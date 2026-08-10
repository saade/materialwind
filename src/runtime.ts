import { buildPalette } from "./palette.js";
import type { CoreRole, CustomColor, SchemeName, SpecVersion } from "./types.js";

export interface UpdateThemeOptions extends Partial<Record<CoreRole, string>> {
  /** Seed color. Optional when `primary` is given. */
  source?: string;
  scheme?: SchemeName;
  contrast?: number;
  specVersion?: SpecVersion;
  colors?: Record<string, string | CustomColor>;
  harmonize?: boolean;
  darkMode?: "media" | "class" | (string & {});
  prefix?: string;
  /** Where to inject the stylesheet. Defaults to `document.head`. */
  target?: HTMLElement;
}

const STYLESHEET_ID = "materialwind-dynamic-theme";

function block(selector: string, vars: Record<string, string>, prefix: string) {
  const body = Object.entries(vars)
    .map(([name, hex]) => `--${prefix}-${name}:${hex}`)
    .join(";");
  return `${selector}{${body}}`;
}

/**
 * Regenerates the palette and swaps it in by rewriting the custom properties the
 * plugin already emitted -- no rebuild, every utility updates at once.
 *
 * Pulls in the Material color engine, so import it lazily if initial bundle size
 * matters.
 */
export function updateTheme(options: UpdateThemeOptions): string {
  const prefix = options.prefix ?? "mw";
  const palette = buildPalette({
    primary: options.primary,
    secondary: options.secondary,
    tertiary: options.tertiary,
    neutral: options.neutral,
    neutralVariant: options.neutralVariant,
    error: options.error,
    source: options.source,
    scheme: options.scheme,
    contrast: options.contrast,
    specVersion: options.specVersion,
    colors: options.colors,
    harmonize: options.harmonize,
  });

  const darkMode = options.darkMode ?? "media";
  const dark =
    darkMode === "media"
      ? `@media (prefers-color-scheme:dark){${block(":root", palette.dark, prefix)}}`
      : block(darkMode === "class" ? ".dark" : darkMode, palette.dark, prefix);

  const css = block(":root", palette.light, prefix) + dark;

  if (typeof document !== "undefined") {
    let el = document.getElementById(STYLESHEET_ID) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = STYLESHEET_ID;
      (options.target ?? document.head).appendChild(el);
    }
    el.textContent = css;
  }

  return css;
}

export { buildPalette, SCHEME_NAMES } from "./palette.js";
// Re-exported here so browser code can enumerate tokens without importing the
// plugin entry, which pulls in `tailwindcss/plugin`.
export { ON_PAIRS, TOKENS, kebab } from "./tokens.js";
export type * from "./types.js";
