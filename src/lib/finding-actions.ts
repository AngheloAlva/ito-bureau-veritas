import type { Finding, State } from '../domain/types.ts';

export type PrimaryActionId = 'start' | 'submit' | 'verify';
export interface PrimaryAction {
  id: PrimaryActionId;
  label: string;
  target: State;
}

const STEP: Partial<Record<State, PrimaryAction>> = {
  'Abierto': { id: 'start', label: 'Iniciar corrección', target: 'En corrección' },
  'En corrección': { id: 'submit', label: 'Remitir a verificación', target: 'Pendiente de verificación' },
  'Pendiente de verificación': { id: 'verify', label: 'Verificar y cerrar', target: 'Cerrado' },
};

/** Next forward action for a finding; the single demo identity may always take it. Null once closed. */
export function primaryActionFor(f: Finding): PrimaryAction | null {
  return STEP[f.state] ?? null;
}
