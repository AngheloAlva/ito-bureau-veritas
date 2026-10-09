import test from 'node:test';
import assert from 'node:assert/strict';
import { SITE_COMPONENTS, componentFindings, componentStatus } from '../src/lib/site-map.ts';
import { createSeed } from '../src/data/seed.ts';
import { isActive } from '../src/domain/core.ts';
import type { Data, Finding } from '../src/domain/types.ts';

const finding = (id: string, inspectionId: string, over: Partial<Finding> = {}): Finding => ({
  id, code: id, inspectionId, title: id, description: '', specialty: 'Mecánica', location: '', severity: 'Media',
  state: 'Abierto', responsibleId: 'u2', createdAt: '2026-10-01T10:00:00Z', dueDate: '2026-12-01', correctiveAction: '', ...over,
});
const base = { version: 1, users: [], projects: [], evidence: [], events: [], inspectionEvents: [], documents: [] };
const inspections = [
  { id: 'i1', projectId: 'p1' }, { id: 'i2', projectId: 'p1' }, { id: 'i3', projectId: 'p2' },
] as Data['inspections'];
const fx = (findings: Finding[]): Data => ({ ...base, inspections, findings } as Data);

test('site components cover three projects with expected kinds', () => {
  assert.deepEqual([...new Set(SITE_COMPONENTS.map(c => c.projectId))].sort(), ['p1', 'p2', 'p3']);
  assert.equal(SITE_COMPONENTS.filter(c => c.projectId === 'p1' && c.kind === 'pump').length, 3);
  assert.equal(SITE_COMPONENTS.filter(c => c.kind === 'gallery').length, 1);
});

test('active findings are distributed deterministically by order modulo component count', () => {
  const p1 = SITE_COMPONENTS.filter(c => c.projectId === 'p1');
  const fs = [finding('a', 'i1'), finding('b', 'i2'), finding('c', 'i1', { state: 'Cerrado' }), finding('d', 'i2')];
  const data = fx(fs);
  // order: inspection order then finding order, active only: a(i1), b(i2), d(i2)
  assert.deepEqual(componentFindings(data, p1[0].id).map(f => f.id), ['a']);
  assert.deepEqual(componentFindings(data, p1[1].id).map(f => f.id), ['b']);
  assert.deepEqual(componentFindings(data, p1[2].id).map(f => f.id), ['d']);
  assert.deepEqual(componentFindings(data, p1[3].id), []);
  assert.deepEqual(componentFindings(fx(fs), p1[0].id), componentFindings(data, p1[0].id));
});

test('every active project finding lands on exactly one component', () => {
  const data = createSeed();
  for (const p of ['p1', 'p2', 'p3']) {
    const active = data.findings.filter(f => isActive(f) && data.inspections.find(i => i.id === f.inspectionId)?.projectId === p);
    const placed = SITE_COMPONENTS.filter(c => c.projectId === p).flatMap(c => componentFindings(data, c.id));
    assert.equal(placed.length, active.length);
    assert.equal(new Set(placed.map(f => f.id)).size, active.length);
  }
});

test('status: critical > warning (overdue or Alta) > ok', () => {
  const [c0, c1, c2, c3] = SITE_COMPONENTS.filter(c => c.projectId === 'p1');
  const data = fx([
    finding('a', 'i1', { severity: 'Crítica' }),
    finding('b', 'i1', { severity: 'Alta' }),
    finding('c', 'i1', { dueDate: '2026-09-01' }),
    finding('d', 'i1', { severity: 'Crítica', state: 'Cerrado' }),
  ]);
  assert.equal(componentStatus(data, c0.id), 'critical');
  assert.equal(componentStatus(data, c1.id), 'warning');
  assert.equal(componentStatus(data, c2.id), 'warning');
  assert.equal(componentStatus(data, c3.id), 'ok');
});
