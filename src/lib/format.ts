// Small display helpers shared by the article templates.

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "8 Oct" — the byline date format used across the design. */
export function formatDay(d: Date): string {
  return `${d.getUTCDate()} ${MON[d.getUTCMonth()]}`;
}

/** enum author id -> display name, e.g. 'co-founder-2' -> 'Co-founder 2'. */
export function authorName(id: 'co-founder-1' | 'co-founder-2'): string {
  return id === 'co-founder-1' ? 'Co-founder 1' : 'Co-founder 2';
}
