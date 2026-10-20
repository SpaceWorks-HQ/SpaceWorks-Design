// Builds mascot/dark/: Patch for dark surfaces, from the files cut-mascot.mjs already wrote. Patch's
// dark outline almost disappears on Deep Ink, so every piece gets a thin Warm Cream die-cut sticker
// border, and is otherwise untouched (same pixels, same colours, same frames and timing):
//
//   mascot/dark/<file>             the original pixels (mascot/original/) with the border: lossless PNGs,
//                                  and the loops as lossless animated WebPs
//   mascot/dark/compressed/<file>  lighter WebPs for product UI: the hero at 320 px, the frames and poses
//                                  at their own size, and small animated loops
//
// The border is 4 px at the walk frame's 256 px width and scales with the image: radius = 4 * width / 256.
// It is drawn in three passes, each its own sharp pipeline because sharp keeps only the last blur():
// blur the alpha (sigma = radius * 0.6) to grow the silhouette, threshold it at 6 for a crisp edge,
// then blur 0.6 to anti-alias. That shape is filled Warm Cream and Patch is composited on top.
//
// Frames and their loop keep their canvas, so a dark file drops in for its light twin and frames still
// line up. A piece whose border would reach the canvas edge (the hero and the walking poses) is padded
// evenly on every side instead; the README lists the sizes.
//
// Run from site/ after cut-mascot.mjs: node scripts/dark-mascot.mjs
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const mascot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'mascot');
const original = (...p) => join(mascot, 'original', ...p);
const dark = (...p) => join(mascot, 'dark', ...p);
const CREAM = { r: 0xff, g: 0xf4, b: 0xe8 }; // Warm Cream #FFF4E8
const radiusFor = (width) => (4 * width) / 256;
const STILL = { quality: 85, alphaQuality: 100, effort: 6 };
const LOOP = { quality: 80, alphaQuality: 90, effort: 6 }; // the light compressed loops' settings

function write(file, bytes) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, bytes);
}

// The sticker on a canvas grown by `room` px per side, so the border is never clipped while measuring.
async function sticker(input, width, height, room) {
  const radius = radiusFor(width);
  const art = await sharp(input).ensureAlpha()
    .extend({ top: room, bottom: room, left: room, right: room, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toBuffer();
  const [w, h] = [width + 2 * room, height + 2 * room];
  const grown = await sharp(art).extractChannel('alpha').blur(radius * 0.6).png().toBuffer();
  const hard = await sharp(grown).threshold(6).png().toBuffer();
  const alpha = await sharp(hard).blur(0.6).toColourspace('b-w').raw().toBuffer();
  const plate = await sharp({ create: { width: w, height: h, channels: 3, background: CREAM } })
    .joinChannel(alpha, { raw: { width: w, height: h, channels: 1 } }).png().toBuffer();
  return { alpha, image: await sharp(plate).composite([{ input: art }]).png().toBuffer() };
}

// Builds one group of pieces that share a canvas (a pose, or a set of frames and its loop).
// Returns the padding the group needed so the border clears the canvas edge by at least 1 px.
async function group(pieces, width, height) {
  const room = Math.ceil(radiusFor(width) * 2) + 2;
  const [w, h] = [width + 2 * room, height + 2 * room];
  const built = [];
  let pad = 0;
  for (const piece of pieces) {
    const frames = [];
    for (const input of piece.inputs) {
      const s = await sticker(input, width, height, room);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (s.alpha[y * w + x] === 0) continue;
        const reach = Math.max(room - x, room - y, x - (room + width - 1), y - (room + height - 1));
        pad = Math.max(pad, reach + 1);
      }
      frames.push(s.image);
    }
    built.push({ ...piece, frames });
  }
  const crop = (image) => sharp(image).extract({ left: room - pad, top: room - pad, width: width + 2 * pad, height: height + 2 * pad }).png().toBuffer();
  for (const piece of built) piece.frames = await Promise.all(piece.frames.map(crop));
  return { built, pad, size: [width + 2 * pad, height + 2 * pad] };
}

const pngs = (dir) => readdirSync(original(dir)).filter((f) => f.endsWith('.png')).sort().map((f) => join(dir, f.slice(0, -4)));
async function pages(file) {
  const { pages: count, delay } = await sharp(file, { animated: true }).metadata();
  const frames = await Promise.all(Array.from({ length: count }, (_, page) => sharp(file, { page }).png().toBuffer()));
  return { frames, delay };
}
const animated = (frames, delay, opts) => sharp(frames, { join: { animated: true } }).webp({ loop: 0, delay, ...opts }).toBuffer();

async function writeGroup(label, pieces, [width, height], compressedWidth = width) {
  const { built, pad, size } = await group(pieces, width, height);
  for (const piece of built) {
    if (piece.delay) {
      write(dark(`${piece.out}.webp`), await animated(piece.frames, piece.delay, { lossless: true, effort: 6 }));
      write(dark('compressed', `${piece.out}.webp`), await animated(piece.frames, piece.delay, LOOP));
    } else {
      write(dark(`${piece.out}.png`), await sharp(piece.frames[0]).png({ compressionLevel: 9 }).toBuffer());
      const scaled = Math.round((compressedWidth * size[0]) / width);
      write(dark('compressed', `${piece.out}.webp`), await sharp(piece.frames[0]).resize({ width: scaled }).webp(STILL).toBuffer());
    }
  }
  console.log(`dark-mascot: ${label}: ${built.length} files, ${size[0]}x${size[1]}${pad ? ` (padded ${pad} px per side)` : ''}`);
}

rmSync(dark(), { recursive: true, force: true });
const still = (out) => ({ out, inputs: [original(`${out}.png`)] });
const loop = async (out) => ({ out, ...(await pages(original(`${out}.webp`))), inputs: [] });
async function frameGroup(label, frameDir, loopOut, size) {
  const l = await loop(loopOut);
  await writeGroup(label, [...pngs(frameDir).map(still), { out: l.out, delay: l.delay, inputs: l.frames }], size);
}

await writeGroup('hero', [still('patch')], [640, 640], 320);
await frameGroup('sneeze frames and loop', 'frames', 'patch-animated', [272, 272]);
for (const side of ['walk', 'walk-left']) {
  const name = side === 'walk' ? 'patch-walk' : 'patch-walk-left';
  await writeGroup(`${side} pose`, [still(`${side}/${name}`)], [480, 360]);
  await frameGroup(`${side} frames and loop`, `${side}/frames`, `${side}/${name}-animated`, [256, 176]);
}
