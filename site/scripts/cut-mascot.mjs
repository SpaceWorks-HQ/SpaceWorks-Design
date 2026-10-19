// Builds every Patch file from the two approved concept sheets in mascot/concept/:
//
//   patch-concept-sheet.webp  ->  the hero pose and the eight-frame sneeze loop
//   patch-walk-sheet.webp     ->  the walking pose and the eight-frame walk cycle
//
// Each piece is cut out (the sheet's cream is flood-filled away from the edges, so cream fur inside
// the artwork stays), traced to a colour vector SVG at the highest settings, and rendered back to a
// high-resolution PNG from that vector. The loops are built from the traced frames as an animated SVG
// (CSS only, plays in <img>) and an animated WebP.
//
// Run from site/ after replacing a sheet: node scripts/cut-mascot.mjs [concept|walk]
// (no argument rebuilds both sheets; tracing the concept sheet takes a few minutes)
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { ColorMode, Hierarchical, PathSimplifyMode, optimizeSync, vectorize } from '@neplex/vectorizer';

const mascot = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'mascot');

// Tracing: upscale 4x, smooth JPEG-style noise, then trace with fine colour layers.
const UPSCALE = 4;
const TRACE = {
  colorMode: ColorMode.Color,
  hierarchical: Hierarchical.Stacked,
  filterSpeckle: 6,
  colorPrecision: 8,
  layerDifference: 10,
  mode: PathSimplifyMode.Spline,
  cornerThreshold: 60,
  lengthThreshold: 4,
  maxIterations: 10,
  spliceThreshold: 45,
  pathPrecision: 1,
};
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

// Traces a canvas to SVG markup (paths only, in canvas units x UPSCALE).
// The edge is made hard (alpha in or out) after upscaling: soft edge pixels would otherwise be traced
// as a pale ring around the outline. The renderer anti-aliases the vector edge instead.
async function trace(canvas, [w, h]) {
  const { data, info } = await sharp(canvas)
    .resize(w * UPSCALE, h * UPSCALE, { kernel: 'lanczos3' })
    .median(3)
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let p = 3; p < data.length; p += 4) data[p] = data[p] >= 235 ? 255 : 0;
  const up = await sharp(data, { raw: info }).png().toBuffer();
  const svg = optimizeSync(await vectorize(up, TRACE));
  return svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
}

function shadowShape(s, left, top) {
  if (!s) return '';
  const tint = s.bg.map((b, c) => Math.max(0, Math.min(255, Math.round(b - (b - s.rgb[c]) / SHADOW_OPACITY))));
  const x = (left + s.x0) * UPSCALE, y = (top + s.y0) * UPSCALE;
  const w = (s.x1 - s.x0 + 1) * UPSCALE, h = (s.y1 - s.y0 + 1) * UPSCALE;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="rgb(${tint.join(' ')})" fill-opacity="${SHADOW_OPACITY}"/>`;
}

const svgDoc = ([w, h], body, title, extra = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w * UPSCALE} ${h * UPSCALE}" width="${w}" height="${h}" role="img" aria-labelledby="t"><title id="t">${title}</title>${extra}${body}</svg>\n`;

async function writeVector(out, size, body, title) {
  const svg = svgDoc(size, body, title);
  writeFileSync(join(mascot, `${out}.svg`), svg);
  // High-resolution PNG rendered from the vector (4x the nominal size).
  await sharp(Buffer.from(svg), { density: 72 * UPSCALE }).png({ compressionLevel: 9 }).toFile(join(mascot, `${out}.png`));
  return svg;
}

const only = process.argv[2];
for (const s of SHEETS.filter((s) => !only || s.sheet.includes(only))) {
  const frameDir = join(mascot, dirname(s.frames[0][0]));
  rmSync(frameDir, { recursive: true, force: true });
  mkdirSync(frameDir, { recursive: true });
  const src = await load(s.sheet);

  // Hero pose, centred on its canvas.
  const walk = s.align === 'shadow';
  const hero = cut(src, s.hero.box, s.near, s.far, walk);
  const [hw, hh] = s.hero.size;
  const hp = await place(hero, s.hero.size, [hero.width / 2, hero.height / 2], [hw / 2, hh / 2]);
  await writeVector(s.hero.out, s.hero.size, shadowShape(hero.shadow, hp.left, hp.top) + (await trace(hp.canvas, s.hero.size)), 'Patch, the Space Works mascot');

  // Frames, aligned on the same anchor so they can be swapped without jumping.
  const [fw, fh] = s.frameSize;
  const target = walk ? [fw / 2, fh - PAD - 4] : [fw / 2, fh / 2];
  const bodies = [];
  for (const [out, box] of s.frames) {
    const piece = cut(src, box, s.near, s.far, walk);
    const placed = await place(piece, s.frameSize, anchor(piece, s.align), target);
    const body = shadowShape(piece.shadow, placed.left, placed.top) + (await trace(placed.canvas, s.frameSize));
    await writeVector(out, s.frameSize, body, 'Patch, the Space Works mascot');
    bodies.push({ out, body });
  }

  // Animated SVG: every traced frame, shown on the timeline with CSS visibility steps.
  const total = s.timeline.reduce((t, [, ms]) => t + ms, 0);
  const keyframes = bodies.map((_, f) => {
    const stops = new Map([[0, 'hidden']]);
    let t = 0;
    for (const [frame, ms] of s.timeline) {
      if (frame === f) {
        stops.set(t, 'visible');
        if (!stops.has(t + ms)) stops.set(t + ms, 'hidden');
      }
      t += ms;
    }
    const body = [...stops].map(([ms, v]) => `${+((ms / total) * 100).toFixed(3)}%{visibility:${v}}`).join('');
    return `@keyframes f${f}{${body}}`;
  });
  const style = `<style>.f{visibility:hidden;animation:${total}ms step-end infinite}${bodies
    .map((_, f) => `.f${f}{animation-name:f${f}}`)
    .join('')}${keyframes.join('')}@media (prefers-reduced-motion:reduce){.f{animation:none}.f0{visibility:visible}}</style>`;
  const groups = bodies.map(({ body }, f) => `<g class="f f${f}">${body}</g>`).join('');
  writeFileSync(join(mascot, `${s.animated}.svg`), svgDoc(s.frameSize, groups, s.title, style));

  // Animated WebP at 2x, from PNGs rendered off the traced frames.
  const pngs = await Promise.all(
    s.timeline.map(([f]) => sharp(join(mascot, `${bodies[f].out}.png`)).resize(fw * 2, fh * 2).png().toBuffer()),
  );
  await sharp(pngs, { join: { animated: true } })
    .webp({ loop: 0, delay: s.timeline.map(([, ms]) => ms), quality: 92, alphaQuality: 100, effort: 6 })
    .toFile(join(mascot, `${s.animated}.webp`));

  console.log(`cut-mascot: ${s.sheet} -> ${s.hero.out}, ${s.frames.length} frames, ${s.animated}`);
}
