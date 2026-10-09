import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSeed } from '../src/data/seed.ts';
import { transitionFinding, indicators, analyze, createFinding, assignFinding, changeDueDate, addExampleEvidence, isAnalysisStale } from '../src/domain/core.ts';

test('H-001 exige corrección y verificación; cierre recalcula y conserva historial', () => {
 const seed = createSeed();
 assert.equal(seed.projects.length,3); assert.equal(seed.inspections.length,8); assert.equal(seed.findings.length,18);
 assert.throws(()=>transitionFinding(seed,'H-001','u2','Cerrado',{}));
 const correcting = transitionFinding(seed,'H-001','u2','En corrección',{});
 assert.throws(()=>transitionFinding(correcting,'H-001','u2','Pendiente de verificación',{}));
 const reviewing = transitionFinding(correcting,'H-001','u2','Pendiente de verificación',{action:'Solicitar respaldo firmado',evidenceId:'e-correction'});
 assert.equal(indicators(reviewing).active,indicators(seed).active);
 assert.equal(reviewing.events.at(-1)?.changes.evidenceId.after,'e-correction');
 assert.throws(()=>transitionFinding(reviewing,'H-001','u2','Cerrado',{comment:' '}));
 const closed = transitionFinding(reviewing,'H-001','u1','Cerrado',{comment:'Registro corresponde al tramo'});
 assert.equal(indicators(closed).active,indicators(seed).active-1);
 assert.equal(indicators(closed).overdue,indicators(seed).overdue-1);
 assert.equal(seed.events.length+3,closed.events.length);
 assert.ok(!analyze(closed).priorities.some(p=>p.findingId==='H-001'));
});
test('asignación alternativa, plazo vencido, evidencia y devolución conservan trazabilidad',()=>{
 const seed=createSeed();
 const analysis=analyze(seed,'p1');
 let data=assignFinding(seed,'H-001','u1','u4');
 assert.equal(transitionFinding(data,'H-001','u2','En corrección').events.at(-1)?.actorId,'u4');
 data=transitionFinding(data,'H-001','u4','En corrección');
 assert.throws(()=>changeDueDate(data,'H-001','u1','2026-10-05'));
 data=changeDueDate(data,'H-001','u1','2026-10-05',true);
 data=addExampleEvidence(data,'H-001','u4','corrección');
 data=transitionFinding(data,'H-001','u4','Pendiente de verificación',{action:'Registro respaldado',evidenceId:data.evidence.at(-1)!.id});
 assert.throws(()=>transitionFinding(data,'H-001','u1','En corrección'));
 data=transitionFinding(data,'H-001','u1','En corrección',{comment:'Falta identificar tramo'});
 assert.equal(data.findings[0].state,'En corrección');
 assert.ok(isAnalysisStale(analysis,data));
 assert.equal(data.events.at(-1)?.comment,'Falta identificar tramo');
 assert.deepEqual(data.events.slice(0,seed.events.length),seed.events);
});
test('alcance, fecha límite y confirmación de vencido',()=>{
 const seed=createSeed();
 const input={inspectionId:'i1',title:'Prueba',description:'Descripción',specialty:'Mecánica',location:'Tramo',severity:'Alta' as const,responsibleId:'u2',dueDate:'2026-10-08'};
 const today=createFinding(seed,'u1',input);
 assert.equal(indicators(today).overdue,indicators(seed).overdue);
 assert.throws(()=>createFinding(seed,'u1',{...input,dueDate:'2026-10-07'}));
 assert.ok(analyze(seed,'p1').priorities.every(p=>seed.inspections.find(i=>i.id===seed.findings.find(f=>f.id===p.findingId)?.inspectionId)?.projectId==='p1'));
});
