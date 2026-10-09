const toUtc = (d: string) => { const [y, m, day] = d.split('-').map(Number); return Date.UTC(y, m - 1, day); };
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
const DAY = 86400000;

export type MonthTick = { start: string; year: number; month: number; days: number };

export function monthTicks(from: string, to: string): MonthTick[] {
  const out: MonthTick[] = [];
  const f = new Date(toUtc(from));
  let y = f.getUTCFullYear(), m = f.getUTCMonth();
  const end = toUtc(to);
  while (Date.UTC(y, m, 1) <= end) {
    out.push({ start: iso(Date.UTC(y, m, 1)), year: y, month: m, days: new Date(Date.UTC(y, m + 1, 0)).getUTCDate() });
    m++; if (m > 11) { m = 0; y++; }
  }
  return out;
}

export function weekTicks(from: string, to: string): string[] {
  const out: string[] = [];
  let t = toUtc(from);
  while (new Date(t).getUTCDay() !== 1) t += DAY;
  for (; t <= toUtc(to); t += 7 * DAY) out.push(iso(t));
  return out;
}

export function xForDate(date: string, origin: string, pxPerDay: number): number {
  return Math.round((toUtc(date) - toUtc(origin)) / DAY) * pxPerDay;
}

/** Inclusive span width, minimum 4px. */
export function spanWidth(start: string, end: string, pxPerDay: number, min = 4): number {
  const days = Math.round((toUtc(end) - toUtc(start)) / DAY) + 1;
  return Math.max(min, days * pxPerDay);
}
