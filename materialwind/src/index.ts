import plugin from "tailwindcss/plugin";
import type { Config, PluginCreator } from "tailwindcss/plugin";

import { buildPalette } from "./palette.js";
import type { CustomColor, MaterialwindOptions } from "./types.js";

/**
 * Tailwind does not re-export `PluginWithOptions`, so the shape is declared
 * here. Without an explicit annotation TypeScript tries to name the internal
 * declaration file in the emitted types, which is not portable (TS2742).
 */
export interface MaterialwindPlugin {
  (options?: MaterialwindOptions): { handler: PluginCreator; config?: Partial<Config> };
  __isOptionsFunction: true;
}

export { buildPalette, SCHEME_NAMES } from "./palette.js";
export { ON_PAIRS, TOKENS, kebab } from "./tokens.js";
export type * from "./types.js";

/** Option keys that are configuration rather than custom color names. */
const RESERVED = new Set([
  "source",
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

/** Reads a set of flat option keys into their nested equivalents. */
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

/**
 * Splits the flat option bag coming from `@plugin "materialwind" { ... }` into
 * config and custom colors, so `brand: #ff0000` works as a sibling of `source`.
 */
function splitOptions(options: MaterialwindOptions) {
  const colors: Record<string, string | CustomColor> = { ...(options.colors ?? {}) };
  for (const [key, value] of Object.entries(options)) {
    if (RESERVED.has(key)) continue;
    if (typeof value === "string") colors[key] = value;
    else if (value && typeof value === "object") colors[key] = value as CustomColor;
  }
  return colors;
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

      const palette = buildPalette({
        source: options.source!,
        scheme: options.scheme,
        contrast: options.contrast,
        specVersion: options.specVersion,
        harmonize: options.harmonize,
        colors: splitOptions(options),
      });

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

      // Values map for the surface utilities: every token that has an on-color.
      //
      // Tokens are also registered under a short alias with the redundant
      // "surface" segment dropped, so the natural `surface-container-high`
      // works alongside the literal `surface-surface-container-high`. Aliases
      // are only added when unambiguous.
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

      /**
       * State layers are the M3 way of expressing hover/press/focus: the
       * on-color is mixed into the container color at a fixed opacity.
       *
       * The plain `background-color` is declared first so it stands as the
       * fallback, and the mix is applied inside `@supports` -- otherwise a
       * browser without `color-mix()` would fall back to the *on-color* at full
       * strength, painting the surface with its own text color.
       */
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
    const palette = buildPalette({
      source: options.source!,
      scheme: options.scheme,
      contrast: options.contrast,
      specVersion: options.specVersion,
      harmonize: options.harmonize,
      colors: splitOptions(options),
    });

    // Every token becomes a real Tailwind color pointing at its custom property,
    // so `bg-primary`, `text-on-primary`, `border-outline`, `bg-primary/50` and
    // every other color utility work without overriding a core utility -- which
    // is what broke `bg-[#000000]` in the Tailwind 3 predecessor.
    const colors = Object.fromEntries(
      Object.keys(palette.light).map((name) => [name, `var(--${prefix}-${name})`]),
    );

    return { theme: { extend: { colors } } };
  },
);

export default materialwind;
