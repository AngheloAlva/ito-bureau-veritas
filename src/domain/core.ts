import { REFERENCE_DATE } from './types.ts';
import type { Data, Finding, State, Analysis, Inspection, Event } from './types.ts';
export class DomainError extends Error {}
const requireValue = (ok:unknown,message:string) => { if(!ok) throw new DomainError(message); };
export function validDate(value:string):boolean { return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value; }
function actor(data:Data,id:string){ const user=data.users.find(u=>u.id===id); requireValue(user,'Persona no válida.'); return user!; }
function finding(data:Data,id:string){ const f=data.findings.find(f=>f.id===id); requireValue(f,'Hallazgo no encontrado.'); return f!; }
function timestamp(at:string){ requireValue(!Number.isNaN(Date.parse(at)),'Fecha de evento no válida.'); return at; }
function event(data:Data,f:Finding,actorId:string,type:Event['type'],comment:string,changes:Event['changes'],newState=f.state,at=new Date().toISOString()):Event {return {id:`ev-${data.version+1}-${data.events.length+1}`,findingId:f.id,type,actorId,at:timestamp(at),previousState:f.state,newState,comment,changes};}
function update(data:Data,f:Finding,patch:Partial<Finding>,e:Event):Data{return {...data,version:data.version+1,findings:data.findings.map(item=>item.id===f.id?{...item,...patch}:item),events:[...data.events,e]};}
export function transitionFinding(data:Data,id:string,actorId:string,target:State,options:{comment?:string;action?:string;evidenceId?:string;at?:string}={}):Data {
 const f=finding(data,id), user=actor(data,actorId); const comment=options.comment?.trim()??'';
 const correction=user.role==='Responsable de corrección'&&f.responsibleId===actorId;
 const inspector=user.role==='Inspector';
 let patch:Partial<Finding>={state:target};
 if(f.state==='Abierto'&&target==='En corrección') requireValue(correction,'Solo el responsable asignado puede iniciar la corrección.');
 else if(f.state==='En corrección'&&target==='Pendiente de verificación') {
 requireValue(correction,'Solo el responsable asignado puede remitir la corrección.');
 requireValue(options.action?.trim(),'Indique la acción correctiva.');
 requireValue(data.evidence.some(e=>e.id===options.evidenceId&&e.findingId===id&&e.phase==='corrección'),'Seleccione evidencia de corrección del hallazgo.');
 patch={...patch,correctiveAction:options.action!.trim()};
 } else if(f.state==='Pendiente de verificación'&&(target==='Cerrado'||target==='En corrección')) { requireValue(inspector,'Solo un inspector puede verificar.'); requireValue(comment,target==='Cerrado'?'Indique el comentario de verificación.':'Indique el motivo de devolución.'); }
 else throw new DomainError('Transición no permitida.');
 return update(data,f,patch,event(data,f,actorId,'transición',comment,{state:{before:f.state,after:target},...(target==='Pendiente de verificación'?{evidenceId:{before:'',after:options.evidenceId!}}:{}),...(patch.correctiveAction?{correctiveAction:{before:f.correctiveAction,after:patch.correctiveAction}}:{})},target,options.at));
}
export function assignFinding(data:Data,id:string,actorId:string,responsibleId:string,at?:string):Data {
 const f=finding(data,id); requireValue(actor(data,actorId).role==='Inspector','Solo un inspector puede asignar.'); requireValue(actor(data,responsibleId).role==='Responsable de corrección','Seleccione un responsable de corrección.'); requireValue(f.state!=='Cerrado','El hallazgo está cerrado.');
 return update(data,f,{responsibleId},event(data,f,actorId,'asignación','Responsable actualizado.',{responsibleId:{before:f.responsibleId,after:responsibleId}},f.state,at));
}
export function changeDueDate(data:Data,id:string,actorId:string,dueDate:string,confirmOverdue=false,at?:string):Data {
 const f=finding(data,id); requireValue(actor(data,actorId).role==='Inspector','Solo un inspector puede cambiar el plazo.'); requireValue(f.state!=='Cerrado','El hallazgo está cerrado.'); checkDue(dueDate,confirmOverdue);
 return update(data,f,{dueDate},event(data,f,actorId,'plazo','Plazo actualizado.',{dueDate:{before:f.dueDate,after:dueDate}},f.state,at));
}
function checkDue(date:string,confirm:boolean){requireValue(validDate(date),'Fecha compromiso no válida.');requireValue(date>=REFERENCE_DATE||confirm,'La fecha dejará el hallazgo vencido. Confirme explícitamente.');}
function requiredFields(values:string[]){requireValue(values.every(v=>typeof v==='string'&&v.trim()),'Complete todos los campos obligatorios.');}
export function createInspection(data:Data,actorId:string,input:Omit<Inspection,'id'|'code'>,at=new Date().toISOString()):Data {
 requireValue(actor(data,actorId).role==='Inspector','Solo un inspector puede registrar inspecciones.'); requiredFields([input.sector,input.specialty,input.activity,input.result]);requireValue(data.projects.some(p=>p.id===input.projectId),'Proyecto no válido.');requireValue(actor(data,input.inspectorId).role==='Inspector','Inspector no válido.');requireValue(validDate(input.date),'Fecha de inspección no válida.');requireValue(['Programada','Completada'].includes(input.visitState),'Estado de visita no válido.');
 const n=data.inspections.length+1;return {...data,version:data.version+1,inspections:[...data.inspections,{...input,id:`i${n}`,code:`I-${String(n).padStart(3,'0')}`}],inspectionEvents:[...data.inspectionEvents,{id:`iv-${data.version+1}-${data.inspectionEvents.length+1}`,inspectionId:`i${n}`,actorId,at:timestamp(at),type:'creación',previousState:null,newState:input.visitState}]};
}
export function completeInspection(data:Data,id:string,actorId:string,at=new Date().toISOString()):Data {
 requireValue(actor(data,actorId).role==='Inspector','Solo un inspector puede completar la visita.');
 const inspection=data.inspections.find(i=>i.id===id);
 requireValue(inspection,'Inspección no encontrada.');
 requireValue(inspection!.visitState==='Programada','La visita ya está completada.');
 return {...data,version:data.version+1,inspections:data.inspections.map(i=>i.id===id?{...i,visitState:'Completada'}:i),inspectionEvents:[...data.inspectionEvents,{id:`iv-${data.version+1}-${data.inspectionEvents.length+1}`,inspectionId:id,actorId,at:timestamp(at),type:'compleción',previousState:inspection!.visitState,newState:'Completada'}]};
}
export type NewFinding = Omit<Finding,'id'|'code'|'state'|'createdAt'|'correctiveAction'>;
export function createFinding(data:Data,actorId:string,input:NewFinding,confirmOverdue=false,at=new Date().toISOString()):Data {
 requireValue(actor(data,actorId).role==='Inspector','Solo un inspector puede registrar hallazgos.');requiredFields([input.title,input.description,input.specialty,input.location]);requireValue(data.inspections.some(i=>i.id===input.inspectionId),'Inspección no válida.');requireValue(actor(data,input.responsibleId).role==='Responsable de corrección','Responsable no válido.');requireValue(['Baja','Media','Alta','Crítica'].includes(input.severity),'Severidad no válida.');checkDue(input.dueDate,confirmOverdue);
 const code=`H-${String(Math.max(0,...data.findings.map(f=>Number(f.code.slice(2))))+1).padStart(3,'0')}`;
 const f:Finding={...input,id:code,code,state:'Abierto',createdAt:timestamp(at),correctiveAction:''};return {...data,version:data.version+1,findings:[...data.findings,f],events:[...data.events,event(data,f,actorId,'creación','Hallazgo registrado.',{},f.state,at)]};
}
export function addExampleEvidence(data:Data,id:string,actorId:string,phase:'detección'|'corrección',at=new Date().toISOString()):Data {
 const f=finding(data,id),u=actor(data,actorId);requireValue(f.state!=='Cerrado'&&(u.role==='Inspector'||(u.role==='Responsable de corrección'&&f.responsibleId===actorId&&phase==='corrección')),'No puede agregar esta evidencia.');
 const evidence={id:`e-${data.version+1}`,findingId:id,name:`Respaldo de ${phase} de ejemplo`,type:'Texto',phase,reference:'/demo/evidencia.txt',addedBy:actorId,addedAt:timestamp(at),isExample:true};
 return {...update(data,f,{},event(data,f,actorId,'evidencia',`Evidencia de ${phase} de ejemplo agregada.`,{},f.state,at)),evidence:[...data.evidence,evidence]};
}
export function scopedFindings(data:Data,projectId?:string){return data.findings.filter(f=>!projectId||data.inspections.some(i=>i.id===f.inspectionId&&i.projectId===projectId));}
export function isActive(f:Finding){return f.state!=='Cerrado';}
export function isOverdue(f:Finding,reference=REFERENCE_DATE){return isActive(f)&&f.dueDate<reference;}
export function indicators(data:Data,projectId?:string,period={from:'2026-10-01',to:REFERENCE_DATE}){
 const fs=scopedFindings(data,projectId);const count=(predicate:(f:Finding)=>boolean)=>fs.filter(predicate).length;
 return {total:fs.length,active:count(isActive),overdue:count(f=>isOverdue(f)),criticalActive:count(f=>isActive(f)&&f.severity==='Crítica'),closed:count(f=>!isActive(f)),closedPercentage:fs.length?count(f=>!isActive(f))/fs.length*100:null,inspections:data.inspections.filter(i=>(!projectId||i.projectId===projectId)&&i.date>=period.from&&i.date<=period.to).length,byState:Object.fromEntries(['Abierto','En corrección','Pendiente de verificación','Cerrado'].map(s=>[s,count(f=>f.state===s)])),bySeverity:Object.fromEntries(['Baja','Media','Alta','Crítica'].map(s=>[s,count(f=>f.severity===s)])),byProject:Object.fromEntries(data.projects.filter(p=>!projectId||p.id===projectId).map(p=>[p.id,fs.filter(f=>data.inspections.find(i=>i.id===f.inspectionId)?.projectId===p.id).length]))};
}
export function analyze(data:Data,projectId?:string,at=new Date().toISOString()):Analysis {
 const fs=scopedFindings(data,projectId),stats=indicators(data,projectId);const rank=(f:Finding)=>f.severity==='Crítica'?0:f.severity==='Alta'&&isOverdue(f)?1:2;
 const priorities=fs.filter(f=>isActive(f)&&(f.severity==='Crítica'||isOverdue(f))).sort((a,b)=>rank(a)-rank(b)||a.dueDate.localeCompare(b.dueDate)||a.createdAt.localeCompare(b.createdAt)||a.code.localeCompare(b.code)).map(f=>({findingId:f.id,code:f.code,state:f.state,severity:f.severity,dueDate:f.dueDate,reason:f.severity==='Crítica'?'Hallazgo crítico activo.':f.severity==='Alta'?'Hallazgo alto con plazo vencido.':'Hallazgo activo con plazo vencido.',suggestion:f.id==='H-001'?'Solicitar el registro firmado y verificar su correspondencia con el tramo; no implica falla de la instalación.':'Revisar responsable, plazo y evidencias antes de verificar la corrección.',sourceIds:[f.id,f.inspectionId]}));
 const groups=new Map<string,{projectId:string;specialty:string;count:number;sourceIds:string[]}>();for(const f of fs.filter(isActive)){const p=data.inspections.find(i=>i.id===f.inspectionId)!.projectId,key=p+'|'+f.specialty;const g=groups.get(key)??{projectId:p,specialty:f.specialty,count:0,sourceIds:[]};g.count++;g.sourceIds.push(f.id);groups.set(key,g);}
 return {id:`a-${data.version}-${projectId??'cartera'}`,projectId,mode:'simulado',generatedAt:timestamp(at),dataVersion:data.version,summary:`Análisis simulado: ${stats.active} activos, ${stats.overdue} vencidos y ${stats.criticalActive} críticos activos.`,priorities,concentrations:[...groups.values()].sort((a,b)=>b.count-a.count||a.projectId.localeCompare(b.projectId)||a.specialty.localeCompare(b.specialty)),recommendations:['Revisar la concentración de pendientes por proyecto y especialidad.','Revisar responsables y respaldo documental de las prioridades.'],limitations:['Reglas deterministas, no IA generativa ni modelo predictivo.','Las recomendaciones requieren revisión profesional.']};
}
export function isAnalysisStale(analysis:Analysis,data:Data){return analysis.dataVersion!==data.version;}
export function draftReport(analysis:Analysis){return [analysis.summary,...analysis.priorities.map(p=>`${p.code}: ${p.reason} ${p.suggestion}`),...analysis.limitations].join('\n');}
