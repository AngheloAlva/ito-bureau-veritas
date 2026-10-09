import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSeed } from '../src/data/seed.ts';
import { transitionFinding } from '../src/domain/core.ts';
import { primaryActionFor } from '../src/lib/finding-actions.ts';

const seed = createSeed();
const h = (data = seed, id = 'H-001') => data.findings.find(f => f.id === id)!;

test('Abierto: acción primaria disponible y cualquier usuario demo puede iniciar la corrección', () => {
  const a = primaryActionFor(h())!;
  assert.deepEqual([a.id, a.label], ['start', 'Iniciar corrección']);
  // former Inspector (u1) can start correction; step is attributed to the assigned responsible
  const next = transitionFinding(seed, 'H-001', 'u1', 'En corrección', {});
  assert.equal(h(next).state, 'En corrección');
  assert.equal(next.events.at(-1)!.actorId, h().responsibleId);
});

test('En corrección: remitir exige acción y evidencia, no un rol', () => {
  const data = transitionFinding(seed, 'H-001', 'u1', 'En corrección', {});
  assert.deepEqual([primaryActionFor(h(data))!.id, primaryActionFor(h(data))!.label], ['submit', 'Remitir a verificación']);
  assert.throws(() => transitionFinding(data, 'H-001', 'u1', 'Pendiente de verificación', { action: '', evidenceId: 'e-correction' }), /acción correctiva/);
  assert.throws(() => transitionFinding(data, 'H-001', 'u1', 'Pendiente de verificación', { action: 'x', evidenceId: 'nope' }), /evidencia/);
  const sent = transitionFinding(data, 'H-001', 'u1', 'Pendiente de verificación', { action: 'x', evidenceId: 'e-correction' });
  assert.equal(sent.events.at(-1)!.actorId, h().responsibleId);
});

test('Pendiente de verificación: cualquier usuario cierra o devuelve con comentario; se atribuye al inspector', () => {
  let data = transitionFinding(seed, 'H-001', 'u2', 'En corrección', {});
  data = transitionFinding(data, 'H-001', 'u2', 'Pendiente de verificación', { action: 'x', evidenceId: 'e-correction' });
  assert.deepEqual([primaryActionFor(h(data))!.id, primaryActionFor(h(data))!.label], ['verify', 'Verificar y cerrar']);
  assert.throws(() => transitionFinding(data, 'H-001', 'u2', 'Cerrado', { comment: '  ' }), /comentario/);
  assert.throws(() => transitionFinding(data, 'H-001', 'u2', 'En corrección', {}), /motivo/);
  const closed = transitionFinding(data, 'H-001', 'u2', 'Cerrado', { comment: 'ok' });
  const actor = closed.users.find(u => u.id === closed.events.at(-1)!.actorId)!;
  assert.equal(actor.role, 'Inspector');
  assert.equal(h(transitionFinding(data, 'H-001', 'u2', 'En corrección', { comment: 'falta' })).state, 'En corrección');
});

test('Cerrado: sin acción primaria y sin más transiciones', () => {
  assert.equal(primaryActionFor({ ...h(), state: 'Cerrado' }), null);
  assert.throws(() => transitionFinding(seed, 'H-001', 'u1', 'Cerrado', { comment: 'x' }), /Transición no permitida/);
});
