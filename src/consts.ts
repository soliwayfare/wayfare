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

// Google Analytics (Universal Analytics) tracking id.
export const GA_ID = 'UA-65598064-1';

// Posts per page on the paginated index.
export const PER_PAGE = 10;

// Top navigation menu. External links open in a new tab.
export const NAV: { label: string; href: string; external?: boolean }[] = [
  { label: 'HOME', href: 'https://www.cnwangjie.com/', external: true },
  { label: 'BLOG', href: '/' },
  { label: 'ARCHIVE', href: '/archives/' },
  { label: 'RSS', href: '/atom.xml' },
];
