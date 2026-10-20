// Builds mascot/dark/: Patch for dark surfaces, from the files cut-mascot.mjs already wrote. Patch's
// dark outline almost disappears on Deep Ink, so every piece gets a thin Warm Cream die-cut sticker
// border, and is otherwise untouched (same pixels, same colours, same frames and timing):
//
//   mascot/dark/<file>             the original pixels (mascot/original/) with the border: lossless PNGs,
//                                  and the loops as lossless animated WebPs; plus the full vector SVGs
//   mascot/dark/compressed/<file>  lighter WebPs for product UI: the hero at 320 px, the frames and poses
//                                  at their own size, and small animated loops; plus the lite SVGs and
//                                  the full SVGs gzipped as .svgz
//
// The dark SVGs are the light SVGs with the border added as Warm Cream vector paths under the art, which
// is copied byte for byte. The border is built the same way as the raster one, but at 4x, from the
// original pixels, and traced; the lite SVGs (3x) reuse that trace scaled. Each loop frame gets its own.
//
// The border is 4 px at the walk frame's 256 px width and scales with the image: radius = 4 * width / 256.
// It is drawn in three passes, each its own sharp pipeline because sharp keeps only the last blur():
// blur the alpha (sigma = radius * 0.6, in 16 bits) to grow the silhouette, threshold it at 6 for a crisp
// edge, then blur 0.6 to anti-alias. That shape is filled Warm Cream and Patch is composited on top.
//
// Frames and their loop keep their canvas, so a dark file drops in for its light twin and frames still
// line up. A piece whose border would reach the canvas edge (the hero and the walking poses) is padded
// evenly on every side instead; the README lists the sizes.
//
// Run from site/ after cut-mascot.mjs: node scripts/dark-mascot.mjs
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { ColorMode, Hierarchical, PathSimplifyMode, optimizeSync, vectorize } from '@neplex/vectorizer';

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

// Grows a silhouette (a one-channel PNG): blur it and keep everything at 6 of 255 or more. The threshold
// sits deep in the blur's faint tail, where 8-bit steps would show as a stepped edge, so it runs in 16 bits.
async function grow(silhouette, sigma) {
  const deep = await sharp(silhouette).extractChannel(0).toColourspace('grey16').png().toBuffer();
  const { data, info } = await sharp(deep).blur(sigma).toColourspace('grey16').raw({ depth: 'ushort' }).toBuffer({ resolveWithObject: true });
  if (info.channels !== 1 || info.depth !== 'ushort') throw new Error('grow: the blur is not 16-bit grey');
  const levels = new Uint16Array(data.buffer, data.byteOffset, data.length / 2);
  const hard = Buffer.alloc(levels.length);
  for (let p = 0; p < levels.length; p++) hard[p] = levels[p] >= 6 * 257 ? 255 : 0;
  return sharp(hard, { raw: { width: info.width, height: info.height, channels: 1 } }).png().toBuffer();
}

