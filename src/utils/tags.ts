import { getSortedPosts, type Post } from './posts';

// Map of tag -> posts (newest first), plus a sorted unique tag list.
export async function getTagMap(): Promise<Map<string, Post[]>> {
  const posts = await getSortedPosts();
  const map = new Map<string, Post[]>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      const list = map.get(tag) ?? [];
      list.push(post);
      map.set(tag, list);
    }
  }
  return map;
}
