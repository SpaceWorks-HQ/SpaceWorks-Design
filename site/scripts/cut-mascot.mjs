// Builds every Patch file from the two approved concept sheets in mascot/concept/:
//
//   patch-concept-sheet.webp  ->  the hero pose and the eight-frame sneeze loop
//   patch-walk-sheet.webp     ->  the walking pose and the eight-frame walk cycle
//
// Each piece is cut out (the sheet's cream is flood-filled away from the edges, so cream fur inside
// the artwork stays) and written three ways:
//
//   mascot/<file>             the full vector SVG, traced at the most faithful settings measured, and a
//                             high-resolution PNG rendered from it
//   mascot/original/<file>    the cut-out's exact pixels from the sheet, lossless: nothing is lost
//   mascot/compressed/<file>  a lighter traced SVG that renders anywhere, the full SVG gzipped as
//                             .svgz (lossless), and a smaller animated WebP
//
// The loops are built from the frames as animated SVGs (CSS only, plays in <img>) and animated WebPs.
//
// walk-left/ is the approved left-facing walk: every walk file mirrored exactly (vectors, pixels and
// loops), so Patch can head left without anyone flipping the artwork by hand. It is rebuilt with the
// walk sheet, or on its own from the current walk files.
//
// Run from site/ after replacing a sheet: node scripts/cut-mascot.mjs [concept|walk|walk-left]
// (no argument rebuilds both sheets; tracing the concept sheet takes a few minutes)
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { ColorMode, Hierarchical, PathSimplifyMode, optimizeSync, vectorize } from '@neplex/vectorizer';

const mascot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'mascot');

// Two traces. "full" was picked by scoring renders against the sheet pixel by pixel: finer colour
// layers and tighter curve fitting stopped improving the score here, and a bigger upscale or
// sharpening made it worse. "lite" is several times smaller and still close at normal sizes.
const base = { colorMode: ColorMode.Color, hierarchical: Hierarchical.Stacked, colorPrecision: 8, mode: PathSimplifyMode.Spline, maxIterations: 10 };
const FULL = { upscale: 4, median: 0, trace: { ...base, filterSpeckle: 2, layerDifference: 4, cornerThreshold: 40, lengthThreshold: 3, spliceThreshold: 30, pathPrecision: 2 } };
const LITE = { upscale: 3, median: 3, trace: { ...base, filterSpeckle: 8, layerDifference: 12, cornerThreshold: 60, lengthThreshold: 4, spliceThreshold: 45, pathPrecision: 0 } };
const PAD = 6; // keeps twitch marks and puffs; label text on the sheet starts further away

const SHEETS = [
  {
    sheet: 'patch-concept-sheet.webp',
    // Background: cream within NEAR is removed; edge pixels up to FAR get partial alpha.
    near: 18,
    far: 44,
    align: 'badge', // frames line up on the Maker Teal badge
    hero: { box: [31, 31, 619, 615], size: [640, 640], out: 'patch' },
    frameSize: [272, 272],
    frames: [
      ['frames/patch-01-idle', [717, 75, 240, 234]],
      ['frames/patch-02-blink', [978, 75, 241, 234]],
      ['frames/patch-03-left-ear', [1240, 74, 241, 235]],
      ['frames/patch-04-right-ear', [1503, 75, 240, 234]],
      ['frames/patch-05-sneeze-prep', [716, 387, 242, 233]],
      ['frames/patch-06-sneeze', [973, 387, 252, 233]],
      ['frames/patch-07-recover', [1241, 387, 240, 233]],
      ['frames/patch-08-back-to-idle', [1503, 387, 240, 233]],
    ],
    // [frame index, milliseconds on screen]; adds up to 7000.
    timeline: [[0, 2000], [1, 200], [0, 1300], [2, 300], [0, 200], [3, 300], [0, 1000], [4, 300], [5, 400], [6, 600], [7, 400]],
    animated: 'patch-animated',
    title: 'Patch, the Space Works mascot, blinking, twitching its ears and doing a sneeze vote',
  },
  {
    sheet: 'patch-walk-sheet.webp',
    // The ground shadow sits within FAR of the cream, so it is removed with the background and
    // redrawn as a vector capsule that matches it on cream and stays soft on other surfaces.
    near: 48,
    far: 72,
    align: 'shadow', // frames line up on the ground shadow
    hero: { box: [647, 193, 467, 344], size: [480, 360], out: 'walk/patch-walk' },
    frameSize: [256, 176],
    frames: [
      ['walk/frames/patch-walk-01', [52, 617, 203, 152]],
      ['walk/frames/patch-walk-02', [272, 617, 192, 152]],
      ['walk/frames/patch-walk-03', [474, 617, 201, 152]],
      ['walk/frames/patch-walk-04', [688, 617, 199, 152]],
      ['walk/frames/patch-walk-05', [893, 617, 206, 152]],
      ['walk/frames/patch-walk-06', [1111, 617, 206, 152]],
      ['walk/frames/patch-walk-07', [1330, 615, 191, 154]],
      ['walk/frames/patch-walk-08', [1532, 614, 202, 155]],
    ],
    timeline: [[0, 120], [1, 120], [2, 120], [3, 120], [4, 120], [5, 120], [6, 120], [7, 120]],
    animated: 'walk/patch-walk-animated',
    title: 'Patch, the Space Works mascot, walking with a wrench',
  },
];

