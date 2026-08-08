export type SchemeName =
  | "content"
  | "expressive"
  | "fidelity"
  | "fruitSalad"
  | "monochrome"
  | "neutral"
  | "rainbow"
  | "tonalSpot"
  | "vibrant";

/**
 * Material spec revision. Only `tonalSpot`, `vibrant`, `expressive` and
 * `neutral` honour 2025/2026; every other scheme is forced back to 2021 by the
 * upstream library regardless of what is requested here.
 */
export type SpecVersion = "2021" | "2025" | "2026";

/** A user-supplied brand color layered on top of the generated scheme. */
export interface CustomColor {
  hex: string;
  /** Shift the hue toward the source color so it sits in the same family. */
  harmonize?: boolean;
}

export interface MaterialwindOptions {
  /** Seed color the whole scheme is derived from. Required. */
  source?: string;
  scheme?: SchemeName;
  /** -1 (minimum) to 1 (maximum). 0 is the spec'd design. Clamped. */
  contrast?: number;
  specVersion?: SpecVersion;
  /**
   * How the dark palette is selected.
   * - `"media"` -- `@media (prefers-color-scheme: dark)`
   * - `"class"` -- `.dark`
   * - any other string is used verbatim as a selector.
   */
  darkMode?: "media" | "class" | (string & {});
  /** CSS custom property prefix for the raw token values. */
  prefix?: string;
  /** Default harmonization for custom colors. */
  harmonize?: boolean;
  /** State-layer opacities, as percentages. */
  states?: {
    hover?: number;
    focus?: number;
    press?: number;
    drag?: number;
  };
  /** Transition duration for interactive surfaces, in ms. `false` disables. */
  transition?: number | false;
  /**
   * Extra named colors. Any option key that is not one of the above is also
   * treated as a custom color, so `@plugin "materialwind" { brand: #ff0000; }`
   * works without nesting.
   */
  colors?: Record<string, string | CustomColor>;
  [key: string]: unknown;
}

export interface Palette {
  light: Record<string, string>;
  dark: Record<string, string>;
  /** Token names that have an on-color, in emission order. */
  surfaces: string[];
  /** Resolved on-color token name per surface token. */
  onPairs: Record<string, string>;
}
