// Cuts Patch out of the approved concept sheet (mascot/concept/patch-concept-sheet.webp): the hero pose
// and the eight animation frames, on transparent backgrounds, plus the animated WebP and SVG.
// Run from site/ after replacing the sheet: node scripts/cut-mascot.mjs
//
// The sheet background is removed by flood-filling cream from the edges of each crop, so cream fur
// inside the artwork is kept. Edge pixels get partial alpha and are un-mixed from the cream.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const mascot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'mascot');
const sheet = join(mascot, 'concept', 'patch-concept-sheet.webp');
const frames = join(mascot, 'frames');

// Artwork boxes on the 1774 × 887 sheet (x, y, width, height), found by measuring each blob.
const HERO = [31, 31, 619, 615];
const FRAMES = [
  { name: '01-idle', box: [717, 75, 240, 234] },
  { name: '02-blink', box: [978, 75, 241, 234] },
  { name: '03-left-ear', box: [1240, 74, 241, 235] },
  { name: '04-right-ear', box: [1503, 75, 240, 234] },
  { name: '05-sneeze-prep', box: [716, 387, 242, 233] },
  { name: '06-sneeze', box: [973, 387, 252, 233] },
  { name: '07-recover', box: [1241, 387, 240, 233] },
  { name: '08-back-to-idle', box: [1503, 387, 240, 233] },
];
// The loop as frames: [frame index, milliseconds on screen]. Adds up to 7000.
const TIMELINE = [
  [0, 2000], [1, 200], [0, 1300], [2, 300], [0, 200], [3, 300], [0, 1000],
  [4, 300], [5, 400], [6, 600], [7, 400],
];
const PAD = 6; // keeps twitch marks and puffs; label text starts further away
const FRAME_SIZE = 272; // every frame on the same square canvas, badge centred
const NEAR = 18; // max channel distance from the sheet's cream that counts as background
const FAR = 44; // beyond this an edge pixel is fully opaque

const { data: src, info } = await sharp(sheet).removeAlpha().raw().toBuffer({ resolveWithObject: true });

async function cut([x, y, w, h], pad) {
  const X = Math.max(0, x - pad), Y = Math.max(0, y - pad);
  const W = Math.min(info.width - X, w + pad * 2), H = Math.min(info.height - Y, h + pad * 2);
  const bg = [0, 1, 2].map((c) => src[(Y * info.width + X) * 3 + c]);
  const out = Buffer.alloc(W * H * 4);
  const dist = new Uint8Array(W * H);
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const s = ((Y + j) * info.width + X + i) * 3, p = j * W + i;
      dist[p] = Math.max(...[0, 1, 2].map((c) => Math.abs(src[s + c] - bg[c])));
      for (let c = 0; c < 3; c++) out[p * 4 + c] = src[s + c];
      out[p * 4 + 3] = 255;
    }
  }
  // Flood-fill the background from every edge pixel.
  const seen = new Uint8Array(W * H), stack = [];
  for (let i = 0; i < W; i++) stack.push(i, (H - 1) * W + i);
  for (let j = 0; j < H; j++) stack.push(j * W, j * W + W - 1);
  while (stack.length) {
    const p = stack.pop();
    if (seen[p]) continue;
    seen[p] = 1;
    if (dist[p] >= FAR) continue; // artwork: stop here
    const a = dist[p] <= NEAR ? 0 : (dist[p] - NEAR) / (FAR - NEAR);
    for (let c = 0; c < 3; c++) {
      const v = a ? (out[p * 4 + c] - (1 - a) * bg[c]) / a : 0;
      out[p * 4 + c] = Math.max(0, Math.min(255, Math.round(v)));
    }
    out[p * 4 + 3] = Math.round(a * 255);
    if (dist[p] > NEAR) continue; // anti-aliased edge: don't spread into the artwork
    const i = p % W;
    if (i > 0) stack.push(p - 1);
    if (i < W - 1) stack.push(p + 1);
    if (p >= W) stack.push(p - W);
    if (p < W * (H - 1)) stack.push(p + W);
  }
  return sharp(out, { raw: { width: W, height: H, channels: 4 } }).png();
}

