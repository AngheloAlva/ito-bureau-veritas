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
