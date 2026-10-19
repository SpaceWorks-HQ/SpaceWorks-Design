// Copies the design kit from the repository root into the site before every dev or build run,
// so the site always shows the real masters and never a hand-maintained copy of them.
//
//   logo/ icons/ fonts/ tokens/ brand/  ->  public/kit/...      (served for preview and download)
//   screenshots/ references/yuyu/       ->  public/kit/...      (UX screenshots and reference boards)
//   logo/*.svg                          ->  src/assets/kit/     (header logo and hero art)
//   docs/*.md                           ->  src/content/docs/specs/  (rendered spec pages)
//
// Every destination is generated and git-ignored. Edit the sources at the repository root.
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const site = join(dirname(fileURLToPath(import.meta.url)), '..');
const root = join(site, '..');
const kit = join(site, 'public', 'kit');
const assets = join(site, 'src', 'assets', 'kit');
const specs = join(site, 'src', 'content', 'docs', 'specs');

for (const dir of [kit, assets, specs]) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
}

for (const folder of ['logo', 'icons', 'fonts', 'tokens', 'screenshots']) {
  cpSync(join(root, folder), join(kit, folder), { recursive: true });
}
cpSync(join(root, 'brand', 'space-works-brand-guidelines-v1.pdf'), join(kit, 'brand', 'space-works-brand-guidelines-v1.pdf'));
cpSync(join(root, 'brand', 'guidelines', 'png'), join(kit, 'brand', 'guidelines'), { recursive: true });
// Reference boards get URL-safe names ("Sign in, invites & account.png" -> "sign-in-invites-account.png").
mkdirSync(join(kit, 'references', 'yuyu'), { recursive: true });
for (const file of readdirSync(join(root, 'references', 'yuyu')).filter((f) => f.endsWith('.png'))) {
  const slug = file.replace(/\.png$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  cpSync(join(root, 'references', 'yuyu', file), join(kit, 'references', 'yuyu', `${slug}.png`));
}

for (const file of readdirSync(join(root, 'logo')).filter((f) => f.endsWith('.svg'))) {
  cpSync(join(root, 'logo', file), join(assets, file));
}
cpSync(join(root, 'tokens', 'tokens.json'), join(assets, 'tokens.json'));

// Spec pages: the first "# Heading" becomes the page title; the rest is published unchanged.
const specPages = [
  { file: 'ui-brand-spec.md', slug: 'ui-brand-spec', order: 1, label: 'UI brand spec' },
  { file: 'ux-spec.md', slug: 'ux-patterns', order: 2, label: 'Space Works UX spec' },
  { file: 'ux-screens-longtail.md', slug: 'ux-long-tail-screens', order: 3, label: 'Long-tail screens' },
];
for (const { file, slug, order, label } of specPages) {
  const source = readFileSync(join(root, 'docs', file), 'utf8').replace(/^﻿/, '');
  const match = source.match(/^#\s+(.+)\r?\n/);
  if (!match) throw new Error(`docs/${file} must start with a "# Title" line`);
  const title = match[1].trim().replace(/"/g, '\\"');
  const frontmatter = [
    '---',
    `title: "${title}"`,
    `sidebar: { order: ${order}, label: "${label}" }`,
    `editUrl: https://github.com/SpaceWorks-HQ/SpaceWorks-Design/edit/main/docs/${file}`,
    '---',
    '',
    `:::note[Source]\nThis page is published from [\`docs/${file}\`](https://github.com/SpaceWorks-HQ/SpaceWorks-Design/blob/main/docs/${file}). Edit it there.\n:::`,
    '',
  ].join('\n');
  writeFileSync(join(specs, `${slug}.md`), frontmatter + source.slice(match[0].length));
}

console.log('sync-kit: copied logo, icons, fonts, tokens, screenshots, brand pages, reference boards and 3 specs');
