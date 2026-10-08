import test from 'node:test';
import assert from 'node:assert/strict';
import { parseListFilters, updateListFilters, clearListFilters, projectScopeHref } from '../src/lib/list-filters.ts';

test('header scope changes and reset preserve live hash, filters and duplicate unknown parameters', () => {
  const search = 'project=p1&state=Abierto&query=H&new=1&extra=a&extra=b';
  for (const project of ['p2', '']) {
    const href = projectScopeHref('/hallazgos', search, '#keep', project);
    const expected = new URL(`/hallazgos?${search}#keep`, 'https://demo.test');
    expected.searchParams.set('project', project);
    assert.equal(href, `${expected.pathname}${expected.search}${expected.hash}`);
  }
  assert.equal(projectScopeHref('/analisis', '', '#keep', ''), '/analisis?project=#keep');
});

const choices = { visitState: ['Programada', 'Completada'], project: ['p1', 'p2'], state: ['Abierto'], severity: ['Alta'], responsible: ['u1'], due: ['today', 'overdue'], inspector: ['i1'], specialty: ['Civil'] };
test('visit state validates, clears and preserves scope, duplicates, creation and fragment', () => {
  assert.equal(parseListFilters('visitState=Completada', choices, 'p1').visitState, 'Completada');
  assert.equal(parseListFilters('visitState=invalid', choices).visitState, '');
  assert.equal(parseListFilters('', choices).visitState, '');
  assert.equal(parseListFilters('visitState=Programada&visitState=Completada', choices).visitState, 'Programada');
  const snapshots = ['visitState=Programada', 'visitState=Completada', 'visitState=Programada'];
  assert.deepEqual(snapshots.map(search => parseListFilters(search, choices).visitState), ['Programada', 'Completada', 'Programada']);
  const href = '/inspecciones?visitState=Programada&extra=a&extra=b&new=1#visita';
  assert.equal(updateListFilters(href, { visitState: 'Completada' }), '/inspecciones?visitState=Completada&extra=a&extra=b&new=1#visita');
  assert.equal(clearListFilters(href, 'inspections'), '/inspecciones?extra=a&extra=b&new=1&project=#visita');
  assert.equal(parseListFilters('project=&visitState=Programada', choices, 'p1').project, '');
});

test('project changes retain known filters, unknown duplicates, creation link and hash', () => {
  const input = '/hallazgos?project=p1&state=Abierto&severity=Alta&due=today&active=1&responsible=u1&query=H&from=2026-10-01&to=2026-10-08&inspector=i1&specialty=Civil&new=1&extra=a&extra=b#registro';
  const next = new URL(updateListFilters(input, { project: 'p2' }), 'https://demo.test');
  const before = new URL(input, 'https://demo.test');
  before.searchParams.set('project', 'p2');
  assert.equal(next.href, before.href);
});
test('absent scope inherits global; explicit empty and invalid project never inherit', () => {
  assert.equal(parseListFilters('', choices, 'p1').project, 'p1');
  assert.equal(parseListFilters('project=', choices, 'p1').project, '');
  assert.equal(parseListFilters('project=missing', choices, 'p1').project, '');
});
test('chip removal and clear all use explicit all without changing unrelated parameters', () => {
  assert.equal(updateListFilters('/hallazgos?state=Abierto&new=1#x', { state: '' }), '/hallazgos?new=1#x');
  assert.equal(updateListFilters('/hallazgos?project=p1#x', { project: '' }), '/hallazgos?project=#x');
  assert.equal(clearListFilters('/hallazgos?state=Abierto&query=x&new=1&from=2026-10-01#x', 'findings'), '/hallazgos?new=1&from=2026-10-01&project=#x');
  assert.equal(clearListFilters('/inspecciones?inspector=i1&specialty=Civil&from=2026-10-01&to=2026-10-08&new=1#x', 'inspections'), '/inspecciones?new=1&project=#x');
});
test('invalid selections and impossible dates fall back to unfiltered controls', () => {
  const f = parseListFilters('state=no&severity=no&responsible=no&due=no&active=true&from=2026-02-30&to=oops&inspector=no&specialty=no', choices);
  for (const key of ['state', 'severity', 'responsible', 'due', 'from', 'to', 'inspector', 'specialty']) assert.equal(f[key], '');
  assert.equal(f.active, '');
});
test('parsing successive history snapshots has no stale initialization', () => {
  const snapshots = ['project=p1&state=Abierto&active=1&query=H', 'project=&from=2026-10-08&inspector=i1', 'project=p1&state=Abierto&active=1&query=H'];
  const states = snapshots.map(s => parseListFilters(s, choices, 'p2'));
  assert.deepEqual(states[0], states[2]);
  assert.equal(states[1].project, '');
  assert.equal(states[1].from, '2026-10-08');
  assert.equal(states[1].state, '');
});
