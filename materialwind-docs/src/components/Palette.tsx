import { useEffect, useState } from "react";
import { ON_PAIRS, TOKENS, kebab } from "materialwind-css/runtime";

import { useTheme } from "../theme.tsx";

/** Grouped in spec order. `leftover` below catches any token missing from a
 *  group, so a new one can't silently vanish from the docs. */
const GROUPS: { title: string; note: string; tokens: string[] }[] = [
  {
    title: "Surfaces",
    note: "Backgrounds, from dimmest to brightest, plus outlines and inverses.",
    tokens: [
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
    ],
  },
  {
    title: "Primary",
    note: "The main accent, plus the fixed roles that stay put across modes.",
    tokens: [
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
    ],
  },
  {
    title: "Secondary",
    note: "For less prominent components.",
    tokens: [
      "secondary",
      "secondaryDim",
      "onSecondary",
      "secondaryContainer",
      "onSecondaryContainer",
      "secondaryFixed",
      "secondaryFixedDim",
      "onSecondaryFixed",
      "onSecondaryFixedVariant",
    ],
  },
  {
    title: "Tertiary",
    note: "For contrasting accents that balance primary and secondary.",
    tokens: [
      "tertiary",
      "tertiaryDim",
      "onTertiary",
      "tertiaryContainer",
      "onTertiaryContainer",
      "tertiaryFixed",
      "tertiaryFixedDim",
      "onTertiaryFixed",
      "onTertiaryFixedVariant",
    ],
  },
  {
    title: "Error",
    note: "For destructive actions and validation.",
    tokens: ["error", "errorDim", "onError", "errorContainer", "onErrorContainer"],
  },
  {
    title: "Palette key colors",
    note: "The key color of each underlying tonal palette.",
    tokens: [
      "primaryPaletteKeyColor",
      "secondaryPaletteKeyColor",
      "tertiaryPaletteKeyColor",
      "neutralPaletteKeyColor",
      "neutralVariantPaletteKeyColor",
      "errorPaletteKeyColor",
    ],
  },
];

const grouped = new Set(GROUPS.flatMap((g) => g.tokens));
const leftover = TOKENS.filter((t) => !grouped.has(t));

function Swatch({ token }: { token: string }) {
  const name = kebab(token);
  const on = ON_PAIRS[token];
  const [hex, setHex] = useState("");
  const { primary, secondary, tertiary, scheme, contrast, dark } = useTheme();

  // Read off the document so the label survives a runtime theme swap.
  useEffect(() => {
    const read = () =>
      setHex(
        getComputedStyle(document.documentElement).getPropertyValue(`--mw-${name}`).trim(),
      );
    const id = requestAnimationFrame(read);
    return () => cancelAnimationFrame(id);
  }, [name, primary, secondary, tertiary, scheme, contrast, dark]);

  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant">
      <div
        className="flex h-20 items-end p-3"
        style={{
          backgroundColor: `var(--mw-${name})`,
          color: on ? `var(--mw-${kebab(on)})` : undefined,
        }}
      >
        {on ? <span className="text-xs font-medium">on-color</span> : null}
      </div>
      <div className="bg-surface-container-low px-3 py-2">
        <div className="truncate font-mono text-xs text-on-surface" title={name}>
          {name}
        </div>
        <div className="mt-0.5 font-mono text-[11px] uppercase text-on-surface-variant">
          {hex || "\u00a0"}
        </div>
      </div>
    </div>
  );
}

export function Palette() {
  return (
    <div className="space-y-10">
      {GROUPS.map((group) => (
        <div key={group.title}>
          <h3 className="text-lg font-semibold text-on-surface">{group.title}</h3>
          <p className="mt-1 text-sm text-on-surface-variant">{group.note}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {group.tokens.map((token) => (
              <Swatch key={token} token={token} />
            ))}
          </div>
        </div>
      ))}

      {leftover.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold text-on-surface">Other tokens</h3>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {leftover.map((token) => (
              <Swatch key={token} token={token} />
            ))}
          </div>
        </div>
      ) : null}

      <p className="text-sm text-on-surface-variant">
        {TOKENS.length} tokens, every one generated for both light and dark.
      </p>
    </div>
  );
}
