import test from 'node:test';
import assert from 'node:assert/strict';
import { paginate, pageWindow } from '../src/lib/paginate.ts';

const items = Array.from({ length: 24 }, (_, i) => i + 1);

test('paginate slices and reports range', () => {
  const p = paginate(items, 2, 10);
  assert.deepEqual(p.items, [11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  assert.deepEqual([p.page, p.pageCount, p.from, p.to, p.total], [2, 3, 11, 20, 24]);
});
test('paginate clamps out-of-range and invalid pages', () => {
  assert.equal(paginate(items, 99, 10).page, 3);
  assert.equal(paginate(items, 0, 10).page, 1);
  assert.equal(paginate(items, NaN, 10).page, 1);
  assert.deepEqual(paginate(items, 3, 10).items, [21, 22, 23, 24]);
});
test('paginate handles empty list', () => {
  const p = paginate([], 1, 10);
  assert.deepEqual([p.items.length, p.pageCount, p.from, p.to], [0, 1, 0, 0]);
});
test('pageWindow collapses long ranges', () => {
  assert.deepEqual(pageWindow(1, 3), [1, 2, 3]);
  assert.deepEqual(pageWindow(5, 10), [1, '…', 4, 5, 6, '…', 10]);
  assert.deepEqual(pageWindow(1, 10), [1, 2, '…', 10]);
});
