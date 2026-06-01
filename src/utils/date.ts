// Format a post date as the old apollo theme did (moment 'll' under zh-cn),
// e.g. "2017年8月2日". A machine-readable ISO date is produced separately for
// the <time datetime> attribute.
const formatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

export function formatDate(date: Date): string {
  return formatter.format(date);
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