// The ground shadow colour (sampled) expressed as a tint at 20%, so it matches exactly on the sheet's
// cream and darkens any other surface gently.
const SHADOW_OPACITY = 0.2;

async function load(sheet) {
  const { data, info } = await sharp(join(mascot, 'concept', sheet)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

// Cuts one box out of a sheet. Returns RGBA pixels and, for walk pieces, the measured ground shadow.
function cut(src, [x, y, w, h], near, far, findShadow) {
  const X = Math.max(0, x - PAD), Y = Math.max(0, y - PAD);
  const W = Math.min(src.width - X, w + PAD * 2), H = Math.min(src.height - Y, h + PAD * 2);
  const at = (i, j, c) => src.data[((Y + j) * src.width + X + i) * 3 + c];
  const bg = [0, 1, 2].map((c) => at(0, 0, c));
  const out = Buffer.alloc(W * H * 4);
  const dist = new Uint8Array(W * H);
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      const p = j * W + i;
      dist[p] = Math.max(...[0, 1, 2].map((c) => Math.abs(at(i, j, c) - bg[c])));
      for (let c = 0; c < 3; c++) out[p * 4 + c] = at(i, j, c);
      out[p * 4 + 3] = 255;
    }
  }
  // Ground shadow: the solid run of wide shadow-toned rows at the bottom of the piece. Scattered
  // shadow-toned pixels higher up are cream fur, not shadow.
  let shadow = null;
  if (findShadow) {
    const tone = (i, j) => dist[j * W + i] > 25 && dist[j * W + i] < 60;
    const rows = [];
    for (let j = 0; j < H; j++) {
      let n = 0;
      for (let i = 0; i < W; i++) n += tone(i, j);
      rows.push(n);
    }
    const widest = Math.max(...rows);
    let y1 = H - 1;
    while (rows[y1] < widest * 0.3) y1--;
    let y0 = y1;
    while (y0 > 0 && rows[y0 - 1] >= widest * 0.3) y0--;
    const peak = rows.indexOf(widest);
    let x0 = 0, x1 = W - 1;
    while (!tone(x0, peak)) x0++;
    while (!tone(x1, peak)) x1--;
    const sum = [0, 0, 0];
    for (let i = x0; i <= x1; i++) for (let c = 0; c < 3; c++) sum[c] += at(i, peak, c);
    shadow = { x0, x1, y0, y1, rgb: sum.map((v) => v / (x1 - x0 + 1)), bg };
  }
  const seen = new Uint8Array(W * H), stack = [];
  for (let i = 0; i < W; i++) stack.push(i, (H - 1) * W + i);
  for (let j = 0; j < H; j++) stack.push(j * W, j * W + W - 1);
  while (stack.length) {
    const p = stack.pop();
    if (seen[p]) continue;
    seen[p] = 1;
    if (dist[p] >= far) continue; // artwork: stop here
    const a = dist[p] <= near ? 0 : (dist[p] - near) / (far - near);
    for (let c = 0; c < 3; c++) {
      const v = a ? (out[p * 4 + c] - (1 - a) * bg[c]) / a : 0;
      out[p * 4 + c] = Math.max(0, Math.min(255, Math.round(v)));
    }
    out[p * 4 + 3] = Math.round(a * 255);
    if (dist[p] > near) continue; // anti-aliased edge: don't spread into the artwork
    const i = p % W;
    if (i > 0) stack.push(p - 1);
    if (i < W - 1) stack.push(p + 1);
    if (p >= W) stack.push(p - W);
    if (p < W * (H - 1)) stack.push(p + W);
  }
  return { pixels: out, width: W, height: H, shadow };
}

