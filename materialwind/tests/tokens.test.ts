import { MaterialDynamicColors } from "@material/material-color-utilities";
import { describe, expect, it } from "vitest";

import { buildPalette } from "../src/palette.js";
import { ON_PAIRS, TOKENS, kebab } from "../src/tokens.js";

/**
 * Reflects every zero-argument color accessor off the library. If Material adds
 * a token in a future release, this fails and `TOKENS` has to be updated --
 * which is the point: a missing token would otherwise go unnoticed.
 */
function reflectTokens(): string[] {
  const proto = Object.getPrototypeOf(new MaterialDynamicColors());
  return Object.getOwnPropertyNames(proto)
    .filter(
      (name) =>
        name !== "constructor" &&
        typeof proto[name] === "function" &&
        proto[name].length === 0,
    )
    .sort();
}

describe("token coverage", () => {
  it("covers every token the library exposes", () => {
    expect([...TOKENS].sort()).toEqual(reflectTokens());
  });

  it("has no duplicates", () => {
    expect(new Set(TOKENS).size).toBe(TOKENS.length);
  });

  it("pairs every on-color to a real token", () => {
    for (const [surface, on] of Object.entries(ON_PAIRS)) {
      expect(TOKENS).toContain(surface);
      expect(TOKENS).toContain(on);
    }
  });
});

describe("buildPalette", () => {
  const palette = buildPalette({ source: "#506546" });

  it("emits every token in both modes", () => {
    for (const token of TOKENS) {
      expect(palette.light).toHaveProperty(kebab(token));
      expect(palette.dark).toHaveProperty(kebab(token));
    }
  });

  it("emits hex values", () => {
    for (const hex of Object.values(palette.light)) {
      expect(hex).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("differs between light and dark", () => {
    expect(palette.light["primary"]).not.toBe(palette.dark["primary"]);
  });

  it("responds to contrast", () => {
    const high = buildPalette({ source: "#506546", contrast: 1 });
    expect(high.light["on-surface"]).not.toBe(palette.light["on-surface"]);
  });

  it("responds to scheme", () => {
    const mono = buildPalette({ source: "#506546", scheme: "monochrome" });
    expect(mono.light["primary"]).not.toBe(palette.light["primary"]);
  });

  it("rejects an unknown scheme", () => {
    expect(() => buildPalette({ source: "#506546", scheme: "nope" as never })).toThrow(
      /unknown scheme/,
    );
  });

  it("requires a source", () => {
    expect(() => buildPalette({ source: "" })).toThrow(/source/);
  });

  describe("custom colors", () => {
    const withBrand = buildPalette({
      source: "#506546",
      colors: { brand: "#ff0000", myAccent: { hex: "#0000ff", harmonize: false } },
    });

    it("emits the full four-role group", () => {
      for (const key of ["brand", "on-brand", "brand-container", "on-brand-container"]) {
        expect(withBrand.light).toHaveProperty(key);
        expect(withBrand.dark).toHaveProperty(key);
      }
    });

    it("kebab-cases names", () => {
      expect(withBrand.light).toHaveProperty("my-accent");
    });

    it("harmonizes by default and honours opting out", () => {
      const unharmonized = buildPalette({
        source: "#506546",
        colors: { brand: { hex: "#ff0000", harmonize: false } },
      });
      expect(withBrand.light["brand"]).not.toBe(unharmonized.light["brand"]);
    });

    it("registers custom colors as surfaces", () => {
      expect(withBrand.surfaces).toContain("brand");
      expect(withBrand.onPairs["brand"]).toBe("on-brand");
    });
  });
});
