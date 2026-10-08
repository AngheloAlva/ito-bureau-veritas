export const FILTER_KEYS = {
  findings: ['project', 'query', 'state', 'severity', 'responsible', 'due', 'active'],
  inspections: ['project', 'from', 'to', 'inspector', 'specialty', 'visitState'],
} as const;
export type FilterKind = keyof typeof FILTER_KEYS;
export type FilterChoices = Partial<Record<string, readonly string[]>>;
const keys = [...new Set([...FILTER_KEYS.findings, ...FILTER_KEYS.inspections])];

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** URL is the sole list-filter state. Absent project inherits; explicit empty means all. */
export function parseListFilters(search: string, choices: FilterChoices, globalProject = ''): Record<string, string> {
  const params = new URLSearchParams(search);
  const result: Record<string, string> = {};
  for (const key of keys) {
    const value = key === 'project' && !params.has(key) ? globalProject : params.get(key) ?? '';
    result[key] = key === 'active' ? (value === '1' ? '1' : '')
      : key === 'from' || key === 'to' ? (validDate(value) ? value : '')
      : choices[key] ? (choices[key]!.includes(value) ? value : '') : value;
  }
  return result;
}

/** Mutate only specified filters; keep unknown keys, duplicate values and fragments. */
export function updateListFilters(href: string, changes: Record<string, string>): string {
  const url = new URL(href, 'https://list.invalid');
  for (const [key, value] of Object.entries(changes)) {
    if (value || key === 'project') url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  return `${url.pathname}${url.search}${url.hash}`;
}

/** Header combines reactive route/search with the live browser fragment. */
export function projectScopeHref(pathname: string, search: string, hash: string, project: string): string {
  return updateListFilters(`${pathname}${search ? `?${search}` : ''}${hash}`, { project });
}

/** Clear this list, including inherited project scope, without mutating global scope. */
export function clearListFilters(href: string, kind: FilterKind): string {
  return updateListFilters(href, Object.fromEntries(FILTER_KEYS[kind].map(key => [key, ''])));
}
