import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSeed } from '../src/data/seed.ts';
import { addExampleEvidence, transitionFinding } from '../src/domain/core.ts';
import { addEvidenceReference } from '../src/lib/evidence-reference.ts';

const at = '2026-10-08T15:00:00.000Z';

test('named reference trims and persists only the new evidence and its event comment', () => {
  const seed = createSeed();
  const snapshot = structuredClone(seed);
  for (const phase of ['detección', 'corrección'] as const) {
    const core = addExampleEvidence(seed, 'H-001', 'u1', phase, at);
    const next = addEvidenceReference(seed, 'H-001', 'u1', phase, '  Registro firmado  ', at);
    assert.equal(next.evidence.at(-1)?.name, 'Registro firmado');
    assert.equal(next.events.at(-1)?.comment, `Evidencia de ${phase} de ejemplo agregada: Registro firmado.`);
    assert.deepEqual(next.evidence.at(-1), { ...core.evidence.at(-1), name: 'Registro firmado' });
    assert.deepEqual(next.events.at(-1), { ...core.events.at(-1), comment: `Evidencia de ${phase} de ejemplo agregada: Registro firmado.` });
    assert.equal(next.version, seed.version + 1);
    assert.equal(next.evidence.at(-1)?.id, `e-${seed.version + 1}`);
    assert.deepEqual(next.evidence.slice(0, -1), seed.evidence);
    assert.deepEqual(next.events.slice(0, -1), seed.events);
    seed.evidence.forEach((e, index) => assert.equal(next.evidence[index], e));
    seed.events.forEach((event, index) => assert.equal(next.events[index], event));
    assert.equal(JSON.parse(JSON.stringify(next)).evidence.at(-1).name, 'Registro firmado');
    assert.deepEqual(next.findings, core.findings);
    assert.deepEqual(next.inspections, seed.inspections);
    assert.deepEqual(seed, snapshot);
  }
});

test('empty reference name is rejected without mutation', () => {
  const seed = createSeed();
  const snapshot = structuredClone(seed);
  for (const name of ['', '  ', '\n\t']) {
    assert.throws(() => addEvidenceReference(seed, 'H-001', 'u1', 'detección', name, at), /nombre/);
  }
  assert.deepEqual(seed, snapshot);
});

test('named reference accepts any demo user, retains actor validity and closed gate', () => {
  const seed = createSeed();
  for (const user of seed.users) {
    for (const phase of ['detección', 'corrección'] as const) {
      assert.doesNotThrow(() => addEvidenceReference(seed, 'H-001', user.id, phase, 'Respaldo', at));
    }
  }
  assert.throws(() => addEvidenceReference(seed, 'H-001', 'missing', 'detección', 'Respaldo', at), /Persona no válida/);
  assert.throws(() => addEvidenceReference(seed, 'missing', 'u1', 'detección', 'Respaldo', at), /Hallazgo no encontrado/);
  const closed = seed.findings.find(f => f.state === 'Cerrado')!;
  for (const user of seed.users) for (const phase of ['detección', 'corrección'] as const) {
    assert.throws(() => addEvidenceReference(seed, closed.id, user.id, phase, 'Respaldo', at), /No puede agregar/);
  }
});

test('named correction is selectable while detection still cannot remit correction', () => {
  const seed = createSeed();
  const detected = addEvidenceReference(seed, 'H-001', 'u1', 'detección', 'Detección', at);
  const correcting = transitionFinding(detected, 'H-001', 'u2', 'En corrección', { at });
  assert.throws(() => transitionFinding(correcting, 'H-001', 'u2', 'Pendiente de verificación', {
    action: 'Acción', evidenceId: detected.evidence.at(-1)!.id, at,
  }), /evidencia de corrección/);
  const corrected = addEvidenceReference(correcting, 'H-001', 'u2', 'corrección', 'Corrección', at);
  const next = transitionFinding(corrected, 'H-001', 'u2', 'Pendiente de verificación', {
    action: 'Acción', evidenceId: corrected.evidence.at(-1)!.id, at,
  });
  assert.equal(next.findings.find(f => f.id === 'H-001')?.state, 'Pendiente de verificación');
  assert.equal(next.evidence.at(-1)?.name, 'Corrección');
});

test('chronology, timestamp validation and fixed resource match core exactly', () => {
  const seed = createSeed();
  const first = addEvidenceReference(seed, 'H-001', 'u1', 'detección', 'Primero', at);
  const later = '2026-10-08T16:00:00.000Z';
  const next = addEvidenceReference(first, 'H-001', 'u2', 'corrección', 'Segundo', later);
  assert.deepEqual(next.events.slice(0, -1), first.events);
  assert.equal(next.events.at(-1)?.at, later);
  assert.equal(next.events.at(-1)?.actorId, 'u2');
  assert.equal(next.evidence.at(-1)?.addedAt, later);
  assert.equal(next.evidence.at(-1)?.type, 'Texto');
  assert.equal(next.evidence.at(-1)?.reference, '/demo/evidencia.txt');
  assert.equal(next.evidence.at(-1)?.isExample, true);
  assert.throws(() => addEvidenceReference(seed, 'H-001', 'u1', 'detección', 'Respaldo', 'invalid'), /Fecha de evento/);
});
