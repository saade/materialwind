import { TOKENS } from "materialwind-css/runtime";

import { ArbitraryDemo, StatesDemo, SurfacesDemo } from "./components/Demos.tsx";
import { Palette } from "./components/Palette.tsx";
import { Playground } from "./components/Playground.tsx";
import { Code, InlineCode, Note, Section } from "./components/ui.tsx";
import { ThemeProvider, useTheme } from "./theme.tsx";

const NAV = [
  ["install", "Install"],
  ["playground", "Playground"],
  ["palette", "Palette"],
  ["surfaces", "Surfaces"],
  ["states", "Interaction states"],
  ["dynamic", "Dynamic color"],
  ["arbitrary", "Arbitrary values"],
  ["options", "Options"],
  ["credits", "Credits"],
] as const;

function Header() {
  const { dark, set } = useTheme();
  return (
    <header className="sticky top-0 z-10 border-b border-outline-variant bg-surface/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
        <a href="#top" className="font-semibold tracking-tight text-on-surface">
          materialwind
        </a>
        <nav className="hidden flex-1 gap-4 overflow-x-auto text-sm text-on-surface-variant lg:flex">
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`} className="whitespace-nowrap hover:text-primary">
              {label}
            </a>
          ))}
        </nav>
        <button
          onClick={() => set({ dark: !dark })}
          className="interactive-surface-container-high ml-auto rounded-full px-4 py-2 text-sm font-medium lg:ml-0"
        >
          {dark ? "Light" : "Dark"} mode
        </button>
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
        Generate a complete, accessible Material 3 palette from one color — or pin as many
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
  ["source", "hex", "—", "The seed color. Optional if primary is given."],
  ["primary / secondary / tertiary", "hex", "derived", "Pin a core role instead of deriving it: its hue, the scheme's chroma."],
  ["neutral / neutralVariant / error", "hex", "derived", "Same, for the surface and error palettes."],
  ["scheme", "name", "tonalSpot", "content, expressive, fidelity, fruitSalad, monochrome, neutral, rainbow, tonalSpot, vibrant."],
  ["contrast", "-1 – 1", "0", "0 is the spec'd design. Clamped."],
  ["specVersion", "2021 | 2025", "2021", "Only tonalSpot, vibrant, expressive and neutral honour 2025."],
  ["darkMode", "media | class | selector", "media", "Any other string is used verbatim as a selector."],
  ["prefix", "string", "mw", "Custom property prefix, e.g. --mw-primary."],
  ["harmonize", "boolean", "true", "Default harmonization for custom colors."],
  ["stateHover / stateFocus / statePress / stateDrag", "number", "8 / 12 / 12 / 16", "State-layer opacity, in percent."],
  ["transition", "number | false", "150", "Interactive transition duration in ms."],
];

const CREDITS = [
  {
    links: [
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
    ],
    author: "Javier Morales",
    authorHref: "https://github.com/JavierM42",
    license: "MIT",
    body: "The Tailwind 3 originals this project is a rewrite of. The shape of this plugin comes from there: generating a Material palette from one source color and exposing it as ordinary Tailwind colors, harmonized custom colors, the interactive state layers at Material's 8/12/12/16 opacities, and re-theming at runtime by rewriting CSS custom properties. If you are on Tailwind 3, use those.",
  },
  {
    links: [
      {
        label: "material-theme-builder",
        href: "https://github.com/abernier/material-theme-builder",
      },
    ],
    author: "abernier",
    authorHref: "https://github.com/abernier",
    license: "MIT",
    body: "The rule that a pinned core color contributes its hue while taking the chroma of the scheme it joins — what keeps hand-picked palettes from going garish.",
  },
  {
    links: [
      {
        label: "material-color-utilities",
        href: "https://github.com/material-foundation/material-color-utilities",
      },
    ],
    author: "Google",
    authorHref: "https://github.com/material-foundation",
    license: "Apache-2.0",
    body: "The color engine. Every tone, scheme and contrast level is its work; materialwind only translates it into Tailwind.",
  },
];

function Docs() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-6 pb-24">
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
              The runtime pulls in the Material color engine. Import it lazily —{" "}
              <InlineCode>await import("materialwind-css/runtime")</InlineCode> — if initial bundle size
              matters.
            </Note>
          </div>
        </Section>

        <Section
          id="arbitrary"
          title="Arbitrary values work"
          lead="A regression the Tailwind 3 predecessor shipped with, fixed here by construction."
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
                For anything the flat CSS syntax can't express — opting a color out of
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
          lead="materialwind stands on work by others, and would not exist without it."
        >
          <div className="space-y-4">
            {CREDITS.map((credit) => (
              <div
                key={credit.author}
                className="rounded-2xl border border-outline-variant bg-surface-container-low p-5"
              >
                <h3 className="font-semibold text-on-surface">
                  {credit.links.map((link, i) => (
                    <span key={link.href}>
                      {i > 0 ? ", " : ""}
                      <a className="text-primary hover:underline" href={link.href}>
                        {link.label}
                      </a>
                    </span>
                  ))}
                </h3>
                <p className="mt-0.5 text-sm text-on-surface-variant">
                  by{" "}
                  <a className="hover:underline" href={credit.authorHref}>
                    {credit.author}
                  </a>{" "}
                  · {credit.license}
                </p>
                <p className="mt-2 text-sm text-on-surface-variant">{credit.body}</p>
              </div>
            ))}
          </div>
        </Section>

        <footer className="border-t border-outline-variant py-10 text-sm text-on-surface-variant">
          materialwind is MIT licensed. Bundled third-party code keeps its own license — see{" "}
          <a
            className="text-primary hover:underline"
            href="https://github.com/saade/materialwind/blob/main/materialwind/THIRD-PARTY-NOTICES.md"
          >
            THIRD-PARTY-NOTICES
          </a>
          .
        </footer>
      </main>
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
