/** Date-only UI values are local calendar components, never UTC instants. */
export function parseCalendarDate(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) return undefined;
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(12, 0, 0, 0);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date : undefined;
}

export function serializeCalendarDate(date: Date | undefined): string {
  if (!date || Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  if (year < 1 || year > 9999) return '';
  return `${String(year).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function calendarLabel(value: string): string {
  const date = parseCalendarDate(value);
  return date ? date.toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Seleccione fecha';
}
