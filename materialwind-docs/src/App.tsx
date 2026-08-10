import { useCallback, useState } from "react";
import { TOKENS } from "materialwind-css/runtime";

import { ArbitraryDemo, StatesDemo, SurfacesDemo } from "./components/Demos.tsx";
import { Gallery } from "./components/Gallery.tsx";
import { Palette } from "./components/Palette.tsx";
import { Playground } from "./components/Playground.tsx";
import { Rail } from "./components/Rail.tsx";
import { Code, InlineCode, Note, Section } from "./components/ui.tsx";
import { ThemeProvider, useTheme } from "./theme.tsx";

function Header({ onOpenNav }: { onOpenNav: () => void }) {
  const { dark, set } = useTheme();
  return (
    <header className="sticky top-0 z-20 border-b border-outline-variant bg-surface/85 backdrop-blur">
      <div className="mx-auto flex max-w-[88rem] items-center gap-3 px-6 py-3">
        <button
          onClick={onOpenNav}
          aria-label="Open navigation"
          className="interactive-surface-container-high -ml-1 rounded-full p-2.5 lg:hidden"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden fill="none">
            {[4, 9, 14].map((y) => (
              <line
                key={y}
                x1="2"
                y1={y}
                x2="16"
                y2={y}
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            ))}
          </svg>
        </button>

        <a href="#top" className="font-semibold tracking-tight text-on-surface">
          materialwind
        </a>

        <div className="ml-auto flex items-center gap-2">
          <a
            href="https://github.com/saade/materialwind"
            className="interactive-surface-container-high hidden rounded-full px-4 py-2 text-sm font-medium sm:block"
          >
            GitHub
          </a>
          <button
            onClick={() => set({ dark: !dark })}
            className="interactive-surface-container-high rounded-full px-4 py-2 text-sm font-medium"
          >
            {dark ? "Light" : "Dark"} mode
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <div id="top" className="py-16">
      <p className="font-mono text-sm text-primary">Tailwind CSS 4</p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tight text-on-surface sm:text-6xl">
        Material Design 3 color,
        <br />
        <span className="text-primary">the Tailwind way.</span>
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-on-surface-variant">
        Generate a complete, accessible Material 3 palette from one color, or pin as many
        roles as you like. Use it through ordinary Tailwind utilities, and swap the whole theme
        at runtime without a rebuild.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href="#playground"
          className="interactive-primary rounded-full px-6 py-3 text-sm font-medium"
        >
          Try it live
        </a>
        <a
          href="#install"
          className="interactive-secondary-container rounded-full px-6 py-3 text-sm font-medium"
        >
          Get started
        </a>
      </div>
      <dl className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          [`${TOKENS.length} tokens`, "The complete M3 dynamic color set, light and dark."],
          ["9 schemes", "From monochrome to vibrant, with a contrast dial."],
          ["Runtime theming", "Re-theme from a user's color without rebuilding."],
        ].map(([title, body]) => (
          <div key={title} className="rounded-2xl border border-outline-variant p-5">
            <dt className="font-semibold text-on-surface">{title}</dt>
            <dd className="mt-1 text-sm text-on-surface-variant">{body}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const OPTIONS: [string, string, string, string][] = [
  ["source", "hex", "none", "The seed color. Optional if primary is given."],
  ["primary / secondary / tertiary", "hex", "derived", "Pin a core role instead of deriving it: its hue, the scheme's chroma."],
  ["neutral / neutralVariant / error", "hex", "derived", "Same, for the surface and error palettes."],
  ["scheme", "name", "tonalSpot", "content, expressive, fidelity, fruitSalad, monochrome, neutral, rainbow, tonalSpot, vibrant."],
  ["contrast", "-1 to 1", "0", "0 is the spec'd design. Clamped."],
  ["specVersion", "2021 | 2025", "2021", "Only tonalSpot, vibrant, expressive and neutral honour 2025."],
  ["darkMode", "media | class | selector", "media", "Any other string is used verbatim as a selector."],
  ["prefix", "string", "mw", "Custom property prefix, e.g. --mw-primary."],
  ["harmonize", "boolean", "true", "Default harmonization for custom colors."],
  ["stateHover / stateFocus / statePress / stateDrag", "number", "8 / 12 / 12 / 16", "State-layer opacity, in percent."],
  ["transition", "number | false", "150", "Interactive transition duration in ms."],
];

const INSPIRATION = [
  {
    label: "tailwind-material-colors",
    href: "https://github.com/JavierM42/tailwind-material-colors",
  },
  {
    label: "tailwind-material-surfaces",
    href: "https://github.com/JavierM42/tailwind-material-surfaces",
  },
  {
    label: "tailwind-mode-aware-colors",
    href: "https://github.com/JavierM42/tailwind-mode-aware-colors",
  },
  { label: "material-theme-builder", href: "https://github.com/abernier/material-theme-builder" },
];


function Docs() {
  const [navOpen, setNavOpen] = useState(false);
  const closeNav = useCallback(() => setNavOpen(false), []);

  return (
    <>
      <Header onOpenNav={() => setNavOpen(true)} />
      {/* The rail is a sibling so it can stay sticky while the article scrolls.
          `minmax(0,1fr)` stops wide children forcing the column open. */}
      <div className="mx-auto grid max-w-[88rem] gap-x-10 px-6 lg:grid-cols-[13rem_minmax(0,1fr)]">
        <Rail open={navOpen} onClose={closeNav} />
        <main className="min-w-0 pb-24">
          <Hero />

        <Section
          id="install"
          title="Install"
          lead="One package, one plugin block. No config file required."
        >
          <div className="space-y-4">
            <Code lang="sh">npm install materialwind-css</Code>
            <Code lang="app.css">{`@import "tailwindcss";

@plugin "materialwind-css" {
  primary: #506546;
}`}</Code>
            <Note>
              Requires <InlineCode>tailwindcss@^4</InlineCode>. Tokens are added through{" "}
              <InlineCode>theme.extend</InlineCode>, so Tailwind's default palette is preserved.
            </Note>
          </div>
        </Section>

        <Section
          id="playground"
          title="Playground"
          lead="Pin primary, optionally pin secondary and tertiary, and watch the whole page re-theme. This is the same runtime API you would ship."
        >
          <Playground />
        </Section>

        <Section
          id="palette"
          title="Color palette"
          lead={
            <>
              All {TOKENS.length} Material 3 dynamic color tokens, each usable with{" "}
              <InlineCode>bg-</InlineCode>, <InlineCode>text-</InlineCode>,{" "}
              <InlineCode>border-</InlineCode> and every other color utility, plus the{" "}
              <InlineCode>/opacity</InlineCode> modifier and all variants.
            </>
          }
        >
          <Palette />
        </Section>

        <Section
          id="components"
          title="Components"
          lead="Material 3 components built only from these tokens. Change the source color in the playground and every one of them follows."
        >
          <Gallery />
        </Section>

        <Section
          id="surfaces"
          title="Surfaces and on-colors"
          lead={
            <>
              Material pairs every container color with an <em>on-color</em> for its content. The{" "}
              <InlineCode>surface-*</InlineCode> utility applies both at once, so you don't have to
              remember the pairing.
            </>
          }
        >
          <SurfacesDemo />
        </Section>

        <Section
          id="states"
          title="Interaction states"
          lead={
            <>
              <InlineCode>interactive-*</InlineCode> adds Material's state layers using native{" "}
              <InlineCode>color-mix()</InlineCode>. The plain background is declared first, so a
              browser without <InlineCode>color-mix()</InlineCode> still gets the right surface.
            </>
          }
        >
          <StatesDemo />
        </Section>

        <Section
          id="dynamic"
          title="Dynamic color"
          lead="The palette lives in CSS custom properties, so re-theming at runtime is just rewriting them. No rebuild, and every utility updates at once."
        >
          <div className="space-y-4">
            <Code lang="js">{`import { updateTheme } from "materialwind-css/runtime";

updateTheme({
  primary: "#ff0000",
  scheme: "tonalSpot",
  contrast: 0,
  darkMode: "class",
});`}</Code>
            <p className="text-sm text-on-surface-variant">
              Pass the same <InlineCode>prefix</InlineCode>, <InlineCode>darkMode</InlineCode> and
              custom <InlineCode>colors</InlineCode> you configured at build time, otherwise the
              variables it writes won't be the ones your utilities read. It returns the CSS string,
              so it also works for SSR.
            </p>
            <Note>
              The runtime pulls in the Material color engine. Import it lazily with{" "}
              <InlineCode>await import("materialwind-css/runtime")</InlineCode> if initial bundle
              size matters.
            </Note>
          </div>
        </Section>

        <Section
          id="arbitrary"
          title="Arbitrary values work"
          lead="Adding a color system should not cost you Tailwind's own arbitrary values."
        >
          <ArbitraryDemo />
        </Section>

        <Section id="options" title="Options" lead="Everything is configured in the @plugin block.">
          <div className="space-y-6">
            <div className="overflow-x-auto rounded-xl border border-outline-variant">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-container-high text-on-surface">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Option</th>
                    <th className="px-4 py-3 font-semibold">Type</th>
                    <th className="px-4 py-3 font-semibold">Default</th>
                    <th className="px-4 py-3 font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {OPTIONS.map(([name, type, def, note]) => (
                    <tr key={name} className="border-t border-outline-variant align-top">
                      <td className="px-4 py-3 font-mono text-xs text-on-surface">{name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">{type}</td>
                      <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">{def}</td>
                      <td className="px-4 py-3 text-on-surface-variant">{note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-on-surface">Custom colors</h3>
              <p className="mt-1 text-sm text-on-surface-variant">
                Any option key that isn't listed above becomes a custom color, generating a full
                four-role group harmonized toward the source.
              </p>
              <div className="mt-4">
                <Code lang="app.css">{`@plugin "materialwind-css" {
  primary: #506546;
  brand: #ff0000;
}

/* gives you brand, on-brand, brand-container, on-brand-container
   plus surface-brand / interactive-brand / dragged-brand */`}</Code>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-on-surface">JS config</h3>
              <p className="mt-1 text-sm text-on-surface-variant">
                For anything the flat CSS syntax can't express: opting a color out of
                harmonization, or nested state opacities.
              </p>
              <div className="mt-4">
                <Code lang="tailwind.config.js">{`import materialwind from "materialwind-css";

export default {
  plugins: [
    materialwind({
      primary: "#506546",
      secondary: "#ffd000",
      colors: { brand: { hex: "#ff0000", harmonize: false } },
      states: { hover: 10 },
    }),
  ],
};`}</Code>
              </div>
            </div>
          </div>
        </Section>

        <Section
          id="credits"
          title="Credits"
          lead="The one bundled dependency, and the projects that inspired this one."
        >
          <div className="space-y-4">
            <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-5">
              <h3 className="font-semibold text-on-surface">
                <a
                  className="text-primary hover:underline"
                  href="https://github.com/material-foundation/material-color-utilities"
                >
                  material-color-utilities
                </a>
              </h3>
              <p className="mt-0.5 text-sm text-on-surface-variant">Google · Apache-2.0</p>
              <p className="mt-2 text-sm text-on-surface-variant">
                Bundled into the published package and responsible for the color math: tonal
                palettes, scheme variants and contrast levels. See{" "}
                <a
                  className="text-primary hover:underline"
                  href="https://github.com/saade/materialwind/blob/main/materialwind/THIRD-PARTY-NOTICES.md"
                >
                  THIRD-PARTY-NOTICES
                </a>
                .
              </p>
            </div>

            <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-5">
              <h3 className="font-semibold text-on-surface">Inspiration</h3>
              <p className="mt-2 text-sm text-on-surface-variant">
                Other work in the Material and Tailwind space.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {INSPIRATION.map((p) => (
                  <a
                    key={p.href}
                    href={p.href}
                    className="rounded-full border border-outline px-3 py-1 font-mono text-xs text-on-surface-variant transition-colors hover:bg-on-surface/8"
                  >
                    {p.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <footer className="border-t border-outline-variant py-10 text-sm text-on-surface-variant">
          materialwind is MIT licensed. Bundled third-party code keeps its own license. See{" "}
          <a
            className="text-primary hover:underline"
            href="https://github.com/saade/materialwind/blob/main/materialwind/THIRD-PARTY-NOTICES.md"
          >
            THIRD-PARTY-NOTICES
          </a>
          .
        </footer>
        </main>
      </div>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Docs />
    </ThemeProvider>
  );
}
