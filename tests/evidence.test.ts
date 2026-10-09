import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSeed } from '../src/data/seed.ts';
import { addExampleEvidence, createFinding, transitionFinding } from '../src/domain/core.ts';

const at='2026-10-08T15:00:00.000Z';
test('example evidence names and history distinguish detection from correction',()=>{
 const seed=createSeed();
 for(const phase of ['detección','corrección'] as const){
  const next=addExampleEvidence(seed,'H-001','u1',phase,at);
  const evidence=next.evidence.at(-1)!;
  assert.equal(evidence.name,`Respaldo de ${phase} de ejemplo`);
  assert.equal(next.events.at(-1)?.comment,`Evidencia de ${phase} de ejemplo agregada.`);
  assert.equal(evidence.phase,phase);
  assert.equal(evidence.reference,'/demo/evidencia.txt');
  assert.equal(evidence.isExample,true);
  assert.equal(evidence.findingId,'H-001');
  assert.equal(evidence.addedBy,phase==='corrección'?'u2':'u1');
  assert.equal(evidence.addedAt,at);
  assert.equal(next.events.at(-1)?.findingId,'H-001');
  assert.equal(next.events.at(-1)?.actorId,phase==='corrección'?'u2':'u1');
  assert.equal(next.events.at(-1)?.at,at);
  assert.equal(next.version,seed.version+1);
  assert.deepEqual(next.events.slice(0,-1),seed.events);
  assert.deepEqual(next.evidence.slice(0,-1),seed.evidence);
  assert.deepEqual(next.findings,seed.findings);
 }
});
test('new active finding accepts inspector detection but cannot remit it as correction',()=>{
 const seed=createSeed();
 const created=createFinding(seed,'u1',{inspectionId:'i1',title:'Ejemplo',description:'Ficticio',specialty:'Mecánica',location:'Tramo',severity:'Alta',responsibleId:'u2',dueDate:'2026-10-08'},false,at);
 const id=created.findings.at(-1)!.id;
 const detected=addExampleEvidence(created,id,'u1','detección',at);
 assert.equal(detected.evidence.at(-1)?.findingId,id);
 const correcting=transitionFinding(detected,id,'u2','En corrección',{at});
 assert.throws(()=>transitionFinding(correcting,id,'u2','Pendiente de verificación',{action:'Acción ficticia',evidenceId:detected.evidence.at(-1)!.id,at}),/evidencia de corrección/);
 const corrected=addExampleEvidence(correcting,id,'u2','corrección',at);
 assert.equal(transitionFinding(corrected,id,'u2','Pendiente de verificación',{action:'Acción ficticia',evidenceId:corrected.evidence.at(-1)!.id,at}).findings.at(-1)?.state,'Pendiente de verificación');
});
test('any demo user may add evidence on active findings; closed findings reject it and attribution follows phase',()=>{
 const seed=createSeed();
 for(const user of seed.users){
  for(const phase of ['detección','corrección'] as const){
   const next=addExampleEvidence(seed,'H-001',user.id,phase,at);
   const by=next.users.find(u=>u.id===next.evidence.at(-1)!.addedBy)!;
   assert.equal(by.role,phase==='corrección'?'Responsable de corrección':'Inspector');
  }
 }
 const closed=seed.findings.find(f=>f.state==='Cerrado')!;
 for(const user of seed.users) for(const phase of ['detección','corrección'] as const) assert.throws(()=>addExampleEvidence(seed,closed.id,user.id,phase,at),/No puede agregar/);
});

test('seed roster has varied responsibles and plain names',()=>{
 const seed=createSeed();
 assert.ok(new Set(seed.findings.map(f=>f.responsibleId)).size>=3);
 assert.ok(seed.users.length>=6);
 assert.ok(seed.users.every(u=>!/fictici/i.test(u.name)));
 assert.ok(seed.findings.every(f=>seed.users.some(u=>u.id===f.responsibleId&&u.role==='Responsable de corrección')));
});

test('seed corrections are attributed to the assigned responsible',()=>{
 const seed=createSeed();
 for(const f of seed.findings){
  for(const e of seed.evidence.filter(x=>x.findingId===f.id&&x.phase==='corrección')) assert.equal(e.addedBy,f.responsibleId,f.id);
  for(const ev of seed.events.filter(x=>x.findingId===f.id&&x.type==='transición'&&x.newState!=='Cerrado')) assert.equal(ev.actorId,f.responsibleId,f.id);
 }
});
