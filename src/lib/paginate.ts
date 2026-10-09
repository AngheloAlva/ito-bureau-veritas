export const PAGE_SIZE = 10;

export type Page<T> = { items: T[]; page: number; pageCount: number; from: number; to: number; total: number };

/** Pure client-side pagination; page is clamped to a valid 1-based value. */
export function paginate<T>(items: readonly T[], page: number, size = PAGE_SIZE): Page<T> {
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / size));
  const current = Number.isFinite(page) ? Math.min(Math.max(1, Math.trunc(page)), pageCount) : 1;
  const start = (current - 1) * size;
  const slice = items.slice(start, start + size);
  return { items: slice, page: current, pageCount, from: total ? start + 1 : 0, to: start + slice.length, total };
}

/** Compact page list: first, last and neighbours of current, with ellipses. */
export function pageWindow(page: number, pageCount: number): (number | '…')[] {
  const shown = [...new Set([1, page - 1, page, page + 1, pageCount])].filter(n => n >= 1 && n <= pageCount).sort((a, b) => a - b);
  const out: (number | '…')[] = [];
  shown.forEach((n, i) => { if (i && n - shown[i - 1] > 1) out.push('…'); out.push(n); });
  return out;
}
