import type { Data } from '../domain/types.ts';
import { STATES, SEVERITIES } from '../domain/types.ts';
import { validDate } from '../domain/core.ts';
import { createSeed } from './seed.ts';
export const SCHEMA_VERSION=2;
export const STORAGE_KEY='ito-demo:v1';
export interface StorageAdapter { getItem(key:string):string|null; setItem(key:string,value:string):void }
export interface RepositorySnapshot { data:Data; hydrated:boolean; persistent:boolean; error:string|null }
const object=(v:unknown):v is Record<string,unknown>=>!!v&&typeof v==='object'&&!Array.isArray(v);
export function validateData(value:unknown):value is Data {
 if(!object(value)||!Number.isSafeInteger(value.version)||(value.version as number)<1)return false;
 const seed=createSeed();
 for(const key of ['users','projects','inspections','findings','evidence','events','documents'] as const){
 const rows=value[key];if(!Array.isArray(rows))return false;
 const ids=new Set();for(const row of rows){if(!object(row)||typeof row.id!=='string'||!row.id||ids.has(row.id))return false;ids.add(row.id);
 const template=seed[key][0];for(const [field,sample] of Object.entries(template)){if(['findingId','inspectionId'].includes(field)&&key==='evidence')continue;if(field==='changes'){if(!object(row[field])||!Object.values(row[field]).every(v=>object(v)&&typeof v.before==='string'&&typeof v.after==='string'))return false;}else if(typeof row[field]!==typeof sample)return false;}
 }
 }
 if(!Array.isArray(value.inspectionEvents))return false;
 const ids=new Set<string>();for(const e of value.inspectionEvents){
 if(!object(e)||typeof e.id!=='string'||!e.id||ids.has(e.id)||typeof e.inspectionId!=='string'||typeof e.actorId!=='string'||typeof e.at!=='string'||Number.isNaN(Date.parse(e.at)))return false;
 ids.add(e.id);
 if(!['Programada','Completada'].includes(e.newState as string)||!(e.type==='creación'&&e.previousState===null||e.type==='compleción'&&e.previousState==='Programada'&&e.newState==='Completada'))return false;
 }
 const d=value as unknown as Data;const has=(rows:{id:string}[],id:string)=>rows.some(r=>r.id===id);const stamp=(s:string)=>typeof s==='string'&&!Number.isNaN(Date.parse(s));const local=(s:string)=>typeof s==='string'&&/^\/demo\/[a-zA-Z0-9_.-]+$/.test(s);
 return d.inspectionEvents.every(e=>has(d.inspections,e.inspectionId)&&d.users.some(u=>u.id===e.actorId&&u.role==='Inspector'))&&d.users.every(u=>['Inspector','Responsable de corrección','Coordinador'].includes(u.role))&&
 d.projects.every(p=>has(d.users,p.responsibleId)&&['En ejecución','Finalizado'].includes(p.status)&&Number.isFinite(p.physicalProgress)&&p.physicalProgress>=0&&p.physicalProgress<=100)&&
 d.inspections.every(i=>has(d.projects,i.projectId)&&d.users.some(u=>u.id===i.inspectorId&&u.role==='Inspector')&&validDate(i.date)&&['Programada','Completada'].includes(i.visitState))&&
 new Set(d.findings.map(f=>f.code)).size===d.findings.length&&d.findings.every(f=>has(d.inspections,f.inspectionId)&&d.users.some(u=>u.id===f.responsibleId&&u.role==='Responsable de corrección')&&STATES.includes(f.state)&&SEVERITIES.includes(f.severity)&&validDate(f.dueDate)&&stamp(f.createdAt)&&/^H-\d+$/.test(f.code)&& (f.state==='Abierto'||f.state==='En corrección'||!!f.correctiveAction.trim()))&&
 d.evidence.every(e=>((typeof e.findingId==='string'&&has(d.findings,e.findingId)&&e.inspectionId===undefined)||(typeof e.inspectionId==='string'&&has(d.inspections,e.inspectionId)&&e.findingId===undefined))&&has(d.users,e.addedBy)&&stamp(e.addedAt)&&['detección','corrección'].includes(e.phase)&&local(e.reference))&&
 d.events.every(e=>has(d.findings,e.findingId)&&has(d.users,e.actorId)&&stamp(e.at)&&STATES.includes(e.previousState)&&STATES.includes(e.newState)&&['creación','transición','asignación','plazo','evidencia'].includes(e.type))&&
 d.documents.every(doc=>has(d.projects,doc.projectId)&&(doc.inspectionId===undefined||d.inspections.some(i=>i.id===doc.inspectionId&&i.projectId===doc.projectId))&&validDate(doc.date)&&local(doc.reference));
}
/** No browser access until hydrate(). Snapshots are cloned so consumers cannot edit history. */
export function createRepository(storage?:StorageAdapter){
 let writeBlocked=false;
 let state:RepositorySnapshot={data:createSeed(),hydrated:false,persistent:false,error:null};const listeners=new Set<()=>void>();
 const notify=()=>listeners.forEach(l=>l());
 const persist=()=>{if(writeBlocked)return;try{if(!storage)throw new Error();storage.setItem(STORAGE_KEY,JSON.stringify({schemaVersion:SCHEMA_VERSION,data:state.data}));state={...state,persistent:true,error:null};}catch{state={...state,persistent:false,error:'No se pudo guardar en este navegador. La sesión sigue operativa sin persistencia garantizada.'};}};
 return {
 getSnapshot:():RepositorySnapshot=>structuredClone(state),
 subscribe(listener:()=>void){listeners.add(listener);return ()=>{listeners.delete(listener);};},
 hydrate(){if(state.hydrated)return;state={...state,hydrated:true};try{if(!storage)throw new Error();const raw=storage.getItem(STORAGE_KEY);if(raw){const parsed:unknown=JSON.parse(raw);if(!object(parsed)||!object(parsed.data)||![1,SCHEMA_VERSION].includes(parsed.schemaVersion as number))throw new Error();
 const migrated=parsed.schemaVersion===1?{...parsed.data,inspectionEvents:parsed.data.inspectionEvents??[]}:parsed.data;
 if(!validateData(migrated))throw new Error();state={...state,data:structuredClone(migrated)};}state={...state,persistent:true,error:null};}catch{writeBlocked=true;state={...state,persistent:false,error:'No se pudieron recuperar los datos locales; se usa el conjunto ficticio inicial. No se sobrescribió el almacenamiento.'};}notify();},
 apply(transform:(data:Data)=>Data){if(!state.hydrated)throw new Error('Hidrate el repositorio antes de modificar datos.');const next=transform(structuredClone(state.data));if(!validateData(next)||next.version<=state.data.version)throw new Error('Cambio de datos no válido.');const oldEvents=state.data.events;if(next.events.length<oldEvents.length||oldEvents.some((e,i)=>JSON.stringify(e)!==JSON.stringify(next.events[i])))throw new Error('El historial no puede modificarse ni eliminarse.');const oldInspectionEvents=state.data.inspectionEvents;if(next.inspectionEvents.length<oldInspectionEvents.length||oldInspectionEvents.some((e,i)=>JSON.stringify(e)!==JSON.stringify(next.inspectionEvents[i])))throw new Error('El historial de visitas no puede modificarse ni eliminarse.');state={...state,data:structuredClone(next)};persist();notify();},
 reset(confirmed:boolean){if(!confirmed)throw new Error('Confirme el restablecimiento de los datos ficticios.');if(!state.hydrated)throw new Error('Hidrate el repositorio antes de restablecer.');writeBlocked=false;const seed=createSeed();seed.version=state.data.version+1;state={...state,data:seed};persist();notify();}
 };
}
export function createBrowserRepository(){let storage:StorageAdapter|undefined;try{if(typeof window!=='undefined')storage=window.localStorage;}catch{/* hydrate reports unavailable storage */}return createRepository(storage);}