// The point a piece is aligned on: the teal badge's centre, or the shadow's centre and bottom.
function anchor(piece, align) {
  if (align === 'shadow') {
    const s = piece.shadow;
    return [(s.x0 + s.x1) / 2, s.y1];
  }
  let x0 = piece.width, y0 = piece.height, x1 = 0, y1 = 0;
  for (let p = 0; p < piece.width * piece.height; p++) {
    const [r, g, b, a] = piece.pixels.subarray(p * 4, p * 4 + 4);
    if (a > 200 && r < 40 && g > 80 && g < 130 && b > 70 && b < 120) {
      const x = p % piece.width, y = (p / piece.width) | 0;
      x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    }
  }
  return [(x0 + x1) / 2, (y0 + y1) / 2];
}

// Places a piece on a transparent canvas so its anchor lands on `target`.
async function place(piece, [w, h], [ax, ay], [tx, ty]) {
  const left = Math.round(tx - ax), top = Math.round(ty - ay);
  if (left < 0 || top < 0 || left + piece.width > w || top + piece.height > h) {
    throw new Error(`piece does not fit the ${w}x${h} canvas at ${left},${top}`);
  }
  const png = await sharp(piece.pixels, { raw: { width: piece.width, height: piece.height, channels: 4 } }).png().toBuffer();
  const canvas = await sharp({ create: { width: w, height: h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: png, left, top }])
    .png()
    .toBuffer();
  return { canvas, left, top };
}

// Traces a canvas to SVG markup (paths only, in canvas units x the variant's upscale).
// The edge is made hard (alpha in or out) after upscaling: soft edge pixels would otherwise be traced
// as a pale ring around the outline. The renderer anti-aliases the vector edge instead.
async function trace(canvas, [w, h], v) {
  let pipe = sharp(canvas).resize(w * v.upscale, h * v.upscale, { kernel: 'lanczos3' });
  if (v.median) pipe = pipe.median(v.median);
  const { data, info } = await pipe.raw().toBuffer({ resolveWithObject: true });
  for (let p = 3; p < data.length; p += 4) data[p] = data[p] >= 235 ? 255 : 0;
  const up = await sharp(data, { raw: info }).png().toBuffer();
  const svg = optimizeSync(await vectorize(up, v.trace));
  return svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
}

function shadowShape(s, left, top, k) {
  if (!s) return '';
  const tint = s.bg.map((b, c) => Math.max(0, Math.min(255, Math.round(b - (b - s.rgb[c]) / SHADOW_OPACITY))));
  const x = (left + s.x0) * k, y = (top + s.y0) * k;
  const w = (s.x1 - s.x0 + 1) * k, h = (s.y1 - s.y0 + 1) * k;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="rgb(${tint.join(' ')})" fill-opacity="${SHADOW_OPACITY}"/>`;
}

const svgDoc = ([w, h], k, body, title, extra = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w * k} ${h * k}" width="${w}" height="${h}" role="img" aria-labelledby="t"><title id="t">${title}</title>${extra}${body}</svg>\n`;

// Every traced frame in one SVG, each shown on the timeline with CSS visibility steps.
function animatedDoc(size, k, bodies, timeline, title) {
  const total = timeline.reduce((t, [, ms]) => t + ms, 0);
  const keyframes = bodies.map((_, f) => {
    const stops = new Map([[0, 'hidden']]);
    let t = 0;
    for (const [frame, ms] of timeline) {
      if (frame === f) {
        stops.set(t, 'visible');
        if (!stops.has(t + ms)) stops.set(t + ms, 'hidden');
      }
      t += ms;
    }
    return `@keyframes f${f}{${[...stops].map(([ms, v]) => `${+((ms / total) * 100).toFixed(3)}%{visibility:${v}}`).join('')}}`;
  });
  const style = `<style>.f{visibility:hidden;animation:${total}ms step-end infinite}${bodies
    .map((_, f) => `.f${f}{animation-name:f${f}}`)
    .join('')}${keyframes.join('')}@media (prefers-reduced-motion:reduce){.f{animation:none}.f0{visibility:visible}}</style>`;
  return svgDoc(size, k, bodies.map((b, f) => `<g class="f f${f}">${b}</g>`).join(''), title, style);
}

const at = (...parts) => join(mascot, ...parts);
const write = (file, data) => {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, data);
};
// The paths of a single-piece SVG, without its root element and title.
const strip = (svg) => svg.replace(/^[\s\S]*?<\/title>/, '').replace(/<\/svg>\s*$/, '');

