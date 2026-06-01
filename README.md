# WangJie's blog

Personal blog built with [Astro](https://astro.build), migrated from a Hexo
(apollo theme) site. Static output, deployed to Cloudflare Pages, served under
the `/blog` path at `https://www.cnwangjie.com/blog`.

## Develop

```bash
bun install
bun run dev        # http://localhost:4321/blog/
bun run build      # outputs to dist/
bun run preview    # preview the production build
```

## Structure

- `src/content/posts/` — Markdown posts (the filename is the URL slug, case-sensitive).
- `src/content.config.ts` — content collection schema.
- `src/pages/` — routes: paginated index, `post/[...slug]`, `archives`, `tags`, `atom.xml`, `404`.
- `src/components/`, `src/layouts/` — UI (BaseLayout, Nav, PostMeta, Paginator, Disqus, ...).
- `public/images/<slug>/` — post images (downloaded locally from the old CDN).
- `public/_redirects` — Cloudflare Pages rule serving the site under `/blog`.
- `scripts/migrate.mjs` — one-shot Hexo → Astro migration (already run).

## Notable migration decisions

- **URLs preserved**: kept the `/blog` base and `post/:title/` permalinks
  (case-sensitive). The route slug comes from the source filename, since Astro's
  glob loader lowercases the collection `id`.
- **Comments**: Disqus (`cnwangjie`); thread `identifier`/`url` match the old
  Hexo values so existing threads stay attached.
- **Images**: downloaded into `public/images/`; Sina images need a plain
  `curl`-style User-Agent (browser/bot UAs get 403).
- **Excerpts**: text before `<!-- more -->`, matching Hexo.
- **Feed**: `@astrojs/rss` at `/atom.xml` (RSS 2.0; the old subscription URL is
  preserved so existing subscribers keep working).
- **Math (KaTeX)**: removed — no post used it. Re-add `remark-math` +
  `rehype-katex` if needed.

## Deploy (Cloudflare Pages)

- Build command: `bun run build`
- Output directory: `dist`
- The `_redirects` file rewrites `/blog/*` to the dist root, mirroring the old
  Vercel setup. The `/blog` path must route to this Pages project as before.
