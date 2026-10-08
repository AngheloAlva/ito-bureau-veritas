import { transitionFinding } from '../domain/core.ts';
import type { Data, Finding, Role, State } from '../domain/types.ts';

export type PrimaryActionId = 'start' | 'submit' | 'verify';
export interface PrimaryAction {
  id: PrimaryActionId;
  label: string;
  target: State;
  requiredRole: Role;
  /** Person who must act (the assigned responsible, or the first inspector). */
  actorId: string;
  canAct: boolean;
}

const STEP: Partial<Record<State, { id: PrimaryActionId; label: string; target: State; role: Role }>> = {
  'Abierto': { id: 'start', label: 'Iniciar corrección', target: 'En corrección', role: 'Responsable de corrección' },
  'En corrección': { id: 'submit', label: 'Remitir a verificación', target: 'Pendiente de verificación', role: 'Responsable de corrección' },
  'Pendiente de verificación': { id: 'verify', label: 'Verificar y cerrar', target: 'Cerrado', role: 'Inspector' },
};

/**
 * Next forward action for a finding. Permission is not re-encoded: it is probed against
 * the domain transition with otherwise-valid inputs, so domain rules stay the single source.
 */
export function primaryActionFor(data: Data, f: Finding, userId: string): PrimaryAction | null {
  const step = STEP[f.state];
  if (!step) return null;
  const actorId = step.role === 'Inspector'
    ? (data.users.find(u => u.id === userId && u.role === 'Inspector') ?? data.users.find(u => u.role === 'Inspector'))?.id ?? userId
    : f.responsibleId;
  const probe: Data = { ...data, findings: data.findings.map(x => x.id === f.id ? f : x), evidence: [...data.evidence, { id: '__probe', findingId: f.id, name: '', type: '', phase: 'corrección', reference: '', addedBy: userId, addedAt: '', isExample: true }] };
  let canAct = true;
  try { transitionFinding(probe, f.id, userId, step.target, { action: 'probe', evidenceId: '__probe', comment: 'probe' }); } catch { canAct = false; }
  return { id: step.id, label: step.label, target: step.target, requiredRole: step.role, actorId, canAct };
}
