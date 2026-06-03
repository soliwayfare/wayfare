// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';

// https://astro.build
export default defineConfig({
  site: 'https://www.cnwangjie.com',
  trailingSlash: 'always',
  // Prefetch link targets on hover/focus so SPA navigations (ClientRouter)
  // feel instant — the next page is usually already fetched by click time.
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover',
  },
  integrations: [
    expressiveCode({
      themes: ['github-light', 'github-dark'],
      plugins: [pluginLineNumbers()],
      defaultProps: {
        // Mirror old Hexo config: highlight.line_number: true
        showLineNumbers: true,
      },
      styleOverrides: {
        borderRadius: '8px',
        codeFontSize: '0.84rem',
        codeLineHeight: '1.65',
        borderColor: 'var(--hairline)',
        frames: {
          shadowColor: 'transparent',
        },
      },
    }),
    sitemap(),
  ],
  redirects: {
    // Old Hexo alias: post/为什么不尝试使用Linux呢？/ -> post/why-not-try-linux/.
    // The blog now lives under /blog/, so both source and target carry it.
    '/blog/post/为什么不尝试使用Linux呢？/': '/blog/post/why-not-try-linux/',
  },
});
