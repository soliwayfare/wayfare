import rss from '@astrojs/rss';
import { marked } from 'marked';
import { getSortedPosts, postPath } from '../../utils/posts';
import { withBase } from '../../utils/url';
import { SITE } from '../../consts';

// Feed served at /blog/atom.xml to preserve the old Hexo subscription URL.
// Includes full post content (old feed had `content: true`), limited to 10.
export async function GET(context) {
  const posts = (await getSortedPosts()).slice(0, 10);
  return rss({
    title: SITE.title,
    description: SITE.subtitle,
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      link: withBase(postPath(post)),
      content: marked.parse(post.body ?? '', { async: false }),
    })),
  });
}
