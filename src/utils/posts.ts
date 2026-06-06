import { getCollection, type CollectionEntry } from 'astro:content';
import { marked } from 'marked';

export type Post = CollectionEntry<'posts'>;

// All posts, newest first.
export async function getSortedPosts(): Promise<Post[]> {
  const posts = await getCollection('posts');
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

// Exact-cased slug from the source filename. Astro's glob loader lowercases
// `post.id`, but the old Hexo permalinks preserved case (e.g.
// "post/Scroll-Restoration-in-SPA/"), so derive the slug from the filename.
export function postSlug(post: Post): string {
  const fp = post.filePath;
  if (fp) return fp.split('/').pop()!.replace(/\.md$/, '');
  return post.id;
}

// The path segment used in routes: post/<slug>/.
export function postPath(post: Post): string {
  return `/post/${postSlug(post)}/`;
}

const MORE_RE = /<!--\s*more\s*-->/;

// Excerpt = everything before <!-- more -->, rendered to HTML. Mirrors Hexo:
// when the marker sits at the very top the excerpt is empty (title + read-more).
export function excerptHtml(post: Post): string {
  const body = post.body ?? '';
  const idx = body.search(MORE_RE);
  const raw = idx === -1 ? body : body.slice(0, idx);
  const trimmed = raw.trim();
  if (!trimmed) return '';
  return marked.parse(trimmed, { async: false }) as string;
}

export function hasMore(post: Post): boolean {
  return MORE_RE.test(post.body ?? '');
}

// Plain-text excerpt for <meta name="description"> / OG. Renders the body to
// HTML, strips tags + collapses whitespace, then truncates on a word/character
// boundary. Returns '' when the post has no usable lead text (caller falls back
// to the site description).
export function plainExcerpt(post: Post, maxLen = 160): string {
  const body = post.body ?? '';
  const idx = body.search(MORE_RE);
  const raw = (idx === -1 ? body : body.slice(0, idx)).trim();
  if (!raw) return '';
  const html = marked.parse(raw, { async: false }) as string;
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1).trimEnd() + '…';
}
