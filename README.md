# SpaceWorks-Design

The Space Works design system: brand guidelines, logo masters, icons, fonts, design tokens and the UX
pattern specs. Use it as a git submodule in any Space Works project so every surface draws from one source.

```bash
git submodule add https://github.com/SpaceWorks-HQ/SpaceWorks-Design.git design
```

## Contents

| Folder | What it holds |
|---|---|
| `brand/` | `space-works-brand-guidelines-v1.pdf` — the source of truth for logo, colour, type, icons and voice |
| `logo/` | Ten vector masters exported directly from Figma, with matching 4× PNGs: `symbol`, `symbol-reversed`, `symbol-one-colour-ink`, `lockup-stacked`, `lockup-stacked-reversed`, `lockup-stacked-one-colour-ink`, `lockup-horizontal`, `lockup-horizontal-reversed`, `lockup-horizontal-one-colour-ink`, `app-icon` |
| `icons/` | `favicon.svg`, PNG app icons (16, 32, 180, 192, 512) and the 1200×630 social card |
| `fonts/` | Gilroy Regular, Medium, Semibold and Bold (WOFF), plus Unbounded (WOFF2). Legacy faces retained for existing consumers. See `fonts/README.md`. |
| `tokens/` | `tokens.css` (`@font-face` + light/dark colour variables as RGB triplets) and `tokens.json` (the same colours as hex, plus the seven brand colours) |
| `docs/` | `ui-brand-spec.md` (token derivations, contrast ratios, states, status pills, type scale, logo use), `ux-yuyu-spec.md` (UX patterns from Yuyu, reusable layouts, navigation, screen specs), `ux-screens-longtail.md` (remaining screens) |
| `references/yuyu/` | Reference boards from [Yuyu](https://github.com/twilighty-abhi/yuyu) that the UX patterns and layouts are modelled on |

## Brand at a glance

- **Colours:** Deep Ink `#142C2A`, Maker Teal `#006E63`, Workshop Orange `#FF7447`, Citron `#DFFF8F`,
  Sky Blue `#B5CDFF`, Warm Yellow `#FFD447`, Warm Cream `#FFF4E8`. Neutral first, accent second. Never
  orange text on cream. Every status pairs colour with a word or icon.
- **Type:** Gilroy Semibold/Bold for headings, Gilroy Regular/Medium for body and interface text,
  Unbounded for one short accent phrase per layout.
- **Logo:** use the masters as supplied — no stretching, rotating, recolouring or effects. Clear space is
  a quarter of the symbol height on every side. Symbol at least 48 px; primary lockup at least 180 px wide.
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

The UX patterns, layouts and interaction details are modelled on [Yuyu](https://github.com/twilighty-abhi/yuyu)
(reference boards in `references/yuyu/`). The visual identity — colour, type, logo, icons and voice — comes only from the Space Works
brand guidelines in `brand/`.

## Export provenance

The kit was exported from the connected Figma file on 15 October 2026 using MCP Go+.
`brand/figma-styles.json` records source node IDs, all seven paint styles and ten text styles.
`brand/guidelines/` contains all 17 pages as individual SVG and PNG files. The logo library is
also exported as `brand/logo-masters.svg` and `.png`. SVG text is outlined; the editable source remains in Figma.

See [brand/README.md](brand/README.md) for asset selection and [fonts/README.md](fonts/README.md) for font provenance.
