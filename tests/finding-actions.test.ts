import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSeed } from '../src/data/seed.ts';
import { transitionFinding } from '../src/domain/core.ts';
import { primaryActionFor } from '../src/lib/finding-actions.ts';

const seed = createSeed();
const h = (data = seed, id = 'H-001') => data.findings.find(f => f.id === id)!;

test('Abierto: el responsable asignado puede iniciar; otros roles ven quién debe actuar', () => {
  const f = h();
  const own = primaryActionFor(seed, f, f.responsibleId)!;
  assert.deepEqual([own.id, own.label, own.requiredRole, own.canAct], ['start', 'Iniciar corrección', 'Responsable de corrección', true]);
  const insp = primaryActionFor(seed, f, 'u1')!;
  assert.equal(insp.canAct, false);
  assert.equal(insp.actorId, f.responsibleId);
});

test('En corrección: remitir a verificación para el responsable', () => {
  const data = transitionFinding(seed, 'H-001', 'u2', 'En corrección', {});
  const a = primaryActionFor(data, h(data), 'u2')!;
  assert.deepEqual([a.id, a.label, a.canAct], ['submit', 'Remitir a verificación', true]);
  assert.equal(primaryActionFor(data, h(data), 'u1')!.canAct, false);
});

test('Pendiente de verificación: inspector verifica y cierra; responsable no', () => {
  let data = transitionFinding(seed, 'H-001', 'u2', 'En corrección', {});
  data = transitionFinding(data, 'H-001', 'u2', 'Pendiente de verificación', { action: 'x', evidenceId: 'e-correction' });
  const a = primaryActionFor(data, h(data), 'u1')!;
  assert.deepEqual([a.id, a.label, a.requiredRole, a.canAct], ['verify', 'Verificar y cerrar', 'Inspector', true]);
  assert.equal(primaryActionFor(data, h(data), 'u2')!.canAct, false);
});

test('Cerrado y Coordinador: sin acción primaria', () => {
  assert.equal(primaryActionFor(seed, { ...h(), state: 'Cerrado' }, 'u1'), null);
  const coord = seed.users.find(u => u.role === 'Coordinador')!;
  assert.equal(primaryActionFor(seed, h(), coord.id)!.canAct, false);
});
