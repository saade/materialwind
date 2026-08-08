import { existsSync, rmSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { describe, expect, it } from "vitest";

import materialwind from "../src/index.js";

const PKG = fileURLToPath(new URL("..", import.meta.url));
const DIST = join(PKG, "dist", "index.js");

/**
 * Compiles a stylesheet that loads the plugin through a real `@plugin` rule, so
 * the test exercises the same path a consumer does.
 *
 * This deliberately runs against `dist/` rather than `src/`: Tailwind resolves
 * `@plugin` with Node's ESM resolver, which cannot load the raw TypeScript and
 * -- more importantly -- cannot resolve the Material library's extensionless
 * imports. Both are only fixed by the bundle, so the bundle is what we test.
 * Run `npm run build` first.
 */
async function compile(
  classes: string[],
  options: Record<string, unknown> = {},
): Promise<{ css: string }> {
  if (!existsSync(DIST)) {
    throw new Error("dist/ not found -- run `npm run build` before the tests.");
  }

  const body = Object.entries(options)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");
  const source = [
    `@import "tailwindcss" source(none);`,
    `@plugin "${DIST}" {`,
    body,
    `}`,
    ...classes.map((c) => `@source inline("${c}");`),
  ].join("\n");

  // Written inside the package, not the OS temp dir, so that `@import
  // "tailwindcss"` resolves against our node_modules.
  const input = join(PKG, `.materialwind-test-${randomUUID()}.css`);
  writeFileSync(input, source);
  try {
    const result = await postcss([tailwind({ optimize: false } as never)]).process(source, {
      from: input,
    });
    return { css: result.css };
  } finally {
    rmSync(input, { force: true });
  }
}

function rule(css: string, selector: string): string | null {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`${escaped}\\s*\\{`);
  const m = re.exec(css);
  if (!m) return null;
  let depth = 0;
  let i = css.indexOf("{", m.index);
  const start = i;
  do {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") depth--;
    i++;
  } while (depth > 0 && i < css.length);
  return css.slice(start, i).replace(/\s+/g, " ");
}

describe("materialwind plugin", () => {
  it("is a valid Tailwind plugin factory", () => {
    const p = materialwind({ source: "#506546" });
    expect(p).toHaveProperty("handler");
  });

  it("exposes all tokens as theme colors", () => {
    const p = materialwind({ source: "#506546" }) as unknown as {
      config: { theme: { extend: { colors: Record<string, string> } } };
    };
    const colors = p.config.theme.extend.colors;
    expect(colors["primary"]).toBe("var(--mw-primary)");
    expect(colors["on-primary-fixed-variant"]).toBe("var(--mw-on-primary-fixed-variant)");
    expect(colors["surface-container-highest"]).toBe("var(--mw-surface-container-highest)");
  });

  it("honours a custom prefix", () => {
    const p = materialwind({ source: "#506546", prefix: "md" }) as unknown as {
      config: { theme: { extend: { colors: Record<string, string> } } };
    };
    expect(p.config.theme.extend.colors["primary"]).toBe("var(--md-primary)");
  });

  it("registers custom colors as theme colors", () => {
    const p = materialwind({ source: "#506546", brand: "#ff0000" }) as unknown as {
      config: { theme: { extend: { colors: Record<string, string> } } };
    };
    expect(p.config.theme.extend.colors["brand"]).toBe("var(--mw-brand)");
    expect(p.config.theme.extend.colors["on-brand-container"]).toBe(
      "var(--mw-on-brand-container)",
    );
  });
});