// Writes one piece: full SVG + PNG, the original pixels, and the compressed SVG and SVGZ.
async function writePiece(out, size, placed, shadow, title) {
  const body = async (v) => shadowShape(shadow, placed.left, placed.top, v.upscale) + (await trace(placed.canvas, size, v));
  const full = svgDoc(size, FULL.upscale, await body(FULL), title);
  const lite = svgDoc(size, LITE.upscale, await body(LITE), title);
  write(at(`${out}.svg`), full);
  await sharp(Buffer.from(full), { density: 72 * FULL.upscale }).png({ compressionLevel: 9 }).toFile(at(`${out}.png`));
  write(at('original', `${out}.png`), await sharp(placed.canvas).png({ compressionLevel: 9 }).toBuffer());
  write(at('compressed', `${out}.svg`), lite);
  write(at('compressed', `${out}.svgz`), gzipSync(full, { level: 9 }));
  return { full, lite };
}

const only = process.argv[2];
for (const s of SHEETS.filter((s) => !only || s.sheet.includes(only))) {
  for (const root of [[], ['original'], ['compressed']]) rmSync(at(...root, dirname(s.frames[0][0])), { recursive: true, force: true });
  const src = await load(s.sheet);
  const walk = s.align === 'shadow';
  const title = 'Patch, the Space Works mascot';

  // Hero pose, centred on its canvas.
  const hero = cut(src, s.hero.box, s.near, s.far, walk);
  const [hw, hh] = s.hero.size;
  const heroPlaced = await place(hero, s.hero.size, [hero.width / 2, hero.height / 2], [hw / 2, hh / 2]);
  await writePiece(s.hero.out, s.hero.size, heroPlaced, hero.shadow, title);

  // Frames, aligned on the same anchor so they can be swapped without jumping.
  const [fw, fh] = s.frameSize;
  const target = walk ? [fw / 2, fh - PAD - 4] : [fw / 2, fh / 2];
  const frames = [];
  for (const [out, box] of s.frames) {
    const piece = cut(src, box, s.near, s.far, walk);
    const placed = await place(piece, s.frameSize, anchor(piece, s.align), target);
    frames.push({ out, placed, ...(await writePiece(out, s.frameSize, placed, piece.shadow, title)) });
  }

  // Animated SVGs (full and lite, plus the full one gzipped) and animated WebPs: 2x from the
  // vectors, the original pixels losslessly, and a small compressed one.
  const full = animatedDoc(s.frameSize, FULL.upscale, frames.map((f) => strip(f.full)), s.timeline, s.title);
  write(at(`${s.animated}.svg`), full);
  write(at('compressed', `${s.animated}.svg`), animatedDoc(s.frameSize, LITE.upscale, frames.map((f) => strip(f.lite)), s.timeline, s.title));
  write(at('compressed', `${s.animated}.svgz`), gzipSync(full, { level: 9 }));
  const delay = s.timeline.map(([, ms]) => ms);
  const sequence = (pick) => Promise.all(s.timeline.map(([f]) => pick(frames[f])));
  const rendered = (scale) => sequence((f) => sharp(at(`${f.out}.png`)).resize(fw * scale, fh * scale).png().toBuffer());
  const webp = async (inputs, opts, file) => {
    mkdirSync(dirname(file), { recursive: true });
    await sharp(inputs, { join: { animated: true } }).webp({ loop: 0, delay, effort: 6, ...opts }).toFile(file);
  };
  await webp(await rendered(2), { quality: 92, alphaQuality: 100 }, at(`${s.animated}.webp`));
  await webp(await sequence((f) => f.placed.canvas), { lossless: true }, at('original', `${s.animated}.webp`));
  await webp(await rendered(1), { quality: 80, alphaQuality: 90 }, at('compressed', `${s.animated}.webp`));

  console.log(`cut-mascot: ${s.sheet} -> ${s.hero.out}, ${s.frames.length} frames, ${s.animated}`);
}

