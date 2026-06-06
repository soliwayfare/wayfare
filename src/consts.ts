// Site-wide constants, ported from the old Hexo _config.yml / theme config.
export const SITE = {
  title: "WangJie's blog",
  subtitle: '分享生活中的乐趣',
  author: 'Wang Jie',
  description: '分享生活中的乐趣',
  lang: 'zh-cn',
  // Year the blog started; used in the copyright footer.
  startYear: 2015,
} as const;

// Disqus comment thread shortname.
export const DISQUS_SHORTNAME = 'cnwangjie';

// Mastodon account embedded on the /mastodon/ page. Public statuses are fetched
// client-side from the instance's REST API, so no access token is needed.
export const MASTODON = {
  instance: 'c.im',
  handle: 'wangjie',
} as const;

// Default Open Graph / Twitter share image (the GitHub avatar, served at 512px).
export const OG_IMAGE = 'https://github.com/cnwangjie.png?size=512';

// Profiles linked from the homepage; emitted as schema.org Person.sameAs in JSON-LD.
export const SAME_AS = [
  'https://github.com/cnwangjie',
  'https://x.com/wangjie000',
  'https://steamcommunity.com/id/cnwangjie/',
];

// Posts per page on the paginated index.
export const PER_PAGE = 10;

// The blog is served under this path prefix; the homepage lives at the site root.
export const BLOG_BASE = '/blog';

// Top navigation menu. `href` values are full, root-absolute site paths.
// External links open in a new tab.
export const NAV: { label: string; href: string; external?: boolean }[] = [
  { label: 'HOME', href: '/' },
  { label: 'BLOG', href: '/blog/' },
  { label: 'ARCHIVE', href: '/blog/archives/' },
  { label: 'MASTODON', href: '/blog/mastodon/' },
  { label: 'RSS', href: '/blog/atom.xml' },
];
