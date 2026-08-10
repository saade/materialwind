import { describe, expect, it } from "vitest";

import { updateTheme } from "../src/runtime.js";

/**
 * `updateTheme` returns the CSS it would inject and only touches the DOM when
 * one exists, so the generated output can be asserted without jsdom.
 */
describe("updateTheme", () => {
  it("emits :root and a dark media query by default", () => {
    const css = updateTheme({ source: "#506546" });
    expect(css).toMatch(/^:root\{--mw-/);
    expect(css).toContain("@media (prefers-color-scheme:dark){:root{");
  });

  it("emits a class selector when asked", () => {
    const css = updateTheme({ source: "#506546", darkMode: "class" });
    expect(css).toContain(".dark{");
    expect(css).not.toContain("prefers-color-scheme");
  });

  it("accepts a custom selector", () => {
    const css = updateTheme({ source: "#506546", darkMode: '[data-theme="dark"]' });
    expect(css).toContain('[data-theme="dark"]{');
  });

  it("honours the prefix", () => {
    const css = updateTheme({ source: "#506546", prefix: "md" });
    expect(css).toContain("--md-primary:");
    expect(css).not.toContain("--mw-primary:");
  });

  it("includes custom colors", () => {
    const css = updateTheme({ source: "#506546", colors: { brand: "#ff0000" } });
    expect(css).toContain("--mw-brand:");
    expect(css).toContain("--mw-on-brand-container:");
  });

  it("produces different output for a different source", () => {
    expect(updateTheme({ source: "#506546" })).not.toBe(updateTheme({ source: "#ff0000" }));
  });

  it("writes the variables the plugin's utilities reference", () => {
    // The contract that makes runtime theming work at all: the runtime must
    // emit exactly the custom properties the build-time plugin pointed at.
    const css = updateTheme({ source: "#506546" });
    for (const name of ["--mw-primary", "--mw-on-primary", "--mw-surface-container-highest"]) {
      expect(css).toContain(`${name}:#`);
    }
  });
});
