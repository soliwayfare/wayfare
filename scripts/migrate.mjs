// One-shot migration: Hexo (apollo) _posts -> Astro content collection.
// - Parses only the first frontmatter block (gray-matter does this correctly).
// - Derives slug from `permalink` (post/:title/) or, when absent, from the filename.
// - Downloads every external image into public/images/<slug>/ and rewrites links.
// - Preserves the original date string (quoted) so it's parsed as local time.
//
// Usage: node scripts/migrate.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OLD_POSTS = '/Users/wangjie/Workspace/wangjie/blog/source/_posts';
const OUT_POSTS = path.join(ROOT, 'src/content/posts');
const OUT_IMAGES = path.join(ROOT, 'public/images');
const BASE = '/blog';

const IMG_MD = /!\[([^\]]*)\]\(\s*(<?)([^)\s>]+)\2(?:\s+["'][^"']*["'])?\s*\)/g;
const IMG_HTML = /(<img[^>]+src=["'])([^"']+)(["'])/gi;

const failedDownloads = [];
let imageCount = 0;

function slugFromPermalink(permalink) {
  const parts = String(permalink).split('/').filter(Boolean);
  return parts[parts.length - 1];
}

function slugFromFilename(filename) {
  return filename.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
}

// Pull the raw, unparsed `date:` value so we keep wall-clock time exactly.
function rawDate(fileContent) {
  const fm = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return null;
  const m = fm[1].match(/^date:\s*(.+?)\s*$/m);
  if (!m) return null;
  return m[1].replace(/^["']|["']$/g, '');
}

function safeFilename(url, used) {
  let name;
  try {
    const u = new URL(url);
    name = path.basename(u.pathname) || 'image';
  } catch {
    name = path.basename(url.split('?')[0]) || 'image';
  }
  name = decodeURIComponent(name).replace(/[^a-zA-Z0-9._-]/g, '_');
  if (!path.extname(name)) name += '.png';
  let candidate = name;
  let i = 1;
  while (used.has(candidate)) {
    const ext = path.extname(name);
    candidate = `${path.basename(name, ext)}-${i++}${ext}`;
  }
  used.add(candidate);
  return candidate;
}

async function download(url, dest) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      // Note: some hosts (e.g. sinaimg.cn) block custom/browser-like UAs but
      // allow a plain curl-style one. Failures are logged and retried manually.
      headers: { 'User-Agent': 'curl/8.4.0' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length === 0) throw new Error('empty body');
    await fs.writeFile(dest, buf);
    return true;
  } finally {
    clearTimeout(timeout);
  }
}

async function localizeImages(body, slug) {
  const used = new Set();
  const tasks = []; // { url, localPath }
  const seen = new Map(); // url -> local web path (dedupe within a post)

  const collect = (url) => {
    if (!/^https?:\/\//i.test(url)) return null;
    if (seen.has(url)) return seen.get(url);
    const filename = safeFilename(url, used);
    const webPath = `${BASE}/images/${slug}/${filename}`;
    const localPath = path.join(OUT_IMAGES, slug, filename);
    seen.set(url, webPath);
    tasks.push({ url, localPath, webPath });
    return webPath;
  };

  // First pass: register every image URL.
  body.replace(IMG_MD, (_m, _alt, _b, url) => (collect(url), _m));
  body.replace(IMG_HTML, (_m, _pre, url) => (collect(url), _m));

  if (tasks.length === 0) return body;

  await fs.mkdir(path.join(OUT_IMAGES, slug), { recursive: true });

  // Download (sequential per post keeps remote hosts happy).
  for (const t of tasks) {
    try {
      await download(t.url, t.localPath);
      imageCount++;
      console.log(`  ✓ ${t.url}`);
    } catch (err) {
      seen.delete(t.url); // keep original URL in body
      failedDownloads.push({ slug, url: t.url, reason: err.message });
      console.log(`  ✗ ${t.url} (${err.message})`);
    }
  }

  // Second pass: rewrite only the URLs we successfully downloaded.
  let out = body.replace(IMG_MD, (full, alt, _b, url) => {
    const web = seen.get(url);
    return web ? `![${alt}](${web})` : full;
  });
  out = out.replace(IMG_HTML, (full, pre, url, post) => {
    const web = seen.get(url);
    return web ? `${pre}${web}${post}` : full;
  });
  return out;
}

function buildFrontmatter({ title, date, permalink, tags, from }) {
  const lines = ['---'];
  lines.push(`title: ${JSON.stringify(title)}`);
  lines.push(`date: ${JSON.stringify(date)}`);
  if (permalink) lines.push(`permalink: ${JSON.stringify(permalink)}`);
  if (tags && tags.length) {
    lines.push('tags:');
    for (const t of tags) lines.push(`  - ${JSON.stringify(t)}`);
  }
  if (from) lines.push(`from: ${JSON.stringify(from)}`);
  lines.push('---');
  return lines.join('\n');
}

async function main() {
  await fs.mkdir(OUT_POSTS, { recursive: true });
  const files = (await fs.readdir(OLD_POSTS)).filter((f) => f.endsWith('.md'));
  console.log(`Found ${files.length} posts.\n`);

  for (const file of files) {
    const raw = await fs.readFile(path.join(OLD_POSTS, file), 'utf8');
    const { data, content } = matter(raw);

    const permalink = data.permalink;
    const slug = permalink ? slugFromPermalink(permalink) : slugFromFilename(file);
    const date = rawDate(raw) || (data.date instanceof Date ? data.date.toISOString() : String(data.date));

    // Hexo allowed `tags:` (plural) and a stray `tag:` (singular). Normalize.
    let tags = data.tags ?? data.tag ?? [];
    if (typeof tags === 'string') tags = [tags];
    tags = Array.isArray(tags) ? tags.filter(Boolean) : [];

    console.log(`→ ${file}  [slug: ${slug}]`);
    const body = await localizeImages(content.trimStart(), slug);

    const fm = buildFrontmatter({ title: data.title, date, permalink, tags, from: data.from });
    await fs.writeFile(path.join(OUT_POSTS, `${slug}.md`), `${fm}\n\n${body.trim()}\n`);
  }

  console.log(`\nDone. Posts: ${files.length}, images downloaded: ${imageCount}.`);
  if (failedDownloads.length) {
    console.log(`\n⚠️  ${failedDownloads.length} image(s) failed (kept original URL):`);
    for (const f of failedDownloads) console.log(`  [${f.slug}] ${f.url} — ${f.reason}`);
    await fs.writeFile(
      path.join(ROOT, 'migration-failed-images.json'),
      JSON.stringify(failedDownloads, null, 2),
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
