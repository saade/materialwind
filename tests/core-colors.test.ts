import {
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
  argbFromHex,
  hexFromArgb,
} from "@material/material-color-utilities";
import { describe, expect, it } from "vitest";

import { CORE_ROLES, buildPalette } from "../src/palette.js";
import { TOKENS, kebab } from "../src/tokens.js";
import type { SchemeName } from "../src/types.js";

const SUBCLASSES: Record<SchemeName, new (h: Hct, d: boolean, c: number) => never> = {
  content: SchemeContent as never,
  expressive: SchemeExpressive as never,
  fidelity: SchemeFidelity as never,
  fruitSalad: SchemeFruitSalad as never,
  monochrome: SchemeMonochrome as never,
  neutral: SchemeNeutral as never,
  rainbow: SchemeRainbow as never,
  tonalSpot: SchemeTonalSpot as never,
  vibrant: SchemeVibrant as never,
};

/**
 * `buildPalette` constructs `DynamicScheme` with a variant instead of using the
 * `Scheme*` subclasses, because only that form accepts palette overrides. That
 * refactor is only safe if the two are equivalent -- so assert it directly,
 * across every scheme, mode and contrast level.
 */
describe("scheme construction equivalence", () => {
  const source = "#506546";
  const mdc = new MaterialDynamicColors();

  for (const [name, Subclass] of Object.entries(SUBCLASSES)) {
    for (const contrast of [0, 0.5, -1]) {
      it(`${name} at contrast ${contrast} matches the upstream subclass`, () => {
        const palette = buildPalette({ source, scheme: name as SchemeName, contrast });

        for (const [isDark, expected] of [
          [false, palette.light],
          [true, palette.dark],
        ] as const) {
          const reference = new Subclass(Hct.fromInt(argbFromHex(source)), isDark, contrast);
          for (const token of TOKENS) {
            const dynamicColor = mdc[token]();
            if (!dynamicColor) continue;
            expect(expected[kebab(token)]).toBe(hexFromArgb(dynamicColor.getArgb(reference)));
          }
        }
      });
    }
  }
});

describe("core color overrides", () => {
  const base = buildPalette({ source: "#506546" });

  it("accepts primary as the seed with no explicit source", () => {
    const fromPrimary = buildPalette({ primary: "#506546" });
    expect(fromPrimary.light).toEqual(base.light);
    expect(fromPrimary.dark).toEqual(base.dark);
  });

  it("still requires one of source or primary", () => {
    expect(() => buildPalette({})).toThrow(/`source` or `primary`/);
    expect(() => buildPalette({ secondary: "#ffff00" })).toThrow(/`source` or `primary`/);
  });

  it("changes secondary without disturbing primary", () => {
    const pinned = buildPalette({ primary: "#506546", secondary: "#ffff00" });
    expect(pinned.light["secondary"]).not.toBe(base.light["secondary"]);
    expect(pinned.light["secondary-container"]).not.toBe(base.light["secondary-container"]);
    expect(pinned.light["primary"]).toBe(base.light["primary"]);
    expect(pinned.light["surface"]).toBe(base.light["surface"]);
  });

  it("moves the pinned role toward the requested hue", () => {
    const pinned = buildPalette({ primary: "#506546", secondary: "#ffff00" });
    const target = Hct.fromInt(argbFromHex("#ffff00")).hue;
    const got = Hct.fromInt(argbFromHex(pinned.light["secondary-container"]!)).hue;
    // Within a few degrees -- the tone changes, the hue is preserved.
    expect(Math.abs(got - target)).toBeLessThan(10);
  });

  it("takes chroma from the scheme, not the input", () => {
    // A fully saturated input must not drag the palette out of the scheme's
    // chroma range; only its hue should carry over.
    const pinned = buildPalette({ primary: "#506546", secondary: "#ffff00" });
    const inputChroma = Hct.fromInt(argbFromHex("#ffff00")).chroma;
    const gotChroma = Hct.fromInt(argbFromHex(pinned.light["secondary"]!)).chroma;
    expect(gotChroma).toBeLessThan(inputChroma);
  });

  it("supports every core role", () => {
    for (const role of CORE_ROLES) {
      const pinned = buildPalette({ source: "#506546", [role]: "#ff0000" });
      expect(pinned.light).not.toEqual(base.light);
    }
  });

  it("pins tertiary and error independently", () => {
    const pinned = buildPalette({
      primary: "#506546",
      tertiary: "#0000ff",
      error: "#ff00ff",
    });
    expect(pinned.light["tertiary"]).not.toBe(base.light["tertiary"]);
    expect(pinned.light["error"]).not.toBe(base.light["error"]);
    expect(pinned.light["primary"]).toBe(base.light["primary"]);
  });

  it("shifts the neutral surfaces when neutral is pinned", () => {
    const pinned = buildPalette({ primary: "#506546", neutral: "#ff0000" });
    expect(pinned.light["surface"]).not.toBe(base.light["surface"]);
    expect(pinned.light["primary"]).toBe(base.light["primary"]);
  });

  it("does not treat core roles as custom colors", () => {
    const pinned = buildPalette({ primary: "#506546", secondary: "#ffff00" });
    // A custom color would have produced an `on-secondary-container` *group*
    // keyed off a new name; secondary must stay a first-class scheme role.
    expect(pinned.surfaces).toContain("secondary");
    expect(pinned.onPairs["secondary"]).toBe("on-secondary");
    expect(pinned.light).not.toHaveProperty("secondary-container-container");
  });

  it("still supports custom colors alongside pinned roles", () => {
    const pinned = buildPalette({
      primary: "#506546",
      secondary: "#ffff00",
      colors: { brand: "#ff0000" },
    });
    expect(pinned.light).toHaveProperty("brand");
    expect(pinned.light).toHaveProperty("on-brand-container");
  });
});
