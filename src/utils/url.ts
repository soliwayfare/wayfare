// Prefix an internal absolute path with the blog base (/blog). The homepage
// lives at the site root, so the blog's own pages/assets all sit under /blog.
import { BLOG_BASE } from '../consts';

export function withBase(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${BLOG_BASE}${clean}`;
}
