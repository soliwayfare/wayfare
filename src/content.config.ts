import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  // Posts live in YYYY/MM/ subdirectories; the slug is still just the filename
  // (see postSlug in utils/posts), so URLs are unaffected by the folder layout.
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    // Old Hexo permalink post/:title/; the filename is the slug, this keeps the original for reference.
    permalink: z.string().optional(),
    tags: z.array(z.string()).default([]),
    // Source URL for translated posts.
    from: z.string().url().optional(),
    comments: z.boolean().default(true),
  }),
});

export const collections = { posts };
