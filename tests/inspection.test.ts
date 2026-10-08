import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSeed } from '../src/data/seed.ts';
import { completeInspection, createInspection, indicators } from '../src/domain/core.ts';

test('historial de visitas registra actor real, hora y estado sin alterar el origen',()=>{
 const seed=createSeed();seed.users.push({id:'other',name:'Otra inspectora',role:'Inspector'});
 const input={...seed.inspections[0],inspectorId:'other',visitState:'Programada' as const};
 const at='2026-10-08T15:00:00Z';
 assert.throws(()=>createInspection(seed,'u2',input,at));
 const created=createInspection(seed,'u1',input,at);
 assert.deepEqual(seed.inspectionEvents,[]);
 assert.deepEqual(created.inspectionEvents[0],{id:'iv-2-1',inspectionId:'i9',actorId:'u1',at,type:'creación',previousState:null,newState:'Programada'});
 const done=completeInspection(created,'i9','other','2026-10-08T16:00:00Z');
 assert.equal(created.inspectionEvents.length,1);
 assert.deepEqual(done.inspectionEvents[1],{id:'iv-3-2',inspectionId:'i9',actorId:'other',at:'2026-10-08T16:00:00Z',type:'compleción',previousState:'Programada',newState:'Completada'});
 assert.deepEqual(done.events,seed.events);
 assert.throws(()=>completeInspection(created,'i9','u1','invalid'));
});

test('completar visita es independiente de hallazgos y exige inspector',()=>{
 const seed=createSeed();
 const planned=createInspection(seed,'u1',{projectId:'p1',date:'2026-10-08',sector:'Norte',specialty:'Mecánica',inspectorId:'u1',activity:'Revisión',result:'Pendientes documentales',visitState:'Programada'});
 assert.throws(()=>completeInspection(planned,'i9','u2'));
 assert.throws(()=>completeInspection(planned,'no-existe','u1'));
 const done=completeInspection(planned,'i9','u1');
 assert.equal(done.inspections.find(i=>i.id==='i9')?.visitState,'Completada');
 assert.equal(done.version,planned.version+1);
 assert.deepEqual(done.findings,planned.findings);
 assert.deepEqual(indicators(done),indicators(planned));
 assert.throws(()=>completeInspection(done,'i9','u1'));
});
