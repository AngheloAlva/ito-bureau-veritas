import { REFERENCE_DATE } from '../domain/types.ts';
import type { Data } from '../domain/types.ts';

/** Related records for the visit cohort, not additive stages or historical throughput. */
export function overviewTraceability(data: Data, projectId?: string) {
  const atCutoff = (value: string) => value.slice(0, 10) <= REFERENCE_DATE;
  const visits = data.inspections.filter(visit =>
    (!projectId || visit.projectId === projectId) &&
    visit.date >= '2026-10-01' && visit.date <= REFERENCE_DATE);
  const visitIds = new Set(visits.map(visit => visit.id));
  const findings = data.findings.filter(finding => visitIds.has(finding.inspectionId) && atCutoff(finding.createdAt));
  const supportedIds = new Set(data.evidence.filter(evidence =>
    evidence.phase === 'corrección' && atCutoff(evidence.addedAt)).map(evidence => evidence.findingId));
  const inspectors = new Set(data.users.filter(user => user.role === 'Inspector').map(user => user.id));
  const verifiedIds = new Set(data.events.filter(event =>
    event.type === 'transición' && event.previousState === 'Pendiente de verificación' &&
    event.newState === 'Cerrado' && inspectors.has(event.actorId) &&
    event.comment.trim() && atCutoff(event.at)).map(event => event.findingId));
  const hasCorrection = (finding: typeof findings[number]) =>
    Boolean(finding.correctiveAction.trim()) && supportedIds.has(finding.id);

  return {
    visits,
    completedVisits: visits.filter(visit => visit.visitState === 'Completada'),
    plannedVisits: visits.filter(visit => visit.visitState === 'Programada'),
    findings,
    pendingCorrections: findings.filter(finding => finding.state === 'Pendiente de verificación' && hasCorrection(finding)),
    verifiedClosures: findings.filter(finding => finding.state === 'Cerrado' && hasCorrection(finding) && verifiedIds.has(finding.id)),
  };
}
