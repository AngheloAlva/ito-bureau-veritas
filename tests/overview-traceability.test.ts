import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSeed } from '../src/data/seed.ts';
import { overviewTraceability } from '../src/lib/overview-traceability.ts';

const fixture = () => {
  const data = createSeed();
  data.inspections = [
    { ...data.inspections[0], id: 'visit', projectId: 'p1', date: '2026-10-01', visitState: 'Completada' },
    { ...data.inspections[0], id: 'planned', projectId: 'p1', date: '2026-10-08', visitState: 'Programada' },
    { ...data.inspections[0], id: 'old', projectId: 'p1', date: '2026-09-30' },
    { ...data.inspections[0], id: 'future', projectId: 'p1', date: '2026-10-09' },
    { ...data.inspections[0], id: 'other', projectId: 'p2', date: '2026-10-08' },
  ];
  data.findings = [{ ...data.findings[0], id: 'finding', inspectionId: 'visit', createdAt: '2026-10-02T12:00:00Z', state: 'Pendiente de verificación', correctiveAction: 'Registro firmado' }];
  data.evidence = [{ ...data.evidence[0], id: 'proof', findingId: 'finding', phase: 'corrección', addedAt: '2026-10-03T12:00:00Z' }];
  data.events = [];
  return data;
};

test('trazabilidad delimita visitas por proyecto y período inclusivo, separando programadas', () => {
  const data = fixture();
  const scoped = overviewTraceability(data, 'p1');
  assert.deepEqual(scoped.visits.map(i => i.id), ['visit', 'planned']);
  assert.equal(scoped.completedVisits.length, 1);
  assert.equal(scoped.plannedVisits.length, 1);
  assert.equal(overviewTraceability(data).visits.length, 3);
  assert.equal(overviewTraceability(data, 'missing').findings.length, 0);
});

test('solo hallazgos relacionados hasta la fecha de corte; no se inventa un embudo', () => {
  const data = fixture();
  data.findings.push({ ...data.findings[0], id: 'outside', inspectionId: 'old' }, { ...data.findings[0], id: 'later', createdAt: '2026-10-09T12:00:00Z' });
  assert.deepEqual(overviewTraceability(data, 'p1').findings.map(f => f.id), ['finding']);
  assert.equal(overviewTraceability(data, 'p1').pendingCorrections.length, 1);
  data.findings[0].state = 'En corrección';
  assert.equal(overviewTraceability(data, 'p1').pendingCorrections.length, 0);
});

test('remisión exige acción y respaldo de corrección existente al corte', () => {
  const data = fixture();
  data.findings[0].correctiveAction = ' ';
  assert.equal(overviewTraceability(data).pendingCorrections.length, 0);
  data.findings[0].correctiveAction = 'Registro firmado';
  data.evidence[0].phase = 'detección';
  assert.equal(overviewTraceability(data).pendingCorrections.length, 0);
  data.evidence[0].phase = 'corrección';
  data.evidence[0].addedAt = '2026-10-09T12:00:00Z';
  assert.equal(overviewTraceability(data).pendingCorrections.length, 0);
});

test('cierre acreditado exige estado y transición de inspector con comentario, no solo Cerrado', () => {
  const data = fixture();
  data.findings[0].state = 'Cerrado';
  assert.equal(overviewTraceability(data).verifiedClosures.length, 0);
  data.events = [{ id: 'verification', findingId: 'finding', type: 'transición', actorId: 'u1', at: '2026-10-08T12:00:00Z', previousState: 'Pendiente de verificación', newState: 'Cerrado', comment: 'Respaldo revisado', changes: {} }];
  assert.equal(overviewTraceability(data).verifiedClosures.length, 1);
  data.events[0].actorId = 'u2';
  assert.equal(overviewTraceability(data).verifiedClosures.length, 0);
  data.events[0].actorId = 'u1';
  data.events[0].at = '2026-10-09T12:00:00Z';
  assert.equal(overviewTraceability(data).verifiedClosures.length, 0);
});

test('alcance vacío devuelve listas vacías sin porcentajes inventados', () => {
  const result = overviewTraceability({ ...fixture(), inspections: [], findings: [] });
  for (const records of Object.values(result)) assert.deepEqual(records, []);
});
