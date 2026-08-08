import {
  Blend,
  DynamicScheme,
  Hct,
  MaterialDynamicColors,
  SchemeContent,
  SchemeExpressive,
  SchemeFidelity,
  SchemeFruitSalad,
  SchemeMonochrome,
  SchemeNeutral,
  SchemeRainbow,
  SchemeTonalSpot,
  SchemeVibrant,
  TonalPalette,
  argbFromHex,
  hexFromArgb,
} from "@material/material-color-utilities";

import { ON_PAIRS, TOKENS, kebab } from "./tokens.js";
import type { CustomColor, Palette, SchemeName, SpecVersion } from "./types.js";

type SchemeCtor = new (
  source: Hct,
  isDark: boolean,
  contrastLevel: number,
  specVersion?: SpecVersion,
) => DynamicScheme;

const SCHEMES: Record<SchemeName, SchemeCtor> = {
  content: SchemeContent as SchemeCtor,
  expressive: SchemeExpressive as SchemeCtor,
  fidelity: SchemeFidelity as SchemeCtor,
  fruitSalad: SchemeFruitSalad as SchemeCtor,
  monochrome: SchemeMonochrome as SchemeCtor,
  neutral: SchemeNeutral as SchemeCtor,
  rainbow: SchemeRainbow as SchemeCtor,
  tonalSpot: SchemeTonalSpot as SchemeCtor,
  vibrant: SchemeVibrant as SchemeCtor,
};

export const SCHEME_NAMES = Object.keys(SCHEMES) as SchemeName[];

/**
 * Tones for a custom color group, per the M3 custom-color recipe.
 * We build these directly instead of using the library's `customColor()` helper,
 * which lives in `theme_utils` and transitively pulls in DOM/canvas image code.
 */
const CUSTOM_TONES = {
  light: { color: 40, onColor: 100, container: 90, onContainer: 10 },
  dark: { color: 80, onColor: 20, container: 30, onContainer: 90 },
} as const;

export interface BuildPaletteOptions {
  source: string;
  scheme?: SchemeName;
  contrast?: number;
  specVersion?: SpecVersion;
  colors?: Record<string, string | CustomColor>;
  harmonize?: boolean;
}

export function buildPalette({
  source,
  scheme = "tonalSpot",
  contrast = 0,
  specVersion = "2021",
  colors = {},
  harmonize = true,
}: BuildPaletteOptions): Palette {
  if (!source) throw new Error("materialwind: a `source` color is required.");

  const Scheme = SCHEMES[scheme];
  if (!Scheme) {
    throw new Error(
      `materialwind: unknown scheme "${scheme}". Expected one of: ${SCHEME_NAMES.join(", ")}.`,
    );
  }

  const sourceArgb = argbFromHex(source);
  const sourceHct = Hct.fromInt(sourceArgb);
  const level = Math.max(-1, Math.min(1, contrast));

  const light: Record<string, string> = {};
  const dark: Record<string, string> = {};

  for (const [isDark, out] of [
    [false, light],
    [true, dark],
  ] as const) {
    const s = new Scheme(sourceHct, isDark, level, specVersion);
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
