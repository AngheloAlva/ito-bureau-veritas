import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PORTFOLIO } from '../src/data/portfolio.ts';
import { aggregate, describeSpec, isCompatible, loadCustomCharts, saveCustomCharts, CUSTOM_CHARTS_KEY } from '../src/lib/chart-builder.ts';
import type { CustomChart } from '../src/lib/chart-builder.ts';
import { portfolioKpis } from '../src/lib/portfolio-analytics.ts';

const mem = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v) }; };

test('projects by health is zero-filled, ordered and sums to the project total', () => {
  const rows = aggregate(PORTFOLIO, { metric: 'projects', dimension: 'health' });
  assert.deepEqual(rows.map(r => r.key), ['Completado', 'En curso', 'Atrasado']);
  assert.equal(rows.reduce((a, r) => a + r.value, 0), PORTFOLIO.projects.length);
  assert.deepEqual(rows[0].filter, { health: 'Completado' });
  assert.ok(rows[0].tone);
});
test('delayed milestones by client sums to KPI and is sorted desc with clientId filter', () => {
  const rows = aggregate(PORTFOLIO, { metric: 'delayedMilestones', dimension: 'client' });
  assert.equal(rows.reduce((a, r) => a + r.value, 0), portfolioKpis(PORTFOLIO).delayedMilestones);
  for (let i = 1; i < rows.length; i++) assert.ok(rows[i - 1].value >= rows[i].value);
  assert.ok(rows[0].filter?.clientId);
});
test('project metric by milestone dimension counts distinct projects', () => {
  const rows = aggregate(PORTFOLIO, { metric: 'projects', dimension: 'situation' });
  assert.equal(rows.length, 8);
  for (const r of rows) assert.ok(r.value <= PORTFOLIO.projects.length);
  const ms = aggregate(PORTFOLIO, { metric: 'milestones', dimension: 'situation' });
  assert.equal(ms.reduce((a, r) => a + r.value, 0), PORTFOLIO.milestones.length);
});
test('months are chronological and have no cross-filter', () => {
  const rows = aggregate(PORTFOLIO, { metric: 'projects', dimension: 'plannedEndMonth' });
  const keys = rows.map(r => r.key);
  assert.deepEqual(keys, [...keys].sort());
  assert.equal(rows[0].filter, undefined);
  assert.equal(rows.reduce((a, r) => a + r.value, 0), PORTFOLIO.projects.length);
});
test('budget and avgProgress aggregate projects; empty view yields zeros', () => {
  const b = aggregate(PORTFOLIO, { metric: 'budget', dimension: 'health' });
  assert.ok(Math.abs(b.reduce((a, r) => a + r.value, 0) - portfolioKpis(PORTFOLIO).budgetMusd) < 0.2);
  const empty = { clients: PORTFOLIO.clients, projects: [], milestones: [] };
  assert.equal(aggregate(empty, { metric: 'avgDelay', dimension: 'health' }).every(r => r.value === 0), true);
  assert.deepEqual(aggregate(empty, { metric: 'projects', dimension: 'manager' }), []);
});
test('isCompatible rejects donut for averages with a reason', () => {
  assert.deepEqual(isCompatible({ metric: 'avgDelay', dimension: 'client', chart: 'donut' }), { ok: false, reason: 'La dona solo admite totales; use barras o línea para promedios.' });
  assert.equal(isCompatible({ metric: 'projects', dimension: 'client', chart: 'donut' }).ok, true);
});
test('describeSpec builds Spanish titles', () => {
  assert.equal(describeSpec({ metric: 'delayedMilestones', dimension: 'client' }), 'Hitos atrasados por cliente');
  assert.equal(describeSpec({ metric: 'avgProgress', dimension: 'plannedEndMonth' }), 'Avance físico promedio por mes de término planificado');
});
test('storage round-trips, rejects garbage and caps at 12', () => {
  const s = mem();
  assert.deepEqual(loadCustomCharts(s), []);
  s.setItem(CUSTOM_CHARTS_KEY, '{nope');
  assert.deepEqual(loadCustomCharts(s), []);
  s.setItem(CUSTOM_CHARTS_KEY, JSON.stringify([{ id: 1 }, { id: 'a', title: 't', spec: { metric: 'x', dimension: 'health', chart: 'bar' }, createdAt: 'z' }]));
  assert.deepEqual(loadCustomCharts(s), []);
  const list: CustomChart[] = Array.from({ length: 15 }, (_, i) => ({ id: `c${i}`, title: `t${i}`, spec: { metric: 'projects', dimension: 'health', chart: 'bar' }, createdAt: '2026-01-01' }));
  saveCustomCharts(s, list);
  assert.equal(loadCustomCharts(s).length, 12);
});
