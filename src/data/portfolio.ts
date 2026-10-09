import { REFERENCE_DATE } from '../domain/types.ts';
import type { Client, Milestone, MilestoneStatus, Portfolio, PortfolioProject, ProjectHealth } from '../domain/portfolio.ts';
import { addDays, daysBetween } from '../lib/portfolio-analytics.ts';

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CLIENTS: Client[] = [
  { id: 'c1', name: 'Área Concentradora', short: 'AC', area: 'Procesamiento de mineral' },
  { id: 'c2', name: 'Mina Subterránea', short: 'MS', area: 'Extracción y ventilación' },
  { id: 'c3', name: 'Tranques y Relaves', short: 'TR', area: 'Depósitos de relaves' },
  { id: 'c4', name: 'Infraestructura y Servicios', short: 'IS', area: 'Obras y servicios generales' },
  { id: 'c5', name: 'Agua y Energía', short: 'AE', area: 'Suministro hídrico y eléctrico' },
  { id: 'c6', name: 'Mantenimiento Mayor', short: 'MM', area: 'Detenciones programadas' },
];

// [name, specialty, location, client index]
type Def = [string, string, string, number];
const DEFS: Def[] = [
  ['Renovación de estación de bombeo', 'Mecánica', 'Sector norte', 4],
  ['Adecuación de galería de servicios', 'Civil', 'Galería oeste', 1],
  ['Mejora de conducción de agua industrial', 'Hidráulica', 'Tramo sur', 4],
  ['Reemplazo de correa transportadora CV-12', 'Mecánica', 'Chancado primario', 0],
  ['Refuerzo de muro de tranque', 'Civil', 'Muro oeste', 2],
  ['Normalización eléctrica subestación SE-4', 'Eléctrica', 'Subestación SE-4', 4],
  ['Ampliación de canal de aguas lluvia', 'Civil', 'Acceso principal', 3],
  ['Cambio de revestimiento de molino SAG', 'Mecánica', 'Molienda', 5],
  ['Instalación de ventiladores secundarios nivel 12', 'Mecánica', 'Nivel 12', 1],
  ['Renovación de línea de relaves L-2', 'Hidráulica', 'Línea L-2', 2],
  ['Sistema de detección de incendio en sala eléctrica', 'Instrumentación', 'Sala eléctrica 3', 0],
  ['Pavimentación de camino de servicio', 'Civil', 'Camino interno C-5', 3],
  ['Reposición de bombas de drenaje nivel 8', 'Mecánica', 'Nivel 8', 1],
  ['Reubicación de tendido de media tensión', 'Eléctrica', 'Franja este', 4],
  ['Modernización de sala de control de flotación', 'Instrumentación', 'Flotación', 0],
  ['Estabilización de talud en rampa de acceso', 'Civil', 'Rampa norte', 3],
  ['Reemplazo de válvulas de espesador', 'Mecánica', 'Espesaje', 0],
  ['Habilitación de piscina de emergencia', 'Civil', 'Tranque principal', 2],
  ['Cambio de cañería de agua de proceso', 'Hidráulica', 'Planta de agua', 4],
  ['Instalación de medidores de caudal de relaves', 'Instrumentación', 'Línea L-1', 2],
  ['Detención mayor de chancador secundario', 'Mecánica', 'Chancado secundario', 5],
  ['Reforzamiento estructural de galpón de repuestos', 'Civil', 'Bodega central', 3],
  ['Renovación de centro de control de motores CCM-7', 'Eléctrica', 'Sala CCM-7', 5],
  ['Sistema de drenaje de galería de acceso', 'Hidráulica', 'Galería de acceso', 1],
  ['Reemplazo de estanque de agua potable', 'Hidráulica', 'Campamento', 3],
  ['Ampliación de planta de tratamiento de aguas servidas', 'Civil', 'Campamento', 3],
  ['Cambio de rodamientos de celdas de flotación', 'Mecánica', 'Flotación', 5],
  ['Instrumentación de piezómetros en tranque', 'Instrumentación', 'Tranque principal', 2],
  ['Nuevo alimentador eléctrico para bombas de pozos', 'Eléctrica', 'Campo de pozos', 4],
  ['Reparación de puente grúa de taller', 'Mecánica', 'Taller mecánico', 5],
  ['Revestimiento de canal de contorno', 'Civil', 'Canal norte', 2],
  ['Reemplazo de transformadores de iluminación', 'Eléctrica', 'Mina subterránea', 1],
  ['Reforzamiento de fortificación en cruzado 14', 'Civil', 'Cruzado 14', 1],
  ['Habilitación de estación de bombeo de recirculación', 'Mecánica', 'Tranque secundario', 2],
  ['Automatización de compuertas de captación', 'Instrumentación', 'Captación río', 4],
  ['Reposición de línea de aire comprimido', 'Mecánica', 'Nivel 10', 1],
  ['Construcción de bodega de residuos peligrosos', 'Civil', 'Patio industrial', 3],
  ['Cambio de cinta alimentadora del molino de bolas', 'Mecánica', 'Molienda', 0],
  ['Mejoramiento de puesta a tierra de planta', 'Eléctrica', 'Planta concentradora', 0],
  ['Reparación de ducto de ventilación principal', 'Mecánica', 'Chimenea de ventilación', 1],
  ['Optimización de red contra incendio', 'Hidráulica', 'Planta concentradora', 3],
  ['Renovación de iluminación de túnel de acceso', 'Eléctrica', 'Túnel de acceso', 1],
  ['Reemplazo de espesador de relaves E-3', 'Mecánica', 'Espesaje', 2],
];

