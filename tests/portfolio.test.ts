import test from 'node:test';
import assert from 'node:assert/strict';
import { createPortfolio, PORTFOLIO } from '../src/data/portfolio.ts';
import { MILESTONE_SITUATIONS, DURATION_BUCKETS, PROJECT_HEALTHS } from '../src/domain/portfolio.ts';
import type { Milestone } from '../src/domain/portfolio.ts';
import { REFERENCE_DATE } from '../src/domain/types.ts';
import {
  addDays, daysBetween, milestoneDelay, milestoneSituation, milestoneDuration, durationBucket,
  applyPortfolioFilter, omitKey, parsePortfolioFilter, serializePortfolioFilter, describeFilter,
  portfolioKpis, healthDistribution, situationDistribution, durationHistogram, clientBreakdown,
  decompositionTree, problemProjects, progressCurve, ganttRows,
} from '../src/lib/portfolio-analytics.ts';
import type { DecompositionNode } from '../src/lib/portfolio-analytics.ts';

const P = createPortfolio();
const ref = REFERENCE_DATE;
const open = (plannedEnd: string): Milestone => ({ id: 'm', projectId: 'p', seq: 1, name: 'x', responsible: 'r', plannedStart: addDays(plannedEnd, -10), plannedEnd, status: 'En curso', progress: 10, note: '' });
const closed = (plannedEnd: string, actualEnd: string): Milestone => ({ ...open(plannedEnd), actualStart: addDays(plannedEnd, -10), actualEnd, status: 'Completado', progress: 100 });

test('determinism', () => {
  assert.deepEqual(createPortfolio(), createPortfolio());
  assert.equal(PORTFOLIO, PORTFOLIO);
});

test('counts and operational projects', () => {
  assert.equal(P.projects.length, 42);
  assert.equal(P.clients.length, 6);
  const n = (h: string) => P.projects.filter(p => p.health === h).length;
  assert.deepEqual([n('Completado'), n('En curso'), n('Atrasado')], [24, 13, 5]);
  const ops = P.projects.filter(p => p.operational);
  assert.deepEqual(ops.map(p => p.id), ['p1', 'p2', 'p3']);
  assert.deepEqual(ops.map(p => p.name), ['Renovación de estación de bombeo', 'Adecuación de galería de servicios', 'Mejora de conducción de agua industrial']);
  assert.deepEqual(ops.map(p => p.progress), [62, 38, 75]);
  assert.deepEqual(ops.map(p => p.health), ['En curso', 'Atrasado', 'En curso']);
  assert.deepEqual(P.projects.map(p => p.code).slice(0, 3), ['P-001', 'P-002', 'P-003']);
  assert.equal(P.projects[41].code, 'P-042');
  for (const p of P.projects) { const c = P.milestones.filter(m => m.projectId === p.id).length; assert.ok(c >= 5 && c <= 8, p.id); }
});

test('coherence invariants', () => {
  for (const p of P.projects) {
    const ms = P.milestones.filter(m => m.projectId === p.id);
    const delayedOpen = ms.some(m => !m.actualEnd && m.plannedEnd < ref);
    assert.equal(p.health === 'Atrasado', delayedOpen, p.id);
    assert.equal(p.health === 'Completado', ms.every(m => m.status === 'Completado'), p.id);
    if (p.health === 'Completado') assert.ok(p.actualEndDate && p.actualEndDate < ref);
  }
  for (const m of P.milestones) {
    assert.equal(m.status === 'Atrasado', !m.actualEnd && m.plannedEnd < ref, m.id);
    assert.equal(m.status === 'Completado', Boolean(m.actualEnd), m.id);
  }
  assert.ok(situationDistribution(P).every(s => s.count > 0), JSON.stringify(situationDistribution(P)));
  assert.ok(durationHistogram(P).every(s => s.count > 0), JSON.stringify(durationHistogram(P)));
});

