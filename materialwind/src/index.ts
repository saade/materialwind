import plugin from "tailwindcss/plugin";
import type { Config, PluginCreator } from "tailwindcss/plugin";

import { CORE_ROLES, buildPalette } from "./palette.js";
import type { BuildPaletteOptions } from "./palette.js";
import type { CustomColor, MaterialwindOptions } from "./types.js";

/** Declared locally: Tailwind does not re-export `PluginWithOptions`, and
 *  inferring it makes the emitted types reference an internal file (TS2742). */
export interface MaterialwindPlugin {
  (options?: MaterialwindOptions): { handler: PluginCreator; config?: Partial<Config> };
  __isOptionsFunction: true;
}

export { CORE_ROLES, buildPalette, SCHEME_NAMES } from "./palette.js";
export { ON_PAIRS, TOKENS, kebab } from "./tokens.js";
export type * from "./types.js";

/** Option keys that are configuration rather than custom color names. */
const RESERVED = new Set([
  "source",
  // Core roles pin a tonal palette instead of adding a new color.
  ...CORE_ROLES,
  "scheme",
  "contrast",
  "specVersion",
  "darkMode",
  "prefix",
  "harmonize",
  "states",
  "stateHover",
  "stateFocus",
  "statePress",
  "stateDrag",
  "transition",
  "colors",
]);

const DEFAULT_STATES = { hover: 8, focus: 12, press: 12, drag: 16 };

function pick(
  options: MaterialwindOptions,
  mapping: Record<string, string>,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [from, to] of Object.entries(mapping)) {
    const value = options[from];
    if (value !== undefined) out[to] = Number(value);
  }
  return out;
}

function darkSelector(darkMode: string): string | null {
  if (darkMode === "media") return null;
  if (darkMode === "class") return ".dark";
  return darkMode;
}

/** Any non-reserved key is a custom color, so `brand: #ff0000` can sit
 *  alongside `source` in a flat `@plugin` block. */
function splitOptions(options: MaterialwindOptions) {
  const colors: Record<string, string | CustomColor> = { ...(options.colors ?? {}) };
  for (const [key, value] of Object.entries(options)) {
    if (RESERVED.has(key)) continue;
    if (typeof value === "string") colors[key] = value;
    else if (value && typeof value === "object") colors[key] = value as CustomColor;
  }
  return colors;
}

/** Shared by the handler and the config half so the two can never disagree. */
function paletteOptions(options: MaterialwindOptions): BuildPaletteOptions {
  const core: Partial<Record<string, string>> = {};
  for (const role of CORE_ROLES) {
    const value = options[role];
    if (typeof value === "string") core[role] = value;
  }

  return {
    ...core,
    source: options.source,
    scheme: options.scheme,
    contrast: options.contrast,
    specVersion: options.specVersion,
    harmonize: options.harmonize,
    colors: splitOptions(options),
  };
}

export const materialwind: MaterialwindPlugin = plugin.withOptions<MaterialwindOptions>(
  (options = {}) =>
    ({ addBase, matchUtilities }) => {
      const prefix = options.prefix ?? "mw";
      // A `@plugin` options block is flat, so the nested `states` object is only
      // reachable from a JS config. `stateHover` and friends are the flat spelling.
      const states = {
        ...DEFAULT_STATES,
        ...(options.states ?? {}),
        ...pick(options, {
          stateHover: "hover",
          stateFocus: "focus",
          statePress: "press",
          stateDrag: "drag",
        }),
      };
      const transition = options.transition === undefined ? 150 : options.transition;

      const palette = buildPalette(paletteOptions(options));

      const v = (name: string) => `--${prefix}-${name}`;

      const lightVars: Record<string, string> = {};
      const darkVars: Record<string, string> = {};
      for (const [name, hex] of Object.entries(palette.light)) lightVars[v(name)] = hex;
      for (const [name, hex] of Object.entries(palette.dark)) darkVars[v(name)] = hex;

      const selector = darkSelector(options.darkMode ?? "media");
      addBase({
        ":root": lightVars,
        ...(selector
          ? { [selector]: darkVars }
          : { "@media (prefers-color-scheme: dark)": { ":root": darkVars } }),
      });

      // Also registered under an alias with the redundant "surface" segment
      // dropped, so `surface-container-high` works as well as the literal
      // `surface-surface-container-high`. Only added when unambiguous.
      const values: Record<string, string> = {};
      for (const name of palette.surfaces) values[name] = name;

      for (const name of palette.surfaces) {
        const alias =
          name === "surface"
            ? "DEFAULT"
            : name
                .split("-")
                .filter((part) => part !== "surface")
                .join("-");
        if (!alias || alias in values) continue;
        values[alias] = name;
      }

      const base = (name: string) => ({
        "background-color": `var(${v(name)})`,
        color: `var(${v(palette.onPairs[name]!)})`,
      });

      /** The mix is scoped to `@supports` so the plain background stays the
       *  fallback. Otherwise a browser without `color-mix()` paints the surface
       *  with its own on-color. */
      const stateLayer = (name: string, amount: string) => ({
        [`@supports (color: color-mix(in lab, red, red))`]: {
          "background-color": `color-mix(in oklab, var(${v(palette.onPairs[name]!)}) ${amount}, var(${v(name)}))`,
        },
      });

      matchUtilities(
        {
          surface: (name: string) => base(name),

          interactive: (name: string) => ({
            ...base(name),
            ...(transition === false
              ? {}
              : {
                  "transition-property": "background-color, color",
                  "transition-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)",
                  "transition-duration": `${transition}ms`,
                }),
            "&:hover": stateLayer(name, `${states.hover}%`),
            "&:focus-visible": stateLayer(name, `${states.focus}%`),
            "&:active": stateLayer(name, `${states.press}%`),
          }),

          dragged: (name: string) => ({
            ...base(name),
            ...stateLayer(name, `${states.drag}%`),
          }),
        },
        { values },
      );
    },

  (options = {}) => {
    const prefix = options.prefix ?? "mw";
    const palette = buildPalette(paletteOptions(options));

    // Plain Tailwind colors pointing at custom properties, so no core utility is
    // overridden. Registering a second generator under `bg` would make every
    // arbitrary `bg-[...]` ambiguous and Tailwind would emit nothing.
    const colors = Object.fromEntries(
      Object.keys(palette.light).map((name) => [name, `var(--${prefix}-${name})`]),
    );

    return { theme: { extend: { colors } } };
  },
);

export default materialwind;