const MANAGERS = ['Rodrigo Valenzuela', 'Carolina Muñoz', 'Felipe Araya', 'Patricia Contreras', 'Andrés Maldonado', 'Javiera Ortiz', 'Sergio Bravo', 'Marcela Tapia', 'Cristián Espinoza', 'Daniela Rojas'];
const RESPONSIBLES = [...MANAGERS, 'Ignacio Vega', 'Paula Henríquez', 'Tomás Guerrero', 'Natalia Pizarro', 'Héctor Salinas', 'Valentina Cortés'];
const PHASES = ['Ingeniería de detalle', 'Adquisiciones', 'Movilización de contratista', 'Obras civiles', 'Montaje mecánico', 'Montaje eléctrico e instrumentación', 'Pruebas y puesta en marcha', 'Cierre y entrega documental'];
const DURS = [2, 3, 4, 6, 7, 8, 10, 9, 12, 15, 14, 18, 21, 28, 30, 35, 42, 45];
const CLOSE_DURS = [2, 3, 4, 5, 7, 8];
const SLACKS = [0, 1, 2, 3, 4, 5, 5, 2, 7, 10, 14, 20, 3, 1];
const DELAYS = [48, 33, 62, 26, 40];
const NOTE_DONE = ['Cierre conforme; registros entregados.', 'Recibido sin observaciones.', 'Verificación realizada según programa.', 'Entregado con respaldo documental.'];
const NOTE_LATE = ['Espera de repuesto importado.', 'Permiso de intervención pendiente.', 'Reprogramación por detención de planta.', 'Retraso en entrega de materiales por el proveedor.', 'Falta de disponibilidad de cuadrilla especializada.', 'Observaciones de ingeniería por resolver.'];
const NOTE_OPEN = ['Avance según programa.', 'Trabajos en curso con cuadrilla completa.', 'En ejecución; sin restricciones informadas.', 'A la espera de liberación del área.'];
const NOTE_PENDING = ['Sin iniciar; depende del hito anterior.', 'Programado a continuación del hito en curso.', 'Pendiente de liberación de frente de trabajo.'];

type Category = ProjectHealth;
type Draw = { jit: number; late: boolean; lateDays: number; early: number; prog: number };

