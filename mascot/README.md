# Patch, the Space Works mascot

Patch is an **African painted wolf** (African wild dog, *Lycaon pictus*) with huge round ears and a
patchwork coat. It carries a wrench in its mouth, like a dog bringing back a stick, inside a Maker Teal
badge with a dotted orbit.

## Why a painted wolf

Space Works is free, open-source software for makerspaces and tool libraries: shared tools, shared
benches, borrowing and returning, and building together. We wanted a mascot whose real behaviour
matches that, not just one that looks friendly.

| What painted wolves do | What it says about Space Works |
|---|---|
| **No two coats are alike.** Every dog has its own patchwork of colours. | A community of very different makers, all one pack. |
| **They vote by sneezing.** Before a hunt, the pack sneezes; once enough members sneeze, the pack moves ([Walker et al., *Proc. R. Soc. B*, 2017](https://www.unsw.edu.au/newsroom/news/2017/09/something-to-sneeze-about--democratic-voting-in-african-wild-dog)). | The community decides together. Everyone gets a voice. |
| **They look after everyone.** Pups get priority at the food, and the pack brings food back for injured, sick and old members ([Tsavo Trust](https://tsavotrust.org/it-takes-a-pack-the-extraordinary-family-life-of-african-wild-dogs/)). | A commons: access for everyone, nobody left behind. |
| **They succeed as a team**, not through one strong individual. | Collaboration over lone genius. |
| **They are endangered.** | A real story and a cause worth telling. |

Honest detail: sneeze votes are not equal. When the dominant pair joins in, about three sneezes are
enough, against about ten otherwise. Say "everyone gets a voice", not "one dog, one vote".

**Why not something else?** Golden retrievers and sloths are everywhere. The sea otter is taken by T4GC.
The octopus belongs to GitHub, the crab to Rust, and the maker world is full of robots (Make:'s Makey,
Adafruit's Adabot) and skull-and-wrench marks (Hackaday). We found no tool library with a mascot and no
software brand using a painted wolf.

## Why "Patch"

- **The patchwork coat** that makes every painted wolf unique.
- **Patching things up**: repair and maker culture.
- **A software patch.**

Short, friendly and easy to say in any language.

## The files

Patch is the artwork in the two approved concept sheets in [`concept/`](concept/). Nothing was redrawn
by hand. Every piece comes in three forms:

| Folder | What it is | Detail |
|---|---|---|
| `mascot/` (this folder) | **Full vectors**: each piece traced to a colour SVG at the most faithful settings measured, plus high-resolution PNGs and animated WebPs rendered from those vectors, and GIFs of the loops | Sharp at any size |
| [`original/`](original/) | **The original pixels**: each piece cut from the sheet exactly, lossless PNG and WebP | Nothing lost, at the sheet's own size |
| [`compressed/`](compressed/) | **Compressed copies**: a lighter traced SVG that renders anywhere, the full SVG gzipped as `.svgz` (lossless), and a small animated WebP | Lite SVG is close at normal sizes; SVGZ is identical to the full SVG |

### Pose and sneeze loop (from `concept/patch-concept-sheet.webp`)

| File | Full | Original | Compressed |
|---|---|---|---|
| `patch` (hero pose) | `patch.svg` (6.5 MB), `patch.png` 2560 px | `original/patch.png` 640 px | `compressed/patch.svg` (956 KB), `.svgz` (2.4 MB) |
| `patch-animated` (7-second loop) | `.svg` (16.5 MB), `.webp` 544 px, `.gif` 272 px | `original/patch-animated.webp` 272 px | `compressed/patch-animated.svg` (2.7 MB), `.svgz` (6.1 MB), `.webp` 272 px |
| `frames/patch-0N-*` (eight frames) | `.svg` and `.png` 1088 px | `.png` 272 px | `.svg` and `.svgz` |

### Walk cycle (from `concept/patch-walk-sheet.webp`)

| File | Full | Original | Compressed |
|---|---|---|---|
| `walk/patch-walk` (walking pose) | `.svg` (2.2 MB), `.png` 1920 × 1440 | `.png` 480 × 360 | `.svg` (359 KB), `.svgz` (814 KB) |
| `walk/patch-walk-animated` (0.96 s loop) | `.svg` (6.9 MB), `.webp` 512 × 352, `.gif` 256 × 176 | `.webp` 256 × 176 | `.svg` (1.2 MB), `.svgz` (2.6 MB), `.webp` 256 × 176 |
| `walk/frames/patch-walk-0N` (eight frames) | `.svg` and `.png` 1024 × 704 | `.png` 256 × 176 | `.svg` and `.svgz` |

### Walking left (from the walk cycle)

The approved left-facing walk, for anything that moves Patch to the left (a pet that follows the
pointer, a loan heading back). It is the walk cycle mirrored exactly by the script, never by hand, so
it shows Patch's other side. Same sizes, frames and timing as the walk cycle:

| File | Full | Original | Compressed |
|---|---|---|---|
| `walk-left/patch-walk-left` (walking pose) | `.svg`, `.png` 1920 × 1440 | `.png` 480 × 360 | `.svg`, `.svgz` |
| `walk-left/patch-walk-left-animated` (0.96 s loop) | `.svg`, `.webp` 512 × 352, `.gif` 256 × 176 | `.webp` 256 × 176 | `.svg`, `.svgz`, `.webp` 256 × 176 |
| `walk-left/frames/patch-walk-left-0N` (eight frames) | `.svg` and `.png` 1024 × 704 | `.png` 256 × 176 | `.svg` and `.svgz` |

Frame N of `walk-left/` is frame N of `walk/` facing the other way, on the same ground line, so you
can switch direction mid-stride without a jump.

### On dark surfaces (`dark/`)

Patch's thick dark outline almost disappears on Deep Ink: it measures about 1.0–2.3:1 against it,
against 6–14.5:1 on Warm Cream. So `dark/` has every piece with a **thin Warm Cream (#FFF4E8) die-cut
sticker border**, about 4 px at the walk frame's 256 px width and scaled with the image. The art inside
is untouched: same pixels, colours, frames and timing. **Use `dark/` on dark surfaces only** (Deep Ink
and the dark theme's panels); on Warm Cream, white and the light brand colours use the plain files.
This border is the one approved exception to the "no outlines" rule below.

| File | `dark/` (full vectors and original pixels) | `dark/compressed/` (product UI) |
|---|---|---|
| `patch` (hero pose) | `.svg` (6.5 MB), `.png` 642 × 642 | `.svg` (0.9 MB), `.svgz` (2.4 MB), `.webp` 321 px |
| `patch-animated` (7-second loop) | `.svg` (16.5 MB), `.webp` and `.gif` 272 px | `.svg` (2.7 MB), `.svgz` (6.2 MB), `.webp` 272 px |
| `frames/patch-0N-*` (eight frames) | `.svg`, `.png` 272 px | `.svg`, `.svgz`, `.webp` 272 px |
| `walk/patch-walk`, `walk-left/patch-walk-left` (walking poses) | `.svg` (2.2 MB), `.png` 484 × 364 | `.svg` (0.4 MB), `.svgz` (0.8 MB), `.webp` 484 × 364 |
| `walk/patch-walk-animated`, `walk-left/patch-walk-left-animated` (0.96 s loops) | `.svg` (7.0 MB), `.webp` and `.gif` 256 × 176 | `.svg` (1.2 MB), `.svgz` (2.6 MB), `.webp` 256 × 176 |
| `walk/frames/patch-walk-0N`, `walk-left/frames/patch-walk-left-0N` (eight frames each) | `.svg`, `.png` 256 × 176 | `.svg`, `.svgz`, `.webp` 256 × 176 |

Frames and loops keep their canvas, so a dark file drops in for its light twin and frames still line up.
The hero and the walking poses are padded by 1–2 px per side so the border is never clipped; their SVGs
are padded the same, so a dark SVG and its PNG are the same size. The dark SVGs are the light SVGs with
the border added as Warm Cream vector paths under the art, which is unchanged; in a loop, each frame has
its own border. The PNGs and WebPs are built from `original/`, so they stop at the sheet's own size: for
bigger, use the SVG.

**GIFs.** Each loop also comes as a GIF, light (`patch-animated.gif`, `walk/…`, `walk-left/…`) and dark
(`dark/…`), for email and chat tools that can't play an animated WebP. They have the original pixels,
frames and timing, but GIF has only 256 colours and hard-edged transparency (no soft edges), so prefer the
WebP or SVG wherever they work.

**Which one to use:**

- **Product UI** (apps, the web, chat): the animated **WebP**, or `compressed/` for the lightest. On a
  dark surface, the same file from `dark/compressed/`.
- **Big screens, print, merch, anything scaled up:** the full **SVG**.
- **When every pixel matters** (editing, retouching, a new export): `original/`, Patch exactly as drawn.
- **Storage or transfer of the full vectors:** the `.svgz`. Browsers only show `.svgz` when the server
  sends it with `Content-Encoding: gzip`, so use the plain `.svg` on web pages.

Frames on the same canvas line up exactly: the sneeze frames on the teal badge, the walk frames on the
ground shadow. Swap them and Patch doesn't jump. The walk's ground shadow is a vector capsule tinted to
match the sheet on Warm Cream; on other surfaces it darkens them gently. (In `original/` it's removed
with the sheet's background.)

```html
<img src="design/mascot/patch-animated.webp" width="136" height="136" alt="Patch, the Space Works mascot">
<img src="design/mascot/walk/patch-walk-animated.webp" width="128" height="88" alt="Patch walking">
```

The animated SVGs use CSS only, so they play in a plain `<img>` and show one still frame when reduced
motion is on.

### How the files are made

`site/scripts/cut-mascot.mjs` builds all of it from the sheets. It cuts each piece out (flood-filling the
sheet's cream away from the edges, so cream fur inside Patch stays), saves those exact pixels to
`original/`, upscales 4× and traces with [vtracer](https://github.com/visioncortex/vtracer), then renders
the PNGs and WebPs from the vectors. To rebuild after replacing a sheet (from `site/`; the concept sheet
takes about ten minutes):

```bash
node scripts/cut-mascot.mjs
```

Pass `concept` or `walk` to rebuild just one sheet. If a new sheet has a different layout, update its
boxes in `SHEETS` at the top of the script first. A higher-resolution sheet gives finer vectors.
Rebuilding the walk also rebuilds `walk-left/`; pass `walk-left` to rebuild only that, from the current
walk files, in a few seconds and without tracing.

`site/scripts/dark-mascot.mjs` builds `dark/` from `original/` and the light SVGs in about a minute; run
it after `cut-mascot.mjs`. The border is three passes, each its own sharp pipeline: blur the alpha (sigma =
0.6 × radius, radius = 4 × width ÷ 256, in 16 bits so the edge stays smooth) to grow the silhouette,
threshold at 6 for a crisp edge, then blur 0.6 to anti-alias. The shape is filled Warm Cream and Patch is
laid on top. For the SVGs the same passes run at 4×, and the shape, cut at half, is traced to vector
paths; the lite SVGs reuse that trace scaled to their 3×, so every dark file has the same border. `site/scripts/gif-mascot.mjs` then builds the six
GIFs from the lossless loops in a few seconds.

```bash
node scripts/dark-mascot.mjs
node scripts/gif-mascot.mjs
```

**How faithful the vectors are.** The trace settings were chosen by rendering each candidate and scoring
it against the sheet pixel by pixel. At the chosen settings about 0.27% of pixels differ visibly. Going
finer, upscaling further or sharpening first didn't improve it. What a vector can't hold is soft shading:
a trace is made of flat colour shapes, so the subtle brown iris gradient inside each eye merges into the
pupil. That detail is kept in `original/`.

## Anatomy

| Part | What it looks like |
|---|---|
| **Ears** | Very large and rounded, dark rim, brown inside with cream tufts. The signature feature. |
| **Face** | Warm tan coat, a dark stripe from the forehead into a dark brown snout, cream cheeks, dark nose. |
| **Coat** | Patchwork of tan, cream, brown and near-black, asymmetric on purpose. Don't mirror it. |
| **Eyes** | Big, dark and kind, with bright highlights. Patch is never fierce. |
| **Wrench** | Silver, held sideways across the mouth. |
| **Badge** | Maker Teal, a Warm Yellow dotted orbit, Warm Yellow ringed planets, Citron, Workshop Orange and Sky Blue sparkles. The ears break out of the top of the badge. |
| **Walking Patch** | Side view, no badge: a thick dark outline, a bushy cream-tipped tail up, the wrench held forward, a soft ground shadow. |

The badge and accents use the brand colours. The coat browns and tans and the silver wrench belong to the
artwork itself; don't reuse them as UI colours.

## Animation

`patch-animated.webp` and `patch-animated.svg` play the concept sheet's 7-second loop, frame by frame:

| Time | Frame | File |
|---|---|---|
| 0.0 s | Idle (breathing) | `frames/patch-01-idle` |
| 2.0 s | Blink | `frames/patch-02-blink` |
| 3.5 s | Left ear twitch | `frames/patch-03-left-ear` |
| 4.0 s | Right ear twitch | `frames/patch-04-right-ear` |
| 5.3 s | Sneeze (prep) | `frames/patch-05-sneeze-prep` |
| 5.6 s | **Sneeze!** The sneeze vote | `frames/patch-06-sneeze` |
| 6.0 s | Recover | `frames/patch-07-recover` |
| 6.6–7.0 s | Back to idle | `frames/patch-08-back-to-idle` |

Between those moments Patch holds the idle frame: the blink lasts 0.2 s and each ear twitch 0.3 s, then
the sneeze runs straight through from 5.3 s to 7.0 s. The exact timing lives in `timeline` in
`site/scripts/cut-mascot.mjs`. With reduced motion on, the SVG shows the idle frame only.

The **walk cycle** plays its eight frames at 120 ms each (0.96 s per loop). Frames 6 and 7 have Patch's
eyes closed happily mid-stride, exactly as in the walk sheet. With reduced motion on, the SVG shows the
first frame.

The sneeze is the signature moment. In product, save it for moments when the community acts together:
a vote passing, a project filling up, a tool coming back to the shelf. Use `frames/` to play just the
sneeze (frames 5 to 7) at those moments.

## Where Patch shows up

Patch is the friendly face of the product. **The box symbol is still the logo.**

- **Use Patch for:** empty states, onboarding, loading, success moments, 404 and error pages, the
  website hero, docs, social posts, stickers, merch and event signage. The walk suits loading and
  anything in motion: a loan on its way, a tool being returned.
- **Use the logo for:** the app header, the favicon, the app icon, legal pages and anywhere the brand
  must be identified. Don't put Patch inside or next to the box symbol as a combined mark.
- **One bold moment per layout.** Patch counts as that moment. Don't add an Unbounded phrase, an orange
  flap and Patch on the same screen.

## Keep Patch intact

1. **Don't** recolour, filter or redraw Patch. Use these files as they are.
2. **Don't** stretch, skew or mirror Patch. The coat is asymmetric on purpose. To show Patch heading
   left, use the approved `walk-left/` files; never flip the other files with CSS or an editor.
3. **Don't** add shadows, glows, gradients or outlines. The one exception is the Warm Cream sticker
   border of the approved `dark/` files; don't draw your own.
4. **Don't** make Patch fierce: no bared teeth, angry brows or hunting poses.
5. **Don't** scale up the PNGs or WebPs past their size. Use the full SVGs when you need bigger.
6. **Do** keep clear space of a quarter of the badge's height around Patch.
7. **Do** use the `dark/` files on dark surfaces: Patch's dark ear rims sit close to Deep Ink. Warm
   Cream, white, Citron, Sky Blue and Workshop Orange surfaces all work with the plain files.

New poses (waving, sleeping, holding other tools) should come from the same artwork and style, and be
added here when approved.
