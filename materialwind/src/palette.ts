import {
  Blend,
  DynamicScheme,
  Hct,
  MaterialDynamicColors,
  TonalPalette,
  Variant,
  argbFromHex,
  hexFromArgb,
} from "@material/material-color-utilities";

import { ON_PAIRS, TOKENS, kebab } from "./tokens.js";
import type { CoreRole, CustomColor, Palette, SchemeName, SpecVersion } from "./types.js";

/**
 * Schemes are built by constructing `DynamicScheme` with a variant rather than
 * using the `Scheme*` subclasses, because only the former accepts tonal palette
 * overrides -- which is what lets a caller pin `primary`, `secondary` etc.
 *
 * `tests/palette.test.ts` asserts this produces byte-identical output to the
 * subclasses across every scheme, mode and contrast level.
 */
const SCHEMES: Record<SchemeName, Variant> = {
  content: Variant.CONTENT,
  expressive: Variant.EXPRESSIVE,
  fidelity: Variant.FIDELITY,
  fruitSalad: Variant.FRUIT_SALAD,
  monochrome: Variant.MONOCHROME,
  neutral: Variant.NEUTRAL,
  rainbow: Variant.RAINBOW,
  tonalSpot: Variant.TONAL_SPOT,
  vibrant: Variant.VIBRANT,
};

export const SCHEME_NAMES = Object.keys(SCHEMES) as SchemeName[];

/** The tonal palettes a caller may pin directly. */
export const CORE_ROLES: CoreRole[] = [
  "primary",
  "secondary",
  "tertiary",
  "neutral",
  "neutralVariant",
  "error",
];

/**
 * Tones for a custom color group, per the M3 custom-color recipe.
 * We build these directly instead of using the library's `customColor()` helper,
 * which lives in `theme_utils` and transitively pulls in DOM/canvas image code.
 */
const CUSTOM_TONES = {
  light: { color: 40, onColor: 100, container: 90, onContainer: 10 },
  dark: { color: 80, onColor: 20, container: 30, onContainer: 90 },
} as const;

export interface BuildPaletteOptions extends Partial<Record<CoreRole, string>> {
  /** Seed color. Optional when `primary` is given, which then seeds the scheme. */
  source?: string;
  scheme?: SchemeName;
  contrast?: number;
  specVersion?: SpecVersion;
  colors?: Record<string, string | CustomColor>;
  harmonize?: boolean;
}

export function buildPalette(options: BuildPaletteOptions): Palette {
  const {
    source,
    scheme = "tonalSpot",
    contrast = 0,
    specVersion = "2021",
    colors = {},
    harmonize = true,
  } = options;

  // `primary` doubles as the seed when no explicit source is given, so the
  // common case is just `{ primary: "#506546" }`.
  const seed = source || options.primary;
  if (!seed) {
    throw new Error("materialwind: a `source` or `primary` color is required.");
  }

  const variant = SCHEMES[scheme];
  if (variant === undefined) {
    throw new Error(
      `materialwind: unknown scheme "${scheme}". Expected one of: ${SCHEME_NAMES.join(", ")}.`,
    );
  }

  const sourceArgb = argbFromHex(seed);
  const sourceHct = Hct.fromInt(sourceArgb);
  const level = Math.max(-1, Math.min(1, contrast));
  const common = { sourceColorHct: sourceHct, variant, contrastLevel: level, specVersion };

  // A pinned core color contributes its hue, but takes chroma from the scheme
  // it is joining. Letting an arbitrary hex bring its own chroma is what makes
  // hand-picked palettes look garish and blows the contrast guarantees.
  const base = new DynamicScheme({ ...common, isDark: false });
  const chromaFor = (role: CoreRole) =>
    role === "neutral"
      ? base.neutralPalette.chroma
      : role === "neutralVariant"
        ? base.neutralVariantPalette.chroma
        : base.primaryPalette.chroma;

  const overrides: Record<string, TonalPalette> = {};
  for (const role of CORE_ROLES) {
    const hex = options[role];
    if (!hex) continue;
    const hct = Hct.fromInt(argbFromHex(hex));
    overrides[`${role}Palette`] = TonalPalette.fromHueAndChroma(hct.hue, chromaFor(role));
  }

  const light: Record<string, string> = {};
  const dark: Record<string, string> = {};

  for (const [isDark, out] of [
    [false, light],
    [true, dark],
  ] as const) {
    const s = new DynamicScheme({ ...common, isDark, ...overrides });
    const mdc = new MaterialDynamicColors();
    for (const token of TOKENS) {
      const dynamicColor = mdc[token]();
      // `*Dim` tokens are undefined before the 2025 spec.
      if (!dynamicColor) continue;
      out[kebab(token)] = hexFromArgb(dynamicColor.getArgb(s));
    }
  }

  const surfaces: string[] = [];
  const onPairs: Record<string, string> = {};
  for (const token of TOKENS) {
    const on = ON_PAIRS[token];
    if (!on) continue;
    const name = kebab(token);
    if (!(name in light)) continue;
    surfaces.push(name);
    onPairs[name] = kebab(on);
  }

  for (const [rawName, value] of Object.entries(colors)) {
    const spec: CustomColor = typeof value === "string" ? { hex: value } : value;
    const name = kebab(rawName);
    const blend = spec.harmonize ?? harmonize;

    let argb = argbFromHex(spec.hex);
    if (blend) argb = Blend.harmonize(argb, sourceArgb);
    const tones = TonalPalette.fromInt(argb);

    for (const [mode, out] of [
      ["light", light],
      ["dark", dark],
    ] as const) {
      const t = CUSTOM_TONES[mode];
      out[name] = hexFromArgb(tones.tone(t.color));
      out[`on-${name}`] = hexFromArgb(tones.tone(t.onColor));
      out[`${name}-container`] = hexFromArgb(tones.tone(t.container));
      out[`on-${name}-container`] = hexFromArgb(tones.tone(t.onContainer));
    }

    surfaces.push(name, `${name}-container`);
    onPairs[name] = `on-${name}`;
    onPairs[`${name}-container`] = `on-${name}-container`;
  }

  return { light, dark, surfaces, onPairs };
}
