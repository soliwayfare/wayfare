// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';
import { pluginLineNumbers } from '@expressive-code/plugin-line-numbers';

// https://astro.build
export default defineConfig({
  site: 'https://www.cnwangjie.com',
  base: '/blog',
  trailingSlash: 'always',
  integrations: [
    expressiveCode({
      themes: ['github-light', 'github-dark'],
      plugins: [pluginLineNumbers()],
      defaultProps: {
        // Mirror old Hexo config: highlight.line_number: true
        showLineNumbers: true,
      },
      styleOverrides: {
        borderRadius: '6px',
        codeFontSize: '0.85rem',
      },
    }),
    sitemap(),
  ],
  redirects: {
    // Old Hexo alias: post/为什么不尝试使用Linux呢？/ -> post/why-not-try-linux/
    // Astro does not prepend `base` to redirect targets, so include it here.
    '/post/为什么不尝试使用Linux呢？/': '/blog/post/why-not-try-linux/',
  },
});