test('situation boundaries', () => {
  const s = (k: number) => milestoneSituation(open(addDays(ref, k)), ref);
  assert.equal(s(5), 'Holgura ≤ 5 d'); assert.equal(s(0), 'Holgura ≤ 5 d');
  assert.equal(s(6), 'Holgura 6–30 d'); assert.equal(s(30), 'Holgura 6–30 d');
  assert.equal(s(31), 'Holgura > 30 d');
  assert.equal(s(-1), 'Atraso 1–15 d'); assert.equal(s(-15), 'Atraso 1–15 d');
  assert.equal(s(-16), 'Atraso 16–30 d'); assert.equal(s(-30), 'Atraso 16–30 d');
  assert.equal(s(-31), 'Atraso > 30 d');
  assert.equal(milestoneSituation(closed('2026-08-01', '2026-08-01'), ref), 'Cerrado en plazo');
  assert.equal(milestoneSituation(closed('2026-08-01', '2026-08-02'), ref), 'Cerrado con atraso');
  assert.equal(milestoneDelay(open(addDays(ref, -7)), ref), 7);
  assert.equal(milestoneDelay(open(addDays(ref, 4)), ref), -4);
  assert.equal(milestoneDelay(closed('2026-08-01', '2026-08-04'), ref), 3);
  assert.equal(daysBetween('2026-02-27', '2026-03-02'), 3);
});

test('duration bucket boundaries', () => {
  const b = durationBucket;
  assert.deepEqual([b(0), b(3), b(4), b(7), b(8), b(10), b(11), b(15), b(16), b(30), b(31)],
    ['0–3 d', '0–3 d', '4–7 d', '4–7 d', '8–10 d', '8–10 d', '11–15 d', '11–15 d', '16–30 d', '16–30 d', '> 30 d']);
  const m = { ...open('2026-10-20'), actualStart: '2026-10-01' };
  assert.equal(milestoneDuration(m, ref), 7);
  assert.equal(milestoneDuration({ ...closed('2026-08-10', '2026-08-12'), actualStart: '2026-08-01' }, ref), 11);
});

test('applyPortfolioFilter semantics', () => {
  assert.equal(applyPortfolioFilter(P, {}).projects.length, 42);
  const atr = applyPortfolioFilter(P, { health: 'Atrasado' });
  assert.equal(atr.projects.length, 5);
  assert.ok(atr.milestones.every(m => atr.projects.some(p => p.id === m.projectId)));
  assert.equal(atr.milestones.length, P.milestones.filter(m => atr.projects.some(p => p.id === m.projectId)).length);
  const late = applyPortfolioFilter(P, { situation: 'Atraso > 30 d' });
  assert.ok(late.milestones.length > 0 && late.milestones.every(m => milestoneSituation(m, ref) === 'Atraso > 30 d'));
  assert.ok(late.projects.every(p => late.milestones.some(m => m.projectId === p.id)));
  assert.ok(late.projects.length < 42);
  const cl = P.clients[0].id;
  const combo = applyPortfolioFilter(P, { clientId: cl, situation: 'Cerrado en plazo' });
  assert.ok(combo.projects.every(p => p.clientId === cl));
  assert.ok(combo.milestones.every(m => milestoneSituation(m, ref) === 'Cerrado en plazo'));
  const f = { health: 'Atrasado' as const, clientId: cl };
  assert.deepEqual(omitKey(f, 'health'), { clientId: cl });
  assert.equal(f.health, 'Atrasado');
  assert.equal(applyPortfolioFilter(P, omitKey({ health: 'Atrasado' }, 'health')).projects.length, 42);
  const one = applyPortfolioFilter(P, { milestoneId: P.milestones[0].id });
  assert.equal(one.milestones.length, 1); assert.equal(one.projects.length, 1);
});

test('parse / serialize', () => {
  const f = { health: 'En curso' as const, clientId: P.clients[1].id, situation: 'Holgura ≤ 5 d' as const, bucket: '> 30 d' as const, projectId: 'p1', milestoneId: P.milestones[0].id };
  const ser = serializePortfolioFilter(f);
  assert.deepEqual(Object.keys(ser), ['estado', 'cliente', 'situacion', 'tramo', 'proyecto', 'hito']);
  assert.deepEqual(parsePortfolioFilter(ser, P), f);
  assert.deepEqual(parsePortfolioFilter(new URLSearchParams(ser), P), f);
  assert.deepEqual(parsePortfolioFilter({ estado: 'Nada', cliente: 'zz', situacion: 'x', tramo: '1', proyecto: 'p999', hito: 'q', other: 'y' } as Record<string, string>, P), {});
  assert.deepEqual(parsePortfolioFilter({ estado: 'Atrasado', cliente: 'zz' }, P), { health: 'Atrasado' });
  assert.deepEqual(serializePortfolioFilter({}), {});
  const chips = describeFilter({ clientId: P.clients[0].id, health: 'Atrasado' }, P);
  assert.ok(chips.some(c => c.key === 'clientId' && c.label === `Cliente: ${P.clients[0].name}`));
  assert.ok(chips.some(c => c.key === 'health' && c.label === 'Estado: Atrasado'));
});

