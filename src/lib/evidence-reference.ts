import { addExampleEvidence, DomainError } from '../domain/core.ts';
import type { Data, Evidence } from '../domain/types.ts';

/** Name the fixed demo resource without changing core authorization or event metadata. */
export function addEvidenceReference(
  data: Data, findingId: string, actorId: string, phase: Evidence['phase'],
  name: string, at?: string,
): Data {
  const trimmed = name.trim();
  if (!trimmed) throw new DomainError('Indique el nombre del respaldo.');
  const next = addExampleEvidence(data, findingId, actorId, phase, at);
  return {
    ...next,
    evidence: next.evidence.map((e, index) => index === data.evidence.length ? { ...e, name: trimmed } : e),
    events: next.events.map((event, index) => index === data.events.length
      ? { ...event, comment: `Evidencia de ${phase} de ejemplo agregada: ${trimmed}.` }
      : event),
  };
}
