import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSeed } from '../src/data/seed.ts';
import { easeOutCubic, countUpValue, projectBreakdown, lifecycleSteps } from '../src/lib/overview-charts.ts';

test('easing and count-up clamp and end at the target', () => {
  assert.equal(easeOutCubic(0), 0);
  assert.equal(easeOutCubic(1), 1);
  assert.ok(easeOutCubic(0.5) > 0.5);
  assert.equal(countUpValue(12, 0), 0);
  assert.equal(countUpValue(12, 5), 12);
  assert.equal(countUpValue(12, -1), 0);
});

test('project breakdown splits active and closed and respects scope', () => {
  const data = createSeed();
  const rows = projectBreakdown(data);
  assert.equal(rows.length, data.projects.length);
  assert.equal(rows.reduce((n, r) => n + r.active + r.closed, 0), data.findings.length);
  const one = projectBreakdown(data, data.projects[0].id);
  assert.equal(one.length, 1);
});

test('lifecycle steps follow the flow order with counts', () => {
  const steps = lifecycleSteps({ Abierto: 2, 'En corrección': 1, 'Pendiente de verificación': 3, Cerrado: 4 });
  assert.deepEqual(steps.map(s => s.state), ['Abierto', 'En corrección', 'Pendiente de verificación', 'Cerrado']);
  assert.deepEqual(steps.map(s => s.count), [2, 1, 3, 4]);
});

import { countUpFrame } from '../src/lib/overview-charts.ts';
test('countUpFrame: integer, monotonic from start to target in both directions', () => {
  for (const [s, t] of [[0, 14], [3, 20], [20, 3], [5, 5]]) {
    const frames = Array.from({ length: 21 }, (_, i) => countUpFrame(s, t, i / 20));
    assert.equal(frames[0], s); assert.equal(frames[20], t);
    assert.ok(frames.every(Number.isInteger));
    for (let i = 1; i < frames.length; i++) assert.ok(t >= s ? frames[i] >= frames[i - 1] : frames[i] <= frames[i - 1]);
  }
  assert.equal(countUpFrame(0, 10, 0.5), countUpValue(10, 0.5));
});
