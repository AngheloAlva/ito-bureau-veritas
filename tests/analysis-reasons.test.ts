import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSeed } from '../src/data/seed.ts';
import { analyze, draftReport } from '../src/domain/core.ts';
import { concentrationMatrix } from '../src/domain/analysis-matrix.ts';

test('reasons are specific, differ across priorities and cite data', () => {
  const seed = createSeed();
  const a = analyze(seed);
  assert.ok(a.priorities.length > 2);
  assert.ok(new Set(a.priorities.map(p => p.reason)).size > a.priorities.length / 2);
  const h1 = a.priorities.find(p => p.findingId === 'H-001')!;
  assert.match(h1.reason, /vencido hace 2 días \(plazo 06\/10\)/);
  assert.match(h1.reason, /Diego Soto/);
  assert.match(a.priorities.find(p => p.findingId === 'H-008')!.reason, /vence hoy.*sin evidencia de corrección/);
  assert.match(h1.suggestion, /registro firmado/);
  assert.match(h1.suggestion, /no implica falla de la instalación/);
  for (const p of a.priorities) {
    const f = seed.findings.find(x => x.id === p.findingId)!;
    if (f.dueDate < '2026-10-08') assert.match(p.reason, /vencido hace \d+ días?/);
    assert.match(p.reason, new RegExp(f.severity));
  }
  assert.ok(a.priorities.some(p => /responsable .+ tiene (otro pendiente vencido|otros \d+ pendientes vencidos)/.test(p.reason)));
  assert.ok(a.priorities.some(p => p.reason.includes('En corrección')));
  assert.ok(draftReport(a).includes(h1.reason));
});

test('concentration matrix counts active and overdue per project × specialty', () => {
  const seed = createSeed();
  const m = concentrationMatrix(seed);
  const total = m.cells.reduce((s, c) => s + c.active, 0);
  assert.equal(total, seed.findings.filter(f => f.state !== 'Cerrado').length);
  assert.ok(m.cells.every(c => c.overdue <= c.active));
  assert.ok(m.max >= 1);
  const scoped = concentrationMatrix(seed, 'p1');
  assert.deepEqual(scoped.projects.map(p => p.id), ['p1']);
});

test('heatmap has a single hotspot: P-002 × Civil, 4 active and 3 overdue', () => {
  const seed = createSeed();
  const m = concentrationMatrix(seed);
  const cell = (p: string, s: string, mm = m) => mm.cells.find(c => c.projectId === p && c.specialty === s);
  assert.equal(m.max, 4);
  assert.deepEqual(m.cells.filter(c => c.active === m.max).map(c => [c.projectId, c.specialty]), [['p2', 'Civil']]);
  assert.deepEqual([cell('p2', 'Civil')!.active, cell('p2', 'Civil')!.overdue], [4, 3]);
  assert.ok(m.cells.filter(c => !(c.projectId === 'p2' && c.specialty === 'Civil')).every(c => c.active <= 2));
  assert.equal(cell('p3', 'Eléctrica'), undefined);
  assert.equal(cell('p3', 'Hidráulica'), undefined);
  const p2 = concentrationMatrix(seed, 'p2');
  assert.deepEqual(p2.cells.map(c => c.projectId), ['p2', 'p2', 'p2']);
  assert.equal(p2.max, 4);
  assert.equal(concentrationMatrix(seed, 'p3').max, 1);
});

test('open findings do not claim registered correction evidence; analysis keeps counts snapshot', () => {
  const seed = createSeed();
  const a = analyze(seed);
  assert.doesNotMatch(a.priorities.find(p => p.findingId === 'H-001')!.reason, /evidencia de corrección registrada/);
  assert.match(a.priorities.find(p => p.findingId === 'H-001')!.reason, /sin evidencia de corrección|vencido/);
  assert.equal(a.counts!.active, 14);
  const before = { ...a.counts! };
  seed.findings[0].state = 'Cerrado';
  assert.deepEqual(a.counts, before);
  assert.equal(analyze(seed).counts!.active, 13);
});
