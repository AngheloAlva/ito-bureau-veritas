export type ProjectHealth = 'Completado' | 'En curso' | 'Atrasado';
export type MilestoneStatus = 'Completado' | 'En curso' | 'Atrasado' | 'Pendiente';

export const PROJECT_HEALTHS: readonly ProjectHealth[] = ['Completado', 'En curso', 'Atrasado'];

export const MILESTONE_SITUATIONS = [
  'Cerrado en plazo', 'Cerrado con atraso', 'Holgura > 30 d', 'Holgura 6–30 d',
  'Holgura ≤ 5 d', 'Atraso 1–15 d', 'Atraso 16–30 d', 'Atraso > 30 d',
] as const;
export type MilestoneSituation = (typeof MILESTONE_SITUATIONS)[number];

export const DURATION_BUCKETS = ['0–3 d', '4–7 d', '8–10 d', '11–15 d', '16–30 d', '> 30 d'] as const;
export type DurationBucket = (typeof DURATION_BUCKETS)[number];

export type Client = { id: string; name: string; short: string; area: string };

export type PortfolioProject = {
  id: string; code: string; name: string; clientId: string; manager: string; specialty: string; location: string;
  health: ProjectHealth; startDate: string; plannedEndDate: string; actualEndDate?: string;
  progress: number; plannedProgress: number; budgetMusd: number; operational: boolean;
};

export type Milestone = {
  id: string; projectId: string; seq: number; name: string; responsible: string;
  plannedStart: string; plannedEnd: string; actualStart?: string; actualEnd?: string;
  status: MilestoneStatus; progress: number; note: string;
};

export type Portfolio = { clients: Client[]; projects: PortfolioProject[]; milestones: Milestone[] };
