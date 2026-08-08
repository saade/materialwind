/**
 * The complete Material Design 3 dynamic-color token set.
 *
 * Each entry is the name of a zero-argument accessor on a `MaterialDynamicColors`
 * instance. The list is explicit rather than reflected so that the emitted token
 * set is deterministic and typed -- `tests/tokens.test.ts` asserts it stays in
 * sync with the library, so a token added upstream fails the build instead of
 * silently going missing.
 *
 * Note this is deliberately NOT driven off `MaterialDynamicColors#allColors`,
 * which omits `surfaceVariant`, `shadow`, `scrim`, `surfaceTint` and every
 * palette key color.
 */
export const TOKENS = [
  // Palette key colors
  "primaryPaletteKeyColor",
  "secondaryPaletteKeyColor",
  "tertiaryPaletteKeyColor",
  "neutralPaletteKeyColor",
  "neutralVariantPaletteKeyColor",
  "errorPaletteKeyColor",

  // Surfaces
  "background",
  "onBackground",
  "surface",
  "surfaceDim",
  "surfaceBright",
  "surfaceContainerLowest",
  "surfaceContainerLow",
  "surfaceContainer",
  "surfaceContainerHigh",
  "surfaceContainerHighest",
  "onSurface",
  "surfaceVariant",
  "onSurfaceVariant",
  "outline",
  "outlineVariant",
  "inverseSurface",
  "inverseOnSurface",
  "shadow",
  "scrim",
  "surfaceTint",

  // Primary
  "primary",
  "primaryDim",
  "onPrimary",
  "primaryContainer",
  "onPrimaryContainer",
  "inversePrimary",
  "primaryFixed",
  "primaryFixedDim",
  "onPrimaryFixed",
  "onPrimaryFixedVariant",

  // Secondary
  "secondary",
  "secondaryDim",
  "onSecondary",
  "secondaryContainer",
  "onSecondaryContainer",
  "secondaryFixed",
  "secondaryFixedDim",
  "onSecondaryFixed",
  "onSecondaryFixedVariant",

  // Tertiary
  "tertiary",
  "tertiaryDim",
  "onTertiary",
  "tertiaryContainer",
  "onTertiaryContainer",
  "tertiaryFixed",
  "tertiaryFixedDim",
  "onTertiaryFixed",
  "onTertiaryFixedVariant",

  // Error
  "error",
  "errorDim",
  "onError",
  "errorContainer",
  "onErrorContainer",
] as const;

export type Token = (typeof TOKENS)[number];

/**
 * Maps a container token to the token that should be used for content placed on
 * top of it. Drives `surface-*` / `interactive-*` and the state-layer overlay
 * color -- only tokens listed here get those utilities.
 */
export const ON_PAIRS: Record<string, string> = {
  background: "onBackground",

  surface: "onSurface",
  surfaceDim: "onSurface",
  surfaceBright: "onSurface",
  surfaceContainerLowest: "onSurface",
  surfaceContainerLow: "onSurface",
  surfaceContainer: "onSurface",
  surfaceContainerHigh: "onSurface",
  surfaceContainerHighest: "onSurface",
  surfaceVariant: "onSurfaceVariant",
  inverseSurface: "inverseOnSurface",

  primary: "onPrimary",
  primaryDim: "onPrimary",
  primaryContainer: "onPrimaryContainer",
  primaryFixed: "onPrimaryFixed",
  primaryFixedDim: "onPrimaryFixed",

  secondary: "onSecondary",
  secondaryDim: "onSecondary",
  secondaryContainer: "onSecondaryContainer",
  secondaryFixed: "onSecondaryFixed",
  secondaryFixedDim: "onSecondaryFixed",

  tertiary: "onTertiary",
  tertiaryDim: "onTertiary",
  tertiaryContainer: "onTertiaryContainer",
  tertiaryFixed: "onTertiaryFixed",
  tertiaryFixedDim: "onTertiaryFixed",

  error: "onError",
  errorDim: "onError",
  errorContainer: "onErrorContainer",
};

/** `surfaceContainerHigh` -> `surface-container-high` */
export function kebab(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}
