# materialwind

The Material Design 3 color system for **Tailwind CSS 4**, with dynamic color.

- **[Documentation and live playground](https://saade.github.io/materialwind/)**
- **[`materialwind-css` on npm](https://www.npmjs.com/package/materialwind-css)**

```css
@import "tailwindcss";
@plugin "materialwind-css" {
  primary: #506546;
}
```

## Layout

| Path | What it is |
| --- | --- |
| `materialwind/` | The plugin. Published to npm as **`materialwind-css`**. |
| `materialwind-docs/` | The docs site. Deployed to GitHub Pages. |

The directory keeps the project name; the npm package is `materialwind-css`
because the unscoped `materialwind` name carries an unpublish tombstone from an
unrelated 2023 package and cannot be reliably claimed.

## Development

```sh
cd materialwind && npm install && npm test
cd ../materialwind-docs && npm install && npm run dev
```

The docs depend on the plugin through `file:../materialwind`, which npm
symlinks rather than packs — so build the plugin (`npm run build`) before
building the docs, or the docs resolve an empty `dist/`.

## Releasing

Publishing is driven by GitHub Releases and uses **npm trusted publishing**
(OIDC), so there is no npm token stored in this repo.

1. Bump `version` in `materialwind/package.json` and commit.
2. Tag and push: `git tag v0.2.0 && git push --tags`.
3. Create a GitHub Release for that tag.

`.github/workflows/publish.yml` then verifies the tag matches the package
version, installs, builds, tests, and publishes. npm generates a provenance
attestation automatically.

The tag check exists because a release tagged `v0.2.0` that ships
`package.json` 0.1.0 would publish the wrong version under the right name, and
npm has no undo.

### One-time setup

Trusted publishing has to be configured once on npmjs.com, under the package's
**Settings → Trusted Publisher**:

| Field | Value |
| --- | --- |
| Publisher | GitHub Actions |
| Organization or user | `saade` |
| Repository | `materialwind` |
| Workflow filename | `publish.yml` |
| Environment | *(leave empty)* |
| Allowed actions | `npm publish` |

npm generally requires the package to exist before a trusted publisher can be
configured, so the **first** release may need a manual `npm publish` from
`materialwind/` while logged in locally. Every release after that runs from CI.

## Credits

- **[tailwind-material-colors][tmc]**, **[tailwind-material-surfaces][tms]**,
  **[tailwind-mode-aware-colors][tmac]** — [Javier Morales][javier] (MIT). The
  Tailwind 3 originals this project is a rewrite of; the plugin's whole shape,
  its state-layer opacities and its runtime re-theming approach come from them.
- **[material-theme-builder][mtb]** — [abernier][abernier] (MIT). The
  hue-from-your-color, chroma-from-the-scheme rule used when pinning core colors.
- **[material-color-utilities][mcu]** — Google (Apache-2.0). The color engine,
  bundled into the published package. See
  [`materialwind/THIRD-PARTY-NOTICES.md`](materialwind/THIRD-PARTY-NOTICES.md).

[tmc]: https://github.com/JavierM42/tailwind-material-colors
[tms]: https://github.com/JavierM42/tailwind-material-surfaces
[tmac]: https://github.com/JavierM42/tailwind-mode-aware-colors
[javier]: https://github.com/JavierM42
[mtb]: https://github.com/abernier/material-theme-builder
[abernier]: https://github.com/abernier
[mcu]: https://github.com/material-foundation/material-color-utilities

## License

MIT for materialwind itself. Bundled third-party code keeps its own license —
see [`materialwind/THIRD-PARTY-NOTICES.md`](materialwind/THIRD-PARTY-NOTICES.md).