function buildProject(rng: () => number, index: number, cat: Category, def: Def): { project: PortfolioProject; milestones: Milestone[] } {
  const ref = REFERENCE_DATE;
  const pick = <T,>(a: readonly T[]) => a[Math.floor(rng() * a.length)];
  const id = `p${index + 1}`;
  const code = `P-${String(index + 1).padStart(3, '0')}`;
  // phases
  const optional = [1, 2, 3, 4, 5].map(v => ({ v, r: rng() })).sort((a, b) => a.r - b.r);
  const n = 5 + Math.floor(rng() * 4);
  const phases = [0, 6, 7, ...optional.slice(0, n - 3).map(o => o.v)].sort((a, b) => a - b);
  // relative plan (days from project start)
  const rel: { ps: number; pe: number }[] = [];
  let cursor = 0;
  for (const ph of phases) {
    const dur = pick(ph === 7 ? CLOSE_DURS : DURS);
    const ps = cursor + (rel.length ? Math.floor(rng() * 3) : 0);
    rel.push({ ps, pe: ps + dur });
    cursor = ps + dur;
  }
  const draws: Draw[] = rel.map(() => ({ jit: Math.floor(rng() * 3), late: rng() < 0.12, lateDays: 1 + Math.floor(rng() * 20), early: Math.floor(rng() * 3), prog: 15 + Math.floor(rng() * 75) }));
  const responsibles = rel.map(() => pick(RESPONSIBLES));
  const noteIdx = rel.map(() => rng());
  const nth = <T,>(a: readonly T[], r: number) => a[Math.floor(r * a.length)];

  // pivot index (open milestone) and base shift
  let k = n; // n => none open
  let shiftDate: string;
  if (cat === 'Completado') {
    shiftDate = addDays('2025-03-01', Math.floor(rng() * 410));
  } else if (cat === 'En curso') {
    k = Math.floor(rng() * n);
    const slack = Math.min(pick(SLACKS), rel[k].pe - rel[k].ps);
    shiftDate = addDays(ref, slack - rel[k].pe);
  } else {
    k = Math.floor(rng() * 2);
    const delay = DELAYS[(index * 3) % DELAYS.length];
    shiftDate = addDays(ref, -delay - rel[k].pe);
  }

  const build = (start: string): Milestone[] => rel.map((r, i) => {
    const d = draws[i];
    const ps = addDays(start, r.ps), pe = addDays(start, r.pe);
    const base = { id: `${id}-h${i + 1}`, projectId: id, seq: i + 1, name: PHASES[phases[i]], responsible: responsibles[i], plannedStart: ps, plannedEnd: pe };
    const done = cat === 'Completado' || i < k;
    if (done) {
      let aS = addDays(ps, d.jit);
      if (cat !== 'Completado' && aS > addDays(ref, -1)) aS = addDays(ref, -1);
      let aE = addDays(pe, d.late ? d.lateDays : -d.early);
      if (cat !== 'Completado' && aE > ref) aE = ref;
      if (aE <= aS) aE = addDays(aS, 1);
      const late = daysBetween(pe, aE) > 0;
      return { ...base, actualStart: aS, actualEnd: aE, status: 'Completado' as MilestoneStatus, progress: 100, note: late ? nth(NOTE_LATE, noteIdx[i]) : nth(NOTE_DONE, noteIdx[i]) };
    }
    if (i === k) {
      const aS = addDays(ps, d.jit) > ref ? ref : addDays(ps, d.jit);
      const lateNow = pe < ref;
      return { ...base, actualStart: aS, status: (lateNow ? 'Atrasado' : 'En curso') as MilestoneStatus, progress: d.prog, note: lateNow ? nth(NOTE_LATE, noteIdx[i]) : nth(NOTE_OPEN, noteIdx[i]) };
    }
    const lateNow = pe < ref;
    return { ...base, status: (lateNow ? 'Atrasado' : 'Pendiente') as MilestoneStatus, progress: 0, note: lateNow ? nth(NOTE_LATE, noteIdx[i]) : nth(NOTE_PENDING, noteIdx[i]) };
  });

  let start = shiftDate;
  let milestones = build(start);
  if (cat === 'Completado') {
    while (milestones.some(m => (m.actualEnd as string) >= ref)) { start = addDays(start, -14); milestones = build(start); }
  }

  const health: ProjectHealth = milestones.some(m => !m.actualEnd && m.plannedEnd < ref) ? 'Atrasado' : milestones.every(m => m.status === 'Completado') ? 'Completado' : 'En curso';
  const weights = milestones.map(m => Math.max(1, daysBetween(m.plannedStart, m.plannedEnd)));
  const wsum = weights.reduce((a, b) => a + b, 0);
  const progress = Math.round(milestones.reduce((a, m, i) => a + m.progress * weights[i], 0) / wsum);
  const plannedProgress = Math.round(milestones.reduce((a, m, i) => {
    const total = Math.max(1, daysBetween(m.plannedStart, m.plannedEnd));
    const f = Math.min(1, Math.max(0, daysBetween(m.plannedStart, ref) / total));
    return a + f * 100 * weights[i];
  }, 0) / wsum);
  const operational = index < 3;
  const fixed = [62, 38, 75];
  const project: PortfolioProject = {
    id, code, name: def[0], clientId: CLIENTS[def[3]].id, manager: MANAGERS[index % MANAGERS.length], specialty: def[1], location: def[2],
    health, startDate: milestones.map(m => m.plannedStart).sort()[0], plannedEndDate: milestones.map(m => m.plannedEnd).sort().reverse()[0],
    ...(health === 'Completado' ? { actualEndDate: milestones.map(m => m.actualEnd as string).sort().reverse()[0] } : {}),
    progress: operational ? fixed[index] : progress, plannedProgress, budgetMusd: Math.round((0.3 + rng() * 14) * 10) / 10, operational,
  };
  return { project, milestones };
}

export function createPortfolio(): Portfolio {
  const rng = mulberry32(20261008);
  const rest: Category[] = [...Array<Category>(24).fill('Completado'), ...Array<Category>(11).fill('En curso'), ...Array<Category>(4).fill('Atrasado')];
  for (let i = rest.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [rest[i], rest[j]] = [rest[j], rest[i]]; }
  const cats: Category[] = ['En curso', 'Atrasado', 'En curso', ...rest];
  const projects: PortfolioProject[] = [];
  const milestones: Milestone[] = [];
  cats.forEach((cat, i) => { const r = buildProject(rng, i, cat, DEFS[i]); projects.push(r.project); milestones.push(...r.milestones); });
  return { clients: CLIENTS.map(c => ({ ...c })), projects, milestones };
}

let cached: Portfolio | undefined;
function memo(): Portfolio { return (cached ??= createPortfolio()); }
export const PORTFOLIO: Portfolio = memo();
