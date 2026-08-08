# materialwind

The Material Design 3 color system for **Tailwind CSS 4**, with dynamic color.

Generate a complete, accessible M3 palette from a single source color, use it
through ordinary Tailwind utilities, and swap the whole theme at runtime without
a rebuild.

```css
/* app.css */
@import "tailwindcss";
@plugin "materialwind" {
  primary: #506546;
}
```

```html
<button class="interactive-primary rounded-full px-6 py-2">Press me</button>
<div class="bg-surface-container-high text-on-surface">Card</div>
```

## Install

```sh
npm install materialwind
```

Requires `tailwindcss@^4`.

## Configuration

Everything is configured in the `@plugin` block. Only `source` is required.

```css
@import "tailwindcss";
@plugin "materialwind" {
  source: #506546;        /* seed color for the whole scheme */
  scheme: tonalSpot;      /* scheme variant */
  contrast: 0;            /* -1 (minimum) to 1 (maximum) */
  darkMode: class;        /* media | class | any selector */

  /* any other key is a custom color */
  brand: #ff0000;
  success: #00c853;
}
```

| Option | Type | Default | Notes |
| --- | --- | --- | --- |
| `source` | hex | — | The seed color. Optional if `primary` is given. |
| `primary` / `secondary` / `tertiary` | hex | derived | Pin a core role instead of deriving it. See below. |
| `neutral` / `neutralVariant` / `error` | hex | derived | Same, for the surface and error palettes. |
| `scheme` | see below | `tonalSpot` | Scheme variant. |
| `contrast` | `-1`–`1` | `0` | `0` is the spec'd design; clamped. |
| `specVersion` | `2021` \| `2025` | `2021` | See note below. |
| `darkMode` | `media` \| `class` \| selector | `media` | Any other string is used verbatim as a selector. |
| `prefix` | string | `mw` | Custom property prefix, e.g. `--mw-primary`. |
| `harmonize` | boolean | `true` | Default harmonization for custom colors. |
| `stateHover` / `stateFocus` / `statePress` / `stateDrag` | number | `8` / `12` / `12` / `16` | State-layer opacity, in percent. |
| `transition` | number \| `false` | `150` | Interactive transition duration in ms. |

Schemes: `content`, `expressive`, `fidelity`, `fruitSalad`, `monochrome`,
`neutral`, `rainbow`, `tonalSpot`, `vibrant`.

> **On `specVersion`:** only `tonalSpot`, `vibrant`, `expressive` and `neutral`
> honour `2025`. Upstream forces every other scheme back to `2021` regardless of
> what you pass.

### Core colors

By default every role is derived from the source color. You can pin any of them
instead — the rest keep being derived and stay in harmony:

```css
@plugin "materialwind" {
  primary: #506546;
  secondary: #ffff00;
}
```

`primary` doubles as the seed, so `source` is only needed if you want the scheme
derived from a *different* color than your primary.

Pinning takes the **hue** of the color you give and the **chroma of the scheme**
it is joining. That is deliberate: letting an arbitrary hex bring its own chroma
is what makes hand-assembled palettes look garish, and it would break the
contrast guarantees the tonal system provides. So `#ffff00` gives you a yellow
secondary that belongs to your palette, not literal yellow.

Pinnable roles: `primary`, `secondary`, `tertiary`, `neutral`, `neutralVariant`,
`error`. `neutral` and `neutralVariant` drive the surface family.

Core colors are *not* harmonized — you picked the hue, so it is respected.
Custom colors are harmonized by default, since they're extras being fitted in.

### Custom colors

Any option key that isn't listed above is treated as a custom color. Each one
produces a full four-role group, harmonized toward the source color by default:

```css
@plugin "materialwind" {
  source: #506546;
  brand: #ff0000;
}
```

gives you `brand`, `on-brand`, `brand-container` and `on-brand-container`, plus
`surface-brand` / `interactive-brand` / `dragged-brand`.

To opt a color out of harmonization, or for anything else the flat CSS syntax
can't express, use a JS config:

```js
// tailwind.config.js
import materialwind from "materialwind";

export default {
  plugins: [
    materialwind({
      source: "#506546",
      colors: {
        brand: { hex: "#ff0000", harmonize: false },
      },
      states: { hover: 10 },
    }),
  ],
};
```

## Color tokens

Every token becomes an ordinary Tailwind color, so it works with `bg-`, `text-`,
`border-`, `outline-`, `fill-`, `stroke-`, `ring-`, `divide-`, `shadow-`, the
`/opacity` modifier, and every variant.

