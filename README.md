# SpaceWorks-Design

The Space Works design system: brand guidelines, logo masters, icons, fonts, design tokens and the UX
pattern specs. Use it as a git submodule in any Space Works project so every surface draws from one source.

```bash
git submodule add https://github.com/SpaceWorks-HQ/SpaceWorks-Design.git design
```

**Browse it at [spaceworks-hq.github.io/SpaceWorks-Design](https://spaceworks-hq.github.io/SpaceWorks-Design/)**: the logo
masters, colours, type, voice, every design token and the UI specs, published from this repository by
`site/` on every push to `main`. To run it locally: `cd site && npm install && npm run dev`.

## Contents

| Folder | What it holds |
|---|---|
| `brand/` | `space-works-brand-guidelines-v1.pdf` — the source of truth for logo, colour, type, icons and voice |
| `logo/` | Ten vector masters exported directly from Figma, with matching 4× PNGs: `symbol`, `symbol-reversed`, `symbol-one-colour-ink`, `lockup-stacked`, `lockup-stacked-reversed`, `lockup-stacked-one-colour-ink`, `lockup-horizontal`, `lockup-horizontal-reversed`, `lockup-horizontal-one-colour-ink`, `app-icon` |
| `mascot/` | **Patch**, the painted wolf mascot, cut from the approved concept sheets in `mascot/concept/` and traced to vector SVG: `patch.svg` (hero), `patch-animated.webp`/`.svg`/`.gif` (the 7-second sneeze loop) and its eight `frames/`, plus `walk/` (the walking pose, walk cycle and its frames) and `walk-left/` (the approved left-facing walk), with high-resolution PNGs. `mascot/original/` keeps every piece's exact pixels from the sheets (lossless) and `mascot/compressed/` has lighter SVGs, `.svgz` and small WebPs. `mascot/dark/` is every piece with a thin Warm Cream sticker border for dark surfaces only (full SVGs, lossless PNGs, WebPs and GIFs, plus lite SVGs, `.svgz` and small WebPs in `dark/compressed/`). Story and usage rules in `mascot/README.md` |
| `icons/` | `favicon.svg`, PNG app icons (16, 32, 180, 192, 512) and the 1200×630 social card |
| `fonts/` | Gilroy Regular, Medium, Semibold and Bold (WOFF), plus Unbounded (WOFF2). Legacy faces retained for existing consumers. See `fonts/README.md`. |
| `tokens/` | `tokens.css` (`@font-face` + light/dark colour variables as RGB triplets) and `tokens.json` (the same colours as hex, plus the seven brand colours) |
| `docs/` | `ui-brand-spec.md` (token derivations, contrast ratios, states, status pills, type scale, logo use), `ux-spec.md` (**Space Works UX**: our interaction patterns, reusable layouts, navigation and screen specs), `ux-screens-longtail.md` (remaining screens) |
| `screenshots/ux/` | Screenshots of Space Works UX in Space Works Events (light, dark and phone), used by the site's UX pages |
| `site/` | The Starlight website published to GitHub Pages; `scripts/sync-kit.mjs` copies the kit in at build time |
| `references/yuyu/` | The reference boards from [Yuyu](https://github.com/twilighty-abhi/yuyu) that inspired Space Works UX |

## Brand at a glance

- **Colours:** Deep Ink `#142C2A`, Maker Teal `#006E63`, Workshop Orange `#FF7447`, Citron `#DFFF8F`,
  Sky Blue `#B5CDFF`, Warm Yellow `#FFD447`, Warm Cream `#FFF4E8`. Neutral first, accent second. Never
  orange text on cream. Every status pairs colour with a word or icon.
- **Type:** Gilroy Semibold/Bold for headings, Gilroy Regular/Medium for body and interface text,
  Unbounded for one short accent phrase per layout.
- **Logo:** use the masters as supplied — no stretching, rotating, recolouring or effects. Clear space is
  a quarter of the symbol height on every side. Symbol at least 48 px; primary lockup at least 180 px wide.
- **Mascot:** Patch, an African painted wolf carrying a wrench. Painted wolves vote by sneezing and look
  after the whole pack, and no two coats are alike. Patch is the friendly face for empty states,
  onboarding and merch; the box symbol stays the logo. See [mascot/README.md](mascot/README.md).
- **Voice:** clear, warm and specific. "No parts added yet. Add your first item." Brand name in copy:
  Space Works. Wordmark: space works.

## Using the tokens

```css
@import "design/tokens/tokens.css";

body { background: rgb(var(--color-bg)); color: rgb(var(--color-ink)); font-family: var(--font-sans); }
h1, h2, h3 { font-family: var(--font-display); font-weight: 600; }
.button-primary { background: rgb(var(--color-accent)); color: rgb(var(--color-on-accent)); }
```

Add the class `dark` to `<html>` for dark mode. The font URLs in `tokens.css` are relative to the
`tokens/` folder.

## Credits

**Space Works UX** (the patterns, layouts and interaction details in `docs/ux-spec.md`) is our own
interaction system. It was inspired by [Yuyu](https://github.com/twilighty-abhi/yuyu), whose screens we
studied as reference boards (kept in `references/yuyu/`). The visual identity — colour, type, logo, icons and voice — comes only from the Space Works
brand guidelines in `brand/`.

## Export provenance

The kit was exported from the connected Figma file on 15 October 2026 using MCP Go+.
`brand/figma-styles.json` records source node IDs, all seven paint styles and ten text styles.
`brand/guidelines/` contains all 17 pages as individual SVG and PNG files. The logo library is
also exported as `brand/logo-masters.svg` and `.png`. SVG text is outlined; the editable source remains in Figma.

See [brand/README.md](brand/README.md) for asset selection and [fonts/README.md](fonts/README.md) for font provenance.

## License

Space Works design assets in this repository are licensed under the
**[GNU Affero General Public License v3](LICENSE)** (`AGPL-3.0-or-later`), the same as
[Space Works](https://github.com/SpaceWorks-HQ/SpaceWorks).

Third-party material keeps its own licence and is not relicensed: the fonts in `fonts/` (see
`fonts/LICENSES/` and [fonts/README.md](fonts/README.md)) and the Yuyu reference boards in
`references/yuyu/` (see [Yuyu](https://github.com/twilighty-abhi/yuyu)).
