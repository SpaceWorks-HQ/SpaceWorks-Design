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
| `logo/` | Vector masters extracted verbatim from the guidelines: `symbol`, `symbol-reversed`, `symbol-one-colour-ink`, `lockup-stacked`, `lockup-stacked-reversed`, `lockup-stacked-one-colour-ink`, `lockup-horizontal`, `app-icon` |
| `icons/` | `favicon.svg`, PNG app icons (16, 32, 180, 192, 512) and the 1200×630 social card |
| `fonts/` | Self-hostable web fonts: Gilroy ExtraBold + Light (official free release), Outfit and Unbounded (OFL), with licences in `fonts/LICENSES/` |
| `tokens/` | `tokens.css` (`@font-face` + light/dark colour variables as RGB triplets) and `tokens.json` (the same colours as hex, plus the seven brand colours) |
| `docs/` | `ui-brand-spec.md` (token derivations, contrast ratios, states, status pills, type scale, logo use), `ux-yuyu-spec.md` (UX patterns from Yuyu, reusable layouts, navigation, screen specs), `ux-screens-longtail.md` (remaining screens) |

## Brand at a glance

- **Colours:** Deep Ink `#142C2A`, Maker Teal `#006E63`, Workshop Orange `#FF7447`, Citron `#DFFF8F`,
  Sky Blue `#B5CDFF`, Warm Yellow `#FFD447`, Warm Cream `#FFF4E8`. Neutral first, accent second. Never
  orange text on cream. Every status pairs colour with a word or icon.
- **Type:** Gilroy ExtraBold for headings and display numbers, Outfit for body and interface text,
  Unbounded for one short accent phrase per layout.
- **Logo:** use the masters as supplied — no stretching, rotating, recolouring or effects. Clear space is
  a quarter of the symbol height on every side. Symbol at least 48 px; primary lockup at least 180 px wide.
- **Voice:** clear, warm and specific. "No parts added yet. Add your first item." Brand name in copy:
  Space Works. Wordmark: space works.

## Using the tokens

```css
@import "design/tokens/tokens.css";

body { background: rgb(var(--color-bg)); color: rgb(var(--color-ink)); font-family: "Outfit", sans-serif; }
h1, h2, h3 { font-family: "Gilroy", "Outfit", sans-serif; font-weight: 800; }
.button-primary { background: rgb(var(--color-accent)); color: rgb(var(--color-on-accent)); }
```

Add the class `dark` to `<html>` for dark mode. The font URLs in `tokens.css` are relative to the
`tokens/` folder.

## Credits

The UX patterns, layouts and interaction details are modelled on [Yuyu](https://github.com/twilighty-abhi/yuyu).
The Yuyu reference boards are not distributed in this repository; keep local copies in `references/yuyu/`
(gitignored) when comparing designs. The visual identity — colour, type, logo, icons and voice — comes only from the Space Works
brand guidelines in `brand/`.

## Licences

Gilroy is used under the Radomir Tinkov Free Font EULA (web use via `@font-face` permitted); Outfit and
Unbounded are under the SIL Open Font License 1.1. See `fonts/LICENSES/`.
