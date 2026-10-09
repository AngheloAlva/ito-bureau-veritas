import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createSeed} from '../src/data/seed.ts';
import {createRepository,validateData} from '../src/data/repository.ts';
import {createInspection,completeInspection,analyze,assignFinding,changeDueDate,isAnalysisStale,transitionFinding} from '../src/domain/core.ts';
test('migra v1 sin inventar historia y conserva registros en round trip',()=>{
 const legacy=createSeed();const {inspectionEvents: omitted,...old}=legacy;void omitted;
 let raw=JSON.stringify({schemaVersion:1,data:old});const original=raw;
 const storage={getItem:()=>raw,setItem:(_k:string,v:string)=>{raw=v;}};
 const repo=createRepository(storage);repo.hydrate();assert.equal(raw,original);
 assert.deepEqual(repo.getSnapshot().data,{...old,inspectionEvents:[]});
 repo.apply(d=>createInspection(d,'u1',{...d.inspections[0],visitState:'Programada'},'2026-10-08T15:00:00Z'));
 repo.apply(d=>completeInspection(d,'i9','u1','2026-10-08T16:00:00Z'));
 assert.throws(()=>repo.apply(d=>({...d,version:d.version+1,inspectionEvents:[]})));
 assert.throws(()=>repo.apply(d=>{d.inspectionEvents[0].actorId='u3';d.version++;return d;}));
 const snap=repo.getSnapshot();snap.data.inspectionEvents[0].at='tampered';
 const second=createRepository(storage);second.hydrate();assert.deepEqual(second.getSnapshot().data,repo.getSnapshot().data);
 assert.deepEqual(second.getSnapshot().data.events,old.events);
 assert.deepEqual(second.getSnapshot().data.inspections.slice(0,8),old.inspections);
 for(const bad of ['not json',JSON.stringify({schemaVersion:99,data:old}),JSON.stringify({schemaVersion:1,data:{...old,events:[] ,inspections:null}})]){
 raw=bad;const invalid=createRepository(storage);invalid.hydrate();assert.ok(invalid.getSnapshot().error);
 invalid.apply(d=>changeDueDate(d,'H-001','u1','2026-10-09'));assert.equal(raw,bad);
 }
});
test('validación defensiva y persistencia con historial',()=>{
 const seed=createSeed();assert.ok(validateData(seed));
 const invalid=structuredClone(seed);invalid.findings[0].inspectionId='missing';assert.ok(!validateData(invalid));
 let raw:string|null=null;const storage={getItem:()=>raw,setItem:(_key:string,value:string)=>{raw=value;}};
 const repo=createRepository(storage);assert.equal(repo.getSnapshot().hydrated,false);assert.throws(()=>repo.reset(true));repo.hydrate();
 repo.apply(d=>transitionFinding(d,'H-001','u2','En corrección'));
 const second=createRepository(storage);second.hydrate();assert.equal(second.getSnapshot().data.findings[0].state,'En corrección');
 assert.throws(()=>repo.apply(d=>({...d,version:d.version+1,events:[]})));
 const snapshot=repo.getSnapshot();snapshot.data.events.length=0;assert.ok(repo.getSnapshot().data.events.length>0);
 assert.throws(()=>repo.reset(false));repo.reset(true);assert.equal(repo.getSnapshot().data.findings[0].state,'Abierto');
 raw='{"schemaVersion":99}';const corrupt=createRepository(storage);corrupt.hydrate();assert.ok(corrupt.getSnapshot().error);assert.equal(raw,'{"schemaVersion":99}');
});
test('almacenamiento falla sin perder sesión; análisis queda desactualizado',()=>{
 const repo=createRepository({getItem:()=>null,setItem:()=>{throw new Error('quota');}});repo.hydrate();const previous=analyze(repo.getSnapshot().data);
 repo.apply(d=>changeDueDate(d,'H-001','u1','2026-10-09'));assert.ok(repo.getSnapshot().error);assert.equal(repo.getSnapshot().data.findings[0].dueDate,'2026-10-09');assert.ok(isAnalysisStale(previous,repo.getSnapshot().data));
 assert.equal(assignFinding(createSeed(),'H-001','u3','u2').events.at(-1)?.actorId,'u1');
 const changed=assignFinding(createSeed(),'H-001','u1','u2');assert.equal(changed.events.at(-1)?.type,'asignación');
});
test('orden determinista: críticos, altos vencidos, otros; empate por plazo',()=>{
 const d=createSeed();const a=analyze(d);const rows=a.priorities.map(p=>d.findings.find(f=>f.id===p.findingId)!);const rank=(f:typeof rows[number])=>f.severity==='Crítica'?0:f.severity==='Alta'?1:2;
 for(let i=1;i<rows.length;i++){assert.ok(rank(rows[i-1])<=rank(rows[i]));if(rank(rows[i-1])===rank(rows[i]))assert.ok(rows[i-1].dueDate<=rows[i].dueDate);}
 assert.deepEqual(analyze(d,'p1','2026-10-08T12:00:00Z'),analyze(d,'p1','2026-10-08T12:00:00Z'));
 assert.ok(a.concentrations.every(g=>g.sourceIds.length===g.count));
});
