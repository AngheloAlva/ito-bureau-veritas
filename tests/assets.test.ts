import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createSeed } from '../src/data/seed.ts';

const asset = (reference: string) => readFileSync(new URL(`../public${reference}`, import.meta.url), 'utf8');

test('seed assets exist and record-specific signed evidence belongs only to H-001', () => {
 const seed = createSeed();
 for (const resource of [...seed.documents, ...seed.evidence]) {
  assert.equal(resource.isExample, true);
  assert.match(asset(resource.reference), /FICTICI[OA]/);
 }
 const signed = seed.evidence.filter(e => e.reference === '/demo/registro-prueba.txt');
 assert.deepEqual(signed.map(e => e.findingId), ['H-001']);
 const finding = seed.findings.find(f => f.id === signed[0].findingId)!;
 const inspection = seed.inspections.find(i => i.id === finding.inspectionId)!;
 const project = seed.projects.find(p => p.id === inspection.projectId)!;
 assert.ok(asset(signed[0].reference).includes(project.name));
 assert.ok(asset(signed[0].reference).includes(finding.location));
 for (const evidence of seed.evidence.filter(e => e.phase === 'corrección' && e.findingId !== 'H-001')) {
  assert.match(asset(evidence.reference), /no corresponde a ningún hallazgo, proyecto ni tramo/i);
  assert.doesNotMatch(evidence.name, /firmado/i);
 }
});