describe("generated CSS", () => {
  it("emits light vars on :root and dark under a media query by default", async () => {
    const { css } = await compile([], { source: "#506546" });
    expect(css).toMatch(/--mw-primary:\s*#/);
    expect(css).toMatch(/prefers-color-scheme:\s*dark/);
  });

  it("uses a class selector when darkMode is class", async () => {
    const { css } = await compile([], { source: "#506546", darkMode: "class" });
    expect(css).toMatch(/\.dark\s*\{/);
    expect(css).not.toMatch(/prefers-color-scheme/);
  });

  it("accepts a custom dark selector", async () => {
    const { css } = await compile([], { source: "#506546", darkMode: '[data-theme="dark"]' });
    expect(css).toContain('[data-theme="dark"]');
  });

  it("exposes the full token set as color utilities", async () => {
    const { css } = await compile(
      ["text-on-primary-fixed-variant", "bg-surface-container-highest", "border-outline-variant"],
      { source: "#506546" },
    );
    expect(rule(css, ".text-on-primary-fixed-variant")).toContain(
      "var(--mw-on-primary-fixed-variant)",
    );
    expect(rule(css, ".bg-surface-container-highest")).toContain(
      "var(--mw-surface-container-highest)",
    );
    expect(rule(css, ".border-outline-variant")).toContain("var(--mw-outline-variant)");
  });
});

describe("surface utilities", () => {
  it("pairs a surface with its on-color", async () => {
    const { css } = await compile(["surface-primary-container"], { source: "#506546" });
    expect(rule(css, ".surface-primary-container")).toBe(
      "{ background-color: var(--mw-primary-container); color: var(--mw-on-primary-container); }",
    );
  });

  it("builds state layers from the on-color", async () => {
    const { css } = await compile(["interactive-primary"], { source: "#506546" });
    const out = rule(css, ".interactive-primary")!;
    expect(out).toContain("color-mix(in oklab, var(--mw-on-primary) 8%, var(--mw-primary))");
    expect(out).toContain("color-mix(in oklab, var(--mw-on-primary) 12%, var(--mw-primary))");
    expect(out).toContain("transition-duration: 150ms");
  });

  it("declares a plain background before the mix so it survives without color-mix", async () => {
    const { css } = await compile(["interactive-primary"], { source: "#506546" });
    const out = rule(css, ".interactive-primary")!;
    // The unconditional declaration must come first; the mix only applies inside
    // @supports. Otherwise the fallback paints the surface with its on-color.
    expect(out.indexOf("background-color: var(--mw-primary)")).toBeLessThan(
      out.indexOf("@supports"),
    );
  });

  it("applies the drag state permanently", async () => {
    const { css } = await compile(["dragged-primary"], { source: "#506546" });
    expect(rule(css, ".dragged-primary")).toContain(
      "color-mix(in oklab, var(--mw-on-primary) 16%, var(--mw-primary))",
    );
  });

  it("honours custom state opacities from a flat options block", async () => {
    const { css } = await compile(["interactive-primary"], {
      source: "#506546",
      stateHover: 20,
      statePress: 30,
    });
    const out = rule(css, ".interactive-primary")!;
    expect(out).toContain("var(--mw-on-primary) 20%");
    expect(out).toContain("var(--mw-on-primary) 30%");
    expect(out).not.toContain("var(--mw-on-primary) 8%");
  });

  it("can disable the transition", async () => {
    const { css } = await compile(["interactive-primary"], {
      source: "#506546",
      transition: false,
    });
    expect(rule(css, ".interactive-primary")).not.toContain("transition-duration");
  });

  it("covers custom colors too", async () => {
    const { css } = await compile(["surface-brand", "interactive-brand-container"], {
      source: "#506546",
      brand: "#ff0000",
    });
    expect(rule(css, ".surface-brand")).toContain("var(--mw-on-brand)");
    expect(rule(css, ".interactive-brand-container")).toContain("var(--mw-on-brand-container)");
  });

  it("drops the redundant surface segment from the class name", async () => {
    const { css } = await compile(
      ["surface", "surface-container-high", "surface-variant", "surface-inverse"],
      { source: "#506546" },
    );
    expect(rule(css, ".surface")).toBe(
      "{ background-color: var(--mw-surface); color: var(--mw-on-surface); }",
    );
    expect(rule(css, ".surface-container-high")).toBe(
      "{ background-color: var(--mw-surface-container-high); color: var(--mw-on-surface); }",
    );
    expect(rule(css, ".surface-variant")).toBe(
      "{ background-color: var(--mw-surface-variant); color: var(--mw-on-surface-variant); }",
    );
    expect(rule(css, ".surface-inverse")).toBe(
      "{ background-color: var(--mw-inverse-surface); color: var(--mw-inverse-on-surface); }",
    );
  });

  it("still accepts the literal token name", async () => {
    const { css } = await compile(["surface-surface-container-high"], { source: "#506546" });
    expect(rule(css, ".surface-surface-container-high")).toContain(
      "var(--mw-surface-container-high)",
    );
  });

  it("applies the alias to interactive surfaces too", async () => {
    const { css } = await compile(["interactive-container-high"], { source: "#506546" });
    expect(rule(css, ".interactive-container-high")).toContain(
      "var(--mw-surface-container-high)",
    );
  });

  it("does not generate a surface for on-colors", async () => {
    const { css } = await compile(["surface-on-primary"], { source: "#506546" });
    expect(rule(css, ".surface-on-primary")).toBeNull();
  });
});

/**
 * The Tailwind 3 predecessor documented "arbitrary background colors such as
 * bg-[#000000] don't work when you use this plugin". The cause was a second
 * generator registered under the core `bg` namespace, which made every
 * arbitrary `bg-[...]` candidate ambiguous so Tailwind emitted nothing.
 * materialwind never touches a core utility namespace; these lock that in.
 */
describe("arbitrary color values (regression)", () => {
  it("compiles bg-[#000000] to real CSS", async () => {
    const { css } = await compile(["bg-[#000000]", "bg-primary"], { source: "#506546" });
    expect(rule(css, ".bg-\\[\\#000000\\]")).toBe("{ background-color: #000000; }");
    expect(rule(css, ".bg-primary")).toBe("{ background-color: var(--mw-primary); }");
  });

  it("leaves other arbitrary color utilities intact", async () => {
    const { css } = await compile(["text-[#00ff00]", "border-[#0000ff]"], {
      source: "#506546",
    });
    expect(rule(css, ".text-\\[\\#00ff00\\]")).toContain("#00ff00");
    expect(rule(css, ".border-\\[\\#0000ff\\]")).toContain("#0000ff");
  });

  it("keeps the opacity modifier working on theme colors", async () => {
    const { css } = await compile(["bg-primary/50"], { source: "#506546" });
    expect(rule(css, ".bg-primary\\/50")).toContain("color-mix(in oklab, var(--mw-primary) 50%");
  });

  it("does not register any core utility namespace", () => {
    const registered: string[] = [];
    const p = materialwind({ source: "#506546" }) as unknown as {
      handler: (api: Record<string, unknown>) => void;
    };
    p.handler({
      addBase: () => {},
      matchUtilities: (utils: Record<string, unknown>) => {
        registered.push(...Object.keys(utils));
      },
    });
    expect(registered).toEqual(["surface", "interactive", "dragged"]);
    for (const core of ["bg", "text", "border", "outline", "fill", "stroke", "ring"]) {
      expect(registered).not.toContain(core);
    }
  });
});
