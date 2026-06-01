// Prefix an internal absolute path with the configured base (e.g. /blog).
// import.meta.env.BASE_URL is "/blog/" given `base: '/blog'`.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function withBase(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${BASE}${clean}`;
}
