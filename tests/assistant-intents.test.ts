import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSeed } from '../src/data/seed.ts';
import { PORTFOLIO } from '../src/data/portfolio.ts';
import { INTENT_PROMPTS, buildAnswer, matchIntent } from '../src/lib/assistant-intents.ts';

const ctx = (scope = '') => ({ data: createSeed(), portfolio: PORTFOLIO, scope });

test('matchIntent recognises every suggested prompt', () => {
  assert.equal(matchIntent('Resumen ejecutivo del mes'), 'summary');
  assert.equal(matchIntent('¿Qué proyectos están en riesgo?'), 'risk');
  assert.equal(matchIntent('Hallazgos activos por severidad'), 'severity');
  assert.equal(matchIntent('¿Cómo va el cumplimiento de hitos?'), 'milestones');
  assert.equal(matchIntent('Compare clientes por atraso'), 'clients');
  assert.equal(matchIntent('Hitos que vencen en los próximos 15 días'), 'upcoming');
  assert.equal(matchIntent('Redacte un recordatorio para los responsables de hallazgos vencidos'), 'reminder');
  for (const [intent, label] of Object.entries(INTENT_PROMPTS)) assert.equal(matchIntent(label), intent);
});

test('matchIntent is accent and case insensitive and falls back to unknown', () => {
  assert.equal(matchIntent('RESUMEN EJECUTIVO'), 'summary');
  assert.equal(matchIntent('proyectos en riesgo'), 'risk');
  assert.equal(matchIntent('qué hora es en Tokio'), 'unknown');
  assert.equal(matchIntent('   '), 'unknown');
});

test('summary answers with kpis artifact and concrete numbers', () => {
  const a = buildAnswer('summary', ctx());
  assert.equal(a.artifact?.kind, 'kpis');
  if (a.artifact?.kind === 'kpis') assert.equal(a.artifact.items.length, 5);
  assert.match(a.text, /\d/);
  assert.ok(a.followUps.length >= 2);
});

test('risk is a horizontal bar capped at 6 with dashboard link', () => {
  const a = buildAnswer('risk', ctx());
  assert.equal(a.artifact?.kind, 'bar');
  if (a.artifact?.kind === 'bar') {
    assert.equal(a.artifact.orientation, 'horizontal');
    assert.ok(a.artifact.series.length > 0 && a.artifact.series.length <= 6);
    assert.ok(a.artifact.dashboardHref?.startsWith('/tablero'));
  }
});

test('severity donut respects project scope', () => {
  const all = buildAnswer('severity', ctx()), p1 = buildAnswer('severity', ctx('p1'));
  const sum = (x: ReturnType<typeof buildAnswer>) => x.artifact?.kind === 'donut' ? x.artifact.series.reduce((n, s) => n + s.value, 0) : -1;
  assert.ok(sum(all) > 0);
  assert.ok(sum(p1) >= 0 && sum(p1) < sum(all));
});

test('milestones line and clients bar', () => {
  const m = buildAnswer('milestones', ctx());
  assert.equal(m.artifact?.kind, 'line');
  if (m.artifact?.kind === 'line') assert.ok(m.artifact.points.some(p => p.actual === null));
  const c = buildAnswer('clients', ctx());
  assert.equal(c.artifact?.kind, 'bar');
});

test('upcoming table lists milestones with 0-15 days of slack', () => {
  const a = buildAnswer('upcoming', ctx());
  assert.equal(a.artifact?.kind, 'table');
  if (a.artifact?.kind === 'table') {
    assert.equal(a.artifact.columns.length, 4);
    for (const r of a.artifact.rows) assert.equal(r.cells.length, 4);
  }
});

test('reminder is a draft that names overdue findings and responsibles', () => {
  const data = createSeed();
  const a = buildAnswer('reminder', { data, portfolio: PORTFOLIO, scope: '' });
  assert.equal(a.artifact?.kind, 'draft');
  const overdue = data.findings.filter(f => f.state !== 'Cerrado' && f.dueDate < '2026-10-08');
  if (a.artifact?.kind === 'draft' && overdue.length) assert.ok(a.artifact.body.includes(overdue[0].code));
});

test('unknown intent gives a polite message with suggestions and no artifact', () => {
  const a = buildAnswer('unknown', ctx());
  assert.equal(a.artifact, undefined);
  assert.ok(a.followUps.length >= 3);
});