All **59** M3 dynamic color tokens are generated:

**Surfaces** — `background`, `on-background`, `surface`, `surface-dim`,
`surface-bright`, `surface-container-lowest`, `surface-container-low`,
`surface-container`, `surface-container-high`, `surface-container-highest`,
`on-surface`, `surface-variant`, `on-surface-variant`, `outline`,
`outline-variant`, `inverse-surface`, `inverse-on-surface`, `shadow`, `scrim`,
`surface-tint`

**Primary** — `primary`, `primary-dim`, `on-primary`, `primary-container`,
`on-primary-container`, `inverse-primary`, `primary-fixed`, `primary-fixed-dim`,
`on-primary-fixed`, `on-primary-fixed-variant`

**Secondary** — `secondary`, `secondary-dim`, `on-secondary`,
`secondary-container`, `on-secondary-container`, `secondary-fixed`,
`secondary-fixed-dim`, `on-secondary-fixed`, `on-secondary-fixed-variant`

**Tertiary** — `tertiary`, `tertiary-dim`, `on-tertiary`, `tertiary-container`,
`on-tertiary-container`, `tertiary-fixed`, `tertiary-fixed-dim`,
`on-tertiary-fixed`, `on-tertiary-fixed-variant`

**Error** — `error`, `error-dim`, `on-error`, `error-container`,
`on-error-container`

**Palette key colors** — `primary-palette-key-color`,
`secondary-palette-key-color`, `tertiary-palette-key-color`,
`neutral-palette-key-color`, `neutral-variant-palette-key-color`,
`error-palette-key-color`

## Surface utilities

M3 pairs every container color with an *on-color* for its content. Three
utilities apply that pairing for you.

| Utility | Effect |
| --- | --- |
| `surface-X` | `background: X`, `color: on-X` |
| `interactive-X` | the above, plus hover / focus-visible / press state layers and a transition |
| `dragged-X` | the above with the drag state layer applied permanently |

```html
<button class="interactive-primary">Primary</button>
<div class="surface-container-high">Card</div>
```

The redundant `surface` segment is dropped from the class name, so surface
tokens read naturally — `surface`, `surface-container-high`, `surface-variant`,
`surface-inverse`. The literal token name (`surface-surface-container-high`)
also works if you prefer it.

State layers follow the M3 guidelines: the on-color is mixed into the container
color at 8% (hover), 12% (focus and press) and 16% (drag), using native
`color-mix()`. The plain background color is always declared first, so a browser
without `color-mix()` still gets the correct surface.

These exist for every token that has an on-color, and for every custom color.

## Dynamic color

The plugin emits the palette as custom properties (`--mw-primary`, …) and points
the Tailwind colors at them. Re-theming at runtime is therefore just rewriting
those properties — no rebuild, and every utility updates at once.

```js
import { updateTheme } from "materialwind/runtime";

updateTheme({
  source: "#ff0000",
  scheme: "tonalSpot",
  contrast: 0,
  darkMode: "class",   // must match your @plugin config
});
```

`updateTheme` regenerates the full palette and injects (or replaces) a single
`<style id="materialwind-dynamic-theme">` element. It returns the CSS string, so
it can also be used for SSR.

Pass the same `prefix`, `darkMode` and custom `colors` you configured at build
time, otherwise the variables it writes won't be the ones your utilities read.

The runtime pulls in the Material color engine, so import it lazily if initial
bundle size matters:

```js
const { updateTheme } = await import("materialwind/runtime");
```

## Notes

**Arbitrary color values work.** `bg-[#000000]` compiles correctly.
materialwind never registers a generator under a core utility namespace, which
is what broke arbitrary background colors in the Tailwind 3 predecessor. There
are regression tests for this.

**Tailwind's default palette is preserved.** Tokens are added via
`theme.extend`, so `bg-blue-500` and friends still work.

**The Material library is bundled.** `@material/material-color-utilities@0.4.0`
ships extensionless relative imports that Node's ESM resolver rejects;
materialwind bundles it so consumers never hit that.

## API

```ts
import materialwind, { buildPalette, TOKENS, ON_PAIRS } from "materialwind";
import { updateTheme } from "materialwind/runtime";
```

- `buildPalette(options)` → `{ light, dark, surfaces, onPairs }` — the raw
  generator, if you want the palette without Tailwind.
- `TOKENS` — the complete token list.
- `ON_PAIRS` — container token → on-color token.

## License

MIT
