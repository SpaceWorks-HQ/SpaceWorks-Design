// Builds GIFs of Patch's three loops, for email and chat tools that can't play an animated WebP:
//
//   mascot/<loop>.gif       from original/<loop>.webp: the sheet's pixels, for light surfaces
//   mascot/dark/<loop>.gif  from dark/<loop>.webp: the same with the sticker border, for dark surfaces
//
// Same frames, size and timing as the lossless WebPs. GIF has 256 colours and on/off transparency, so
// alpha is cut at half (the colours are left alone) and every frame is written complete, so nothing
// from the frame before shows through. Prefer the WebP or SVG wherever they work.
//
// Run from site/ after cut-mascot.mjs and dark-mascot.mjs: node scripts/gif-mascot.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const mascot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'mascot');
const LOOPS = ['patch-animated', 'walk/patch-walk-animated', 'walk-left/patch-walk-left-animated'];
const SETS = [
  ['original', ''],
  ['dark', 'dark'],
];

for (const [from, to] of SETS) {
  for (const loop of LOOPS) {
    const input = join(mascot, from, `${loop}.webp`);
    const { pages, delay, width, pageHeight } = await sharp(input, { animated: true }).metadata();
    const frames = [];
    for (let page = 0; page < pages; page++) {
      const { data, info } = await sharp(input, { page }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      for (let p = 3; p < data.length; p += 4) data[p] = data[p] >= 128 ? 255 : 0;
      frames.push(await sharp(data, { raw: info }).png().toBuffer());
    }
    const gif = await sharp(frames, { join: { animated: true } }).gif({ loop: 0, delay, effort: 10, dither: 1, reuse: true }).toBuffer();
    const out = join(mascot, to, `${loop}.gif`);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, gif);
    console.log(`gif-mascot: ${to ? `${to}/` : ''}${loop}.gif ${width}x${pageHeight}, ${pages} frames, ${Math.round(gif.length / 1024)} KB`);
  }
}
