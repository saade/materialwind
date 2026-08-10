import { SCHEMES, useTheme } from "../theme.tsx";
import { Code } from "./ui.tsx";

const SWATCHES = ["#506546", "#6750a4", "#b3261e", "#0061a4", "#ff8a00", "#1b6c4a", "#8e4585"];

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-on-surface">{label}</span>
      {hint ? <span className="mt-0.5 block text-xs text-on-surface-variant">{hint}</span> : null}
      <div className="mt-2">{children}</div>
    </label>
  );
}

/** Empty value means derived, and the option is omitted from the config. */
function CoreRole({
  label,
  value,
  fallback,
  onChange,
}: {
  label: string;
  value: string;
  fallback: string;
  onChange: (value: string) => void;
}) {
  const pinned = value !== "";
  return (
    <Field
      label={label}
      hint={pinned ? "Pinned to its hue, with your palette's chroma." : "Derived from primary."}
    >
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(pinned ? "" : fallback)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${
            pinned ? "interactive-primary" : "interactive-surface-container-high"
          }`}
        >
          {pinned ? "Pinned" : "Derived"}
        </button>
        {pinned ? (
          <>
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              aria-label={`${label} color`}
              className="h-9 w-12 cursor-pointer rounded-lg border border-outline-variant bg-transparent"
            />
            <span className="font-mono text-sm text-on-surface-variant">{value}</span>
          </>
        ) : null}
        <span
          className={`ml-auto rounded-full px-3 py-1 text-xs font-medium ${
            label === "Secondary" ? "surface-secondary-container" : "surface-tertiary-container"
          }`}
        >
          {label.toLowerCase()}
        </span>
      </div>
    </Field>
  );
}

export function Playground() {
  const { primary, secondary, tertiary, scheme, contrast, brand, dark, set, reset } = useTheme();

  const config = [
    `@import "tailwindcss";`,
    ``,
    `@plugin "materialwind-css" {`,
    `  primary: ${primary};`,
    ...(secondary ? [`  secondary: ${secondary};`] : []),
    ...(tertiary ? [`  tertiary: ${tertiary};`] : []),
    `  scheme: ${scheme};`,
    `  contrast: ${contrast};`,
    `  darkMode: class;`,
    `  brand: ${brand};`,
    `}`,
  ].join("\n");

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-semibold text-on-surface">Live controls</h3>
            <p className="mt-1 text-sm text-on-surface-variant">
              Every change re-themes this entire page at runtime.
            </p>
          </div>
          <button
            onClick={reset}
            className="interactive-secondary-container shrink-0 rounded-full px-4 py-2 text-sm font-medium"
          >
            Reset
          </button>
        </div>

        <div className="mt-6 space-y-6">
          <Field label="Primary" hint="Seeds the scheme, and every other role derives from it.">
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="color"
                value={primary}
                onChange={(e) => set({ primary: e.target.value })}
                aria-label="Primary color"
                className="h-10 w-14 cursor-pointer rounded-lg border border-outline-variant bg-transparent"
              />
              <input
                type="text"
                value={primary}
                onChange={(e) => set({ primary: e.target.value })}
                spellCheck={false}
                className="w-28 rounded-lg border border-outline bg-surface px-3 py-2 font-mono text-sm text-on-surface focus:border-primary focus:outline-none"
              />
              <div className="flex gap-1.5">
                {SWATCHES.map((hex) => (
                  <button
                    key={hex}
                    onClick={() => set({ primary: hex })}
                    aria-label={`Use ${hex}`}
                    style={{ backgroundColor: hex }}
                    className={`h-8 w-8 rounded-full border-2 transition ${
                      primary.toLowerCase() === hex ? "border-on-surface" : "border-outline-variant"
                    }`}
                  />
                ))}
              </div>
            </div>
          </Field>

          <CoreRole
            label="Secondary"
            value={secondary}
            fallback="#ffd000"
            onChange={(v) => set({ secondary: v })}
          />
          <CoreRole
            label="Tertiary"
            value={tertiary}
            fallback="#0061a4"
            onChange={(v) => set({ tertiary: v })}
          />

          <Field label="Scheme" hint="How the palette is derived from primary.">
            <select
              value={scheme}
              onChange={(e) => set({ scheme: e.target.value as typeof scheme })}
              className="w-full rounded-lg border border-outline bg-surface px-3 py-2 text-sm text-on-surface focus:border-primary focus:outline-none"
            >
              {SCHEMES.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </Field>

          <Field label={`Contrast: ${contrast.toFixed(2)}`} hint="-1 minimum, 0 spec'd, 1 maximum.">
            <input
              type="range"
              min={-1}
              max={1}
              step={0.05}
              value={contrast}
              onChange={(e) => set({ contrast: Number(e.target.value) })}
              className="w-full accent-primary"
            />
          </Field>

          <Field label="Custom color: brand" hint="Harmonized toward the source by default.">
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={brand}
                onChange={(e) => set({ brand: e.target.value })}
                aria-label="Brand color"
                className="h-10 w-14 cursor-pointer rounded-lg border border-outline-variant bg-transparent"
              />
              <span className="font-mono text-sm text-on-surface-variant">{brand}</span>
              <span className="surface-brand rounded-full px-3 py-1 text-xs font-medium">brand</span>
            </div>
          </Field>

          <Field label="Mode">
            <div className="flex gap-2">
              <button
                onClick={() => set({ dark: false })}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  dark ? "interactive-surface-container-high" : "interactive-primary"
                }`}
              >
                Light
              </button>
              <button
                onClick={() => set({ dark: true })}
                className={`rounded-full px-4 py-2 text-sm font-medium ${
                  dark ? "interactive-primary" : "interactive-surface-container-high"
                }`}
              >
                Dark
              </button>
            </div>
          </Field>
        </div>
      </div>

      <div className="space-y-4">
        <Code lang="app.css">{config}</Code>
        <Code lang="runtime">{`import { updateTheme } from "materialwind-css/runtime";

updateTheme({
  primary: "${primary}",${secondary ? `\n  secondary: "${secondary}",` : ""}${
          tertiary ? `\n  tertiary: "${tertiary}",` : ""
        }
  scheme: "${scheme}",
  contrast: ${contrast},
  colors: { brand: "${brand}" },
  darkMode: "class",
});`}</Code>
      </div>
    </div>
  );
}