// walk-left/: the walk files mirrored. SVGs get one mirroring group around their artwork, PNGs are
// flopped, and the loops are rebuilt from the flopped frames with the walk's own encoder settings.
const left = (out) => out.replace(/^walk\//, 'walk-left/').replace('patch-walk', 'patch-walk-left');
const mirrorSvg = (svg, title) =>
  svg.replace(/^([\s\S]*?viewBox="0 0 (\d+) \d+"[\s\S]*?<title id="t">)[\s\S]*?(<\/title>(?:<style>[\s\S]*?<\/style>)?)([\s\S]*)<\/svg>\s*$/,
    (_, head, width, close, body) => `${head}${title}${close}<g transform="matrix(-1 0 0 1 ${width} 0)">${body}</g></svg>\n`);

async function mirrorWalk(s) {
  for (const root of [[], ['original'], ['compressed']]) rmSync(at(...root, 'walk-left'), { recursive: true, force: true });
  const title = 'Patch, the Space Works mascot, walking left';
  for (const out of [s.hero.out, ...s.frames.map(([f]) => f)]) {
    const full = mirrorSvg(readFileSync(at(`${out}.svg`), 'utf8'), title);
    write(at(`${left(out)}.svg`), full);
    write(at(`${left(out)}.png`), await sharp(at(`${out}.png`)).flop().png({ compressionLevel: 9 }).toBuffer());
    write(at('original', `${left(out)}.png`), await sharp(at('original', `${out}.png`)).flop().png({ compressionLevel: 9 }).toBuffer());
    write(at('compressed', `${left(out)}.svg`), mirrorSvg(readFileSync(at('compressed', `${out}.svg`), 'utf8'), title));
    write(at('compressed', `${left(out)}.svgz`), gzipSync(full, { level: 9 }));
  }
  const loopTitle = 'Patch, the Space Works mascot, walking left with a wrench';
  const full = mirrorSvg(readFileSync(at(`${s.animated}.svg`), 'utf8'), loopTitle);
  write(at(`${left(s.animated)}.svg`), full);
  write(at('compressed', `${left(s.animated)}.svg`), mirrorSvg(readFileSync(at('compressed', `${s.animated}.svg`), 'utf8'), loopTitle));
  write(at('compressed', `${left(s.animated)}.svgz`), gzipSync(full, { level: 9 }));
  const [fw, fh] = s.frameSize;
  const delay = s.timeline.map(([, ms]) => ms);
  const sequence = (file) => Promise.all(s.timeline.map(([f]) => file(s.frames[f][0])));
  const flopped = (scale) => sequence((out) => sharp(at(`${out}.png`)).flop().resize(fw * scale, fh * scale).png().toBuffer());
  const webp = async (inputs, opts, file) => {
    mkdirSync(dirname(file), { recursive: true });
    await sharp(inputs, { join: { animated: true } }).webp({ loop: 0, delay, effort: 6, ...opts }).toFile(file);
  };
  await webp(await flopped(2), { quality: 92, alphaQuality: 100 }, at(`${left(s.animated)}.webp`));
  await webp(await sequence((out) => sharp(at('original', `${out}.png`)).flop().png().toBuffer()), { lossless: true }, at('original', `${left(s.animated)}.webp`));
  await webp(await flopped(1), { quality: 80, alphaQuality: 90 }, at('compressed', `${left(s.animated)}.webp`));
  console.log(`cut-mascot: walk -> walk-left, ${s.frames.length} frames, ${left(s.animated)}`);
}

if (!only || only === 'walk' || only === 'walk-left') await mirrorWalk(SHEETS.find((s) => s.align === 'shadow'));
