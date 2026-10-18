// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';
import { satteri } from '@astrojs/markdown-satteri';
import { baseLinksPlugin } from './src/plugins/base-links.mjs';

// GitHub Pages serves the site at https://spaceworks-hq.github.io/SpaceWorks-Design/. Set
// DESIGN_SITE_URL to override the origin used for the sitemap and canonical links.
const site = process.env.DESIGN_SITE_URL || 'https://spaceworks-hq.github.io';
const base = '/SpaceWorks-Design';
const repo = 'https://github.com/SpaceWorks-HQ/SpaceWorks-Design';

export default defineConfig({
  site,
  base,
  markdown: { processor: satteri({ hastPlugins: [baseLinksPlugin(base)] }) },
  integrations: [
    starlight({
      title: 'Space Works Design',
      description:
        'The Space Works design system: logo, colour, type, voice, design tokens, UI specs and Space Works UX.',
      logo: {
        light: './src/assets/kit/lockup-horizontal.svg',
        dark: './src/assets/kit/lockup-horizontal-reversed.svg',
        replacesTitle: true,
      },
      favicon: '/kit/icons/favicon.svg',
      head: [
        { tag: 'meta', attrs: { property: 'og:image', content: `${site}${base}/kit/icons/og-1200x630.png` } },
      ],
      social: [{ icon: 'github', label: 'GitHub', href: repo }],
      editLink: { baseUrl: `${repo}/edit/main/site/` },
      lastUpdated: true,
      customCss: ['./src/styles/fonts.css', './src/styles/custom.css', './src/styles/kit.css'],
      components: {
        ThemeProvider: './src/components/ThemeProvider.astro',
        ThemeSelect: './src/components/ThemeSelect.astro',
      },
      expressiveCode: {
        themes: ['github-light', 'github-dark'],
        styleOverrides: {
          borderRadius: '10px',
          borderColor: 'var(--sl-color-hairline)',
          codeBackground: 'var(--sw-panel)',
          frames: { shadowColor: 'transparent' },
        },
      },
      plugins: [starlightLinksValidator()],
      sidebar: [
        {
          label: 'Brand',
          items: [
            'brand/introduction',
            'brand/logo',
            'brand/colour',
            'brand/typography',
            'brand/graphics',
            'brand/voice',
            'brand/guidelines',
          ],
        },
        { label: 'Tokens', items: ['tokens/using-the-kit', 'tokens/reference'] },
        { label: 'UX', items: ['ux/introduction'] },
        { label: 'Specs', items: [{ autogenerate: { directory: 'specs' } }] },
        { label: 'About', items: ['about/credits'] },
      ],
    }),
  ],
});