// Places a cut-out on a square canvas with its Maker Teal badge in the centre, so frames line up
// even when twitch marks or sneeze puffs make one crop wider than another.
async function centred(img, size) {
  const { data, info: i } = await img.raw().toBuffer({ resolveWithObject: true });
  let x0 = i.width, y0 = i.height, x1 = 0, y1 = 0;
  for (let p = 0; p < i.width * i.height; p++) {
    const [r, g, b, a] = data.subarray(p * 4, p * 4 + 4);
    if (a > 200 && r < 40 && g > 80 && g < 130 && b > 70 && b < 120) {
      const x = p % i.width, y = (p / i.width) | 0;
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
  }
  const left = Math.round(size / 2 - (x0 + x1) / 2), top = Math.round(size / 2 - (y0 + y1) / 2);
  const png = await sharp(data, { raw: i }).png().toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: png, left, top }])
    .png({ compressionLevel: 9 });
}

rmSync(frames, { recursive: true, force: true });
mkdirSync(frames, { recursive: true });

await (await centred(await cut(HERO, PAD), 640)).toFile(join(mascot, 'patch.png'));

const framePngs = [];
for (const { name, box } of FRAMES) {
  const file = join(frames, `patch-${name}.png`);
  await (await centred(await cut(box, PAD), FRAME_SIZE)).toFile(file);
  framePngs.push(file);
}

// Animated WebP: one image per timeline step, with its own delay.
await sharp(TIMELINE.map(([f]) => framePngs[f]), { join: { animated: true } })
  .webp({ loop: 0, delay: TIMELINE.map(([, ms]) => ms), quality: 92, alphaQuality: 100, effort: 6 })
  .toFile(join(mascot, 'patch-animated.webp'));

// Animated SVG: the eight frames embedded, each shown on the timeline with CSS (works in <img>).
const base64 = await Promise.all(
  framePngs.map(async (f) => (await sharp(f).webp({ quality: 92, alphaQuality: 100 }).toBuffer()).toString('base64')),
);
// With step-end timing each stop holds until the next one: 1 where the frame starts, 0 where it ends.
const keyframes = FRAMES.map((_, f) => {
  const stops = new Map([[0, 0]]);
  let t = 0;
  for (const [frame, ms] of TIMELINE) {
    if (frame === f) {
      stops.set(t, 1);
      if (!stops.has(t + ms)) stops.set(t + ms, 0);
    }
    t += ms;
  }
  const body = [...stops].map(([ms, o]) => `${+(ms / 70).toFixed(3)}% { opacity: ${o}; }`).join(' ');
  return `@keyframes patch-f${f} { ${body} }`;
});
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${FRAME_SIZE} ${FRAME_SIZE}" width="${FRAME_SIZE}" height="${FRAME_SIZE}" role="img" aria-labelledby="patch-title">
  <title id="patch-title">Patch, the Space Works mascot, blinking, twitching its ears and doing a sneeze vote</title>
  <style>
    image { opacity: 0; animation: 7s step-end infinite; }
    ${FRAMES.map((_, f) => `.patch-f${f} { animation-name: patch-f${f}; }`).join('\n    ')}
    ${keyframes.join('\n    ')}
    @media (prefers-reduced-motion: reduce) { image { animation: none; } .patch-f0 { opacity: 1; } }
  </style>
  ${base64.map((b, f) => `<image class="patch-f${f}" width="${FRAME_SIZE}" height="${FRAME_SIZE}" href="data:image/webp;base64,${b}"/>`).join('\n  ')}
</svg>
`;
writeFileSync(join(mascot, 'patch-animated.svg'), svg);

console.log(`cut-mascot: patch.png, ${FRAMES.length} frames, patch-animated.webp and patch-animated.svg`);
