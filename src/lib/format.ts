const SANTIAGO = 'America/Santiago';

/** Date-only ISO (YYYY-MM-DD) to DD/MM/YYYY. */
export const formatDate = (value: string) => value.slice(0, 10).split('-').reverse().join('/');

/** Instant to "DD/MM/YYYY · HH:MM" (24h, Santiago). */
export function formatDateTime(value: string) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: SANTIAGO }).formatToParts(new Date(value)).map(p => [p.type, p.value]));
  return `${parts.day}/${parts.month}/${parts.year} · ${parts.hour}:${parts.minute}`;
}

/** Rewrites ISO dates embedded in free text. */
export const formatDatesInText = (text: string) => text.replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g, '$3/$2/$1');

/** "1 hallazgo" / "2 hallazgos". Pass `plural` for irregular forms. */
export const pluralize = (count: number, singular: string, plural = `${singular}s`) => `${count} ${count === 1 ? singular : plural}`;
