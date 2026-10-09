import { test } from 'node:test';
import assert from 'node:assert/strict';
import { donutSegments, linePath, niceMax } from '../src/lib/chart-geometry.ts';

test('donutSegments splits the circle proportionally and skips empties', () => {
  const s = donutSegments([3, 1, 0]);
  assert.equal(s.length, 3);
  assert.ok(Math.abs(s[0].share - 0.75) < 1e-9);
  assert.equal(s[2].path, '');
  assert.ok(s[0].path.startsWith('M'));
});
test('donutSegments handles a single full segment and all zeros', () => {
  assert.ok(donutSegments([5])[0].path.length > 0);
  assert.equal(donutSegments([0, 0]).every(x => x.path === '' && x.share === 0), true);
});
test('linePath builds M/L path, breaking on nulls', () => {
  assert.equal(linePath([[0, 1], [1, 2]]), 'M0,1L1,2');
  assert.equal(linePath([[0, 1], null, [2, 3]]), 'M0,1M2,3');
  assert.equal(linePath([]), '');
});
test('niceMax rounds up to a friendly axis maximum', () => {
  assert.equal(niceMax(0), 1);
  assert.equal(niceMax(83), 100);
  assert.equal(niceMax(274), 300);
  assert.equal(niceMax(7), 8);
});
