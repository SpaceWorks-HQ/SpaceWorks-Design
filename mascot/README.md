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

Patch is the artwork in the approved concept sheet, cut out as it is. Nothing was redrawn.

| File | Use it for | Size |
|---|---|---|
| [`patch.png`](patch.png) | The hero pose: about pages, the website, docs, social posts, stickers | 640 × 640, transparent |
| [`patch-animated.webp`](patch-animated.webp) | The 7-second loop, anywhere an image goes: apps, the web, chat | 272 × 272, transparent |
| [`patch-animated.svg`](patch-animated.svg) | The same loop as an SVG: the eight frames embedded and timed with CSS. Respects reduced motion. | 272 × 272, transparent |
| [`frames/`](frames/) | The eight animation frames as separate PNGs, for app animation code or building a Lottie | 272 × 272 each |
| [`concept/patch-concept-sheet.webp`](concept/patch-concept-sheet.webp) | The approved concept sheet: pose, every frame, palette, sizes and backgrounds. **The source of truth.** | 1774 × 887 |

Every frame sits on the same canvas with the badge in the same place, so the frames can be swapped
without Patch jumping.

```html
<img src="design/mascot/patch-animated.webp" width="136" height="136" alt="Patch, the Space Works mascot">
```

The files are raster, cut from the sheet at its own resolution. Use the hero up to about 320 px wide and
the animation up to about 136 px (half size, so it stays sharp on high-density screens). For larger or
print use, export the original artwork at a higher resolution, replace
`concept/patch-concept-sheet.webp` and re-run the cutter (from `site/`):

```bash
node scripts/cut-mascot.mjs
```

If the new sheet has a different size or layout, update the boxes at the top of
`site/scripts/cut-mascot.mjs` first.

## Anatomy

| Part | What it looks like |
|---|---|
| **Ears** | Very large and rounded, dark rim, brown inside with cream tufts. The signature feature. |
| **Face** | Warm tan coat, a dark stripe from the forehead into a dark brown snout, cream cheeks, dark nose. |
| **Coat** | Patchwork of tan, cream, brown and near-black, asymmetric on purpose. Don't mirror it. |
| **Eyes** | Big, dark and kind, with bright highlights. Patch is never fierce. |
| **Wrench** | Silver, held sideways across the mouth. |
| **Badge** | Maker Teal, a Warm Yellow dotted orbit, Warm Yellow ringed planets, Citron, Workshop Orange and Sky Blue sparkles. The ears break out of the top of the badge. |

The badge and accents use the brand colours. The coat browns and tans and the silver wrench belong to the
artwork itself; don't reuse them as UI colours.

## Animation

`patch-animated.webp` and `patch-animated.svg` play the concept sheet's 7-second loop, frame by frame:

| Time | Frame | File |
|---|---|---|
| 0.0 s | Idle (breathing) | `frames/patch-01-idle.png` |
| 2.0 s | Blink | `frames/patch-02-blink.png` |
| 3.5 s | Left ear twitch | `frames/patch-03-left-ear.png` |
| 4.0 s | Right ear twitch | `frames/patch-04-right-ear.png` |
| 5.3 s | Sneeze (prep) | `frames/patch-05-sneeze-prep.png` |
| 5.6 s | **Sneeze!** The sneeze vote | `frames/patch-06-sneeze.png` |
| 6.0 s | Recover | `frames/patch-07-recover.png` |
| 6.6–7.0 s | Back to idle | `frames/patch-08-back-to-idle.png` |

Between those moments Patch holds the idle frame: the blink lasts 0.2 s and each ear twitch 0.3 s, then
the sneeze runs straight through from 5.3 s to 7.0 s. The exact timing lives in `TIMELINE` in
`site/scripts/cut-mascot.mjs`. With reduced motion on, the SVG shows the idle frame only.

The sneeze is the signature moment. In product, save it for moments when the community acts together:
a vote passing, a project filling up, a tool coming back to the shelf. Use `frames/` to play just the
sneeze (frames 5 to 7) at those moments.

## Where Patch shows up

Patch is the friendly face of the product. **The box symbol is still the logo.**

- **Use Patch for:** empty states, onboarding, loading, success moments, 404 and error pages, the
  website hero, docs, social posts, stickers, merch and event signage.
- **Use the logo for:** the app header, the favicon, the app icon, legal pages and anywhere the brand
  must be identified. Don't put Patch inside or next to the box symbol as a combined mark.
- **One bold moment per layout.** Patch counts as that moment. Don't add an Unbounded phrase, an orange
  flap and Patch on the same screen.

## Keep Patch intact

1. **Don't** recolour, filter or redraw Patch. Use the cut-outs as they are.
2. **Don't** stretch, skew or mirror Patch. The coat is asymmetric on purpose.
3. **Don't** add shadows, glows, gradients or outlines.
4. **Don't** make Patch fierce: no bared teeth, angry brows or hunting poses.
5. **Don't** enlarge the files past the sizes above. Re-export from the original instead.
6. **Do** keep clear space of a quarter of the badge's height around Patch.
7. **Do** check contrast on dark surfaces: Patch's dark ear rims sit close to Deep Ink. Warm Cream,
   white, Citron, Sky Blue and Workshop Orange surfaces all work.

New poses (waving, sleeping, holding other tools) should come from the same artwork and style, and be
added here when approved.
