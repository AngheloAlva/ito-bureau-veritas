import test from 'node:test';
import assert from 'node:assert/strict';
import { monthTicks, weekTicks, xForDate, spanWidth } from '../src/lib/gantt-scale.ts';

test('monthTicks covers range with day counts', () => {
  const t = monthTicks('2026-01-15', '2026-03-10');
  assert.deepEqual(t.map(x => x.start), ['2026-01-01', '2026-02-01', '2026-03-01']);
  assert.deepEqual(t.map(x => x.days), [31, 28, 31]);
});
test('xForDate is linear from origin', () => {
  assert.equal(xForDate('2026-01-11', '2026-01-01', 2), 20);
  assert.equal(xForDate('2025-12-31', '2026-01-01', 2), -2);
});
test('spanWidth is inclusive with minimum', () => {
  assert.equal(spanWidth('2026-01-01', '2026-01-10', 2), 20);
  assert.equal(spanWidth('2026-01-01', '2026-01-01', 1), 4);
});
test('weekTicks returns mondays', () => {
  assert.deepEqual(weekTicks('2026-10-06', '2026-10-20'), ['2026-10-12', '2026-10-19']);
});