// The sticker on a canvas grown by `room` px per side, so the border is never clipped while measuring.
async function sticker(input, width, height, room) {
  const radius = radiusFor(width);
  const art = await sharp(input).ensureAlpha()
    .extend({ top: room, bottom: room, left: room, right: room, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png().toBuffer();
  const [w, h] = [width + 2 * room, height + 2 * room];
  const hard = await grow(await sharp(art).extractChannel('alpha').png().toBuffer(), radius * 0.6);
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
  return pad;
}

// The border as vectors: the same passes as sticker(), but at 4x, ending at a crisp threshold (the renderer
// anti-aliases a vector edge). The tracer draws black, so the silhouette is made black on white. Traced
// once at the full SVGs' 4x and scaled for the lite SVGs' 3x: a 3x trace follows the edge less closely.
// Returns Warm Cream paths in the art's own coordinates at scale k.
const BORDER = {
  colorMode: ColorMode.Binary, hierarchical: Hierarchical.Stacked, mode: PathSimplifyMode.Spline, filterSpeckle: 4,
  colorPrecision: 6, layerDifference: 16, cornerThreshold: 60, lengthThreshold: 4, maxIterations: 10, spliceThreshold: 45, pathPrecision: 1,
};
const K = 4;
const borders = new Map();
async function border(input, width, height, k) {
  const { room, paths } = await traced(input, width, height);
  return `<g transform="${k === K ? '' : `scale(${k / K}) `}translate(-${room} -${room})">${paths}</g>`;
}
function traced(input, width, height) {
  const k = K;
  if (!borders.has(input)) borders.set(input, (async () => {
    const radius = radiusFor(width) * k;
    const room = Math.ceil(radius * 2) + 2;
    // Alpha first, on its own: in one pipeline sharp extends before extracting, making the margin opaque.
    const art = await sharp(input).ensureAlpha().extractChannel('alpha').png().toBuffer();
    const alpha = await sharp(art).resize(width * k, height * k, { kernel: 'lanczos3' })
      .extend({ top: room, bottom: room, left: room, right: room, background: 'black' }).png().toBuffer();
    const hard = await grow(alpha, radius * 0.6);
    // The raster's anti-alias blur (0.6 px), cut at the middle where the edge is steep, gives its edge.
    const smooth = await sharp(hard).blur(0.6 * k).png().toBuffer();
    const mask = await sharp(await sharp(smooth).threshold(128).png().toBuffer()).negate().toColourspace('srgb').png().toBuffer();
    const paths = optimizeSync(await vectorize(mask, BORDER)).replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
    if (!paths.includes('<path') || paths.replace(/<path fill="#000" d="[^"]*"\/>/g, '')) throw new Error(`unexpected border trace for ${input}`);
    return { room, paths: paths.replaceAll('fill="#000"', 'fill="#fff4e8"') };
  })());
  return borders.get(input);
}

// One dark SVG from its light twin: the canvas grown by `pad` px per side (art coordinates unchanged),
// the title marked, and a border under the art. A still gets one border at the top level. A loop gets one
// inside each frame group, from that frame's pixels; when the frame groups sit inside walk-left's mirror,
// the border is wrapped in the same mirror (its own inverse), so it lands where those pixels are.
async function darkSvg(file, inputs, [width, height], pad) {
  const svg = readFileSync(join(mascot, file), 'utf8');
  const [, vw, vh, w, h] = svg.match(/^<svg [^>]*viewBox="0 0 (\d+) (\d+)" width="(\d+)" height="(\d+)"/) ?? [];
  const k = vw / w;
  if (+w !== width || +h !== height || !Number.isInteger(k) || vh / h !== k) throw new Error(`${file}: unexpected canvas`);
  const [head, rest] = svg.split(/(?<=<\/title>)/);
  const out = head
    .replace(/viewBox="[^"]*" width="\d+" height="\d+"/, `viewBox="${-pad * k} ${-pad * k} ${(width + 2 * pad) * k} ${(height + 2 * pad) * k}" width="${width + 2 * pad}" height="${height + 2 * pad}"`)
    .replace('</title>', ', for dark surfaces</title>');
  const groups = rest.match(/<g class="f f\d+">/g) ?? [];
  if (!groups.length) {
    if (inputs.length !== 1 || rest.startsWith('<style')) throw new Error(`${file}: expected a still`);
    return out + (await border(inputs[0], width, height, k)) + rest;
  }
  const [, style, mirror, body] = rest.match(/^(<style>[\s\S]*?<\/style>)(<g transform="matrix\(-1 0 0 1 \d+ 0\)">)?(<g class="f f0">[\s\S]*)$/) ?? [];
  if (!style || groups.length !== inputs.length || (mirror && !mirror.includes(` ${vw} 0)`))) throw new Error(`${file}: unexpected loop structure`);
  const shapes = await Promise.all(inputs.map((input) => border(input, width, height, k)));
  const wrap = (b) => (mirror ? `${mirror}${b}</g>` : b);
  return out + style + (mirror ?? '') + body.replace(/<g class="f f(\d+)">/g, (g, f) => g + wrap(shapes[+f]));
}

async function writeSvgs(outs, inputs, size, pad) {
  for (const out of outs) {
    const ins = inputs(out);
    const full = await darkSvg(`${out}.svg`, ins, size, pad);
    write(dark(`${out}.svg`), full);
    write(dark('compressed', `${out}.svg`), await darkSvg(join('compressed', `${out}.svg`), ins, size, pad));
    write(dark('compressed', `${out}.svgz`), gzipSync(full, { level: 9 }));
  }
}

rmSync(dark(), { recursive: true, force: true });
const still = (out) => ({ out, inputs: [original(`${out}.png`)] });
const loop = async (out) => ({ out, ...(await pages(original(`${out}.webp`))), inputs: [] });
async function frameGroup(label, frameDir, loopOut, size) {
  const l = await loop(loopOut);
  const frames = pngs(frameDir);
  const pad = await writeGroup(label, [...frames.map(still), { out: l.out, delay: l.delay, inputs: l.frames }], size);
  // The loop's frame groups f0..f7 are the frames in file order.
  await writeSvgs([...frames, loopOut], (out) => (out === loopOut ? frames : [out]).map((f) => original(`${f}.png`)), size, pad);
}
async function stillGroup(label, out, size, compressedWidth) {
  const pad = await writeGroup(label, [still(out)], size, compressedWidth);
  await writeSvgs([out], () => [original(`${out}.png`)], size, pad);
}

await stillGroup('hero', 'patch', [640, 640], 320);
await frameGroup('sneeze frames and loop', 'frames', 'patch-animated', [272, 272]);
for (const side of ['walk', 'walk-left']) {
  const name = side === 'walk' ? 'patch-walk' : 'patch-walk-left';
  await stillGroup(`${side} pose`, `${side}/${name}`, [480, 360]);
  await frameGroup(`${side} frames and loop`, `${side}/frames`, `${side}/${name}-animated`, [256, 176]);
}
