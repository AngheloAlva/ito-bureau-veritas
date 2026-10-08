import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDate, formatDateTime, formatDatesInText, pluralize } from '../src/lib/format.ts';

test('date-only is DD/MM/YYYY', () => assert.equal(formatDate('2026-10-08'), '08/10/2026'));
test('date-time is DD/MM/YYYY · HH:MM 24h in Santiago', () => {
  assert.equal(formatDateTime('2026-10-08T18:05:00Z'), '08/10/2026 · 15:05');
  assert.equal(formatDateTime('2026-10-08T23:30:00Z'), '08/10/2026 · 20:30');
});
test('ISO dates inside text are rewritten', () => assert.equal(formatDatesInText('Plazo: 2026-10-08 → 2026-10-12'), 'Plazo: 08/10/2026 → 12/10/2026'));
test('pluralize', () => {
  assert.equal(pluralize(1, 'hallazgo'), '1 hallazgo');
  assert.equal(pluralize(0, 'hallazgo'), '0 hallazgos');
  assert.equal(pluralize(3, 'visita'), '3 visitas');
  assert.equal(pluralize(2, 'inspección', 'inspecciones'), '2 inspecciones');
});