test('kpis and distributions', () => {
  const k = portfolioKpis(P);
  assert.equal(k.projects, 42); assert.equal(k.milestones, P.milestones.length); assert.equal(k.clients, 6);
  assert.equal(k.byHealth.Completado + k.byHealth['En curso'] + k.byHealth.Atrasado, k.projects);
  assert.equal(k.completionRate, Math.round(24 / 42 * 100));
  assert.ok(k.delayedMilestones > 0 && k.onTimeMilestoneRate > 0 && k.onTimeMilestoneRate <= 100 && k.budgetMusd > 0);
  const empty = applyPortfolioFilter(P, { projectId: 'nope' });
  assert.equal(portfolioKpis(empty).completionRate, 0);
  const hd = healthDistribution(empty);
  assert.deepEqual(hd.map(h => h.health), [...PROJECT_HEALTHS]); assert.ok(hd.every(h => h.count === 0));
  assert.deepEqual(situationDistribution(empty).map(s => s.situation), [...MILESTONE_SITUATIONS]);
  assert.deepEqual(durationHistogram(empty).map(s => s.bucket), [...DURATION_BUCKETS]);
  assert.equal(situationDistribution(P).reduce((a, s) => a + s.count, 0), P.milestones.length);
  assert.equal(durationHistogram(P).reduce((a, s) => a + s.count, 0), P.milestones.length);
  const cb = clientBreakdown(P, P.clients);
  assert.equal(cb.reduce((a, c) => a + c.total, 0), 42);
  for (let i = 1; i < cb.length; i++) assert.ok(cb[i - 1].total >= cb[i].total);
});

test('decomposition tree', () => {
  const t = decompositionTree(P);
  assert.equal(t.level, 'root'); assert.equal(t.count, 42);
  assert.equal((t.children ?? []).reduce((a, c) => a + c.count, 0), 42);
  const walk = (n: DecompositionNode) => {
    assert.ok(Object.keys(n.filter).length > 0 || n.level === 'root', n.id);
    if (n.level === 'health') assert.equal((n.children ?? []).reduce((a, c) => a + c.count, 0), P.milestones.filter(m => P.projects.find(p => p.id === m.projectId)?.health === n.label).length);
    if (n.level === 'situation') assert.ok((n.children ?? []).length <= 8);
    if (n.level === 'milestone') assert.ok(n.detail && n.detail.milestoneId);
    (n.children ?? []).forEach(walk);
  };
  walk(t);
  const ids: string[] = []; const collect = (n: DecompositionNode) => { ids.push(n.id); (n.children ?? []).forEach(collect); }; collect(t);
  assert.equal(new Set(ids).size, ids.length);
});

test('problem projects, curve, gantt', () => {
  const rows = problemProjects(P);
  assert.ok(rows.length >= 5);
  for (let i = 1; i < rows.length; i++) assert.ok(rows[i - 1].daysOpen >= rows[i].daysOpen);
  assert.ok(P.projects.filter(p => p.health === 'Atrasado').every(p => rows.some(r => r.projectId === p.id && r.daysOpen > 0)));
  const c = progressCurve(P);
  assert.equal(c[0].month, '2025-03'); assert.equal(c[c.length - 1].month, '2026-12'); assert.equal(c[0].label, 'mar 25');
  for (let i = 1; i < c.length; i++) {
    assert.ok(c[i].plannedCompleted >= c[i - 1].plannedCompleted);
    const a = c[i].actualCompleted, b = c[i - 1].actualCompleted;
    if (a !== null) assert.ok(b !== null && a >= b);
  }
  assert.equal(c[c.length - 1].actualCompleted, null);
  const g = ganttRows(P);
  assert.equal(g.length, 42);
  for (let i = 1; i < g.length; i++) assert.ok(g[i - 1].plannedStart <= g[i].plannedStart);
});
