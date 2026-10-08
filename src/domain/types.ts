export const REFERENCE_DATE = '2026-10-08';
export const TIME_ZONE = 'America/Santiago';
export const STATES = ['Abierto','En corrección','Pendiente de verificación','Cerrado'] as const;
export const SEVERITIES = ['Baja','Media','Alta','Crítica'] as const;
export type State = typeof STATES[number];
export type Severity = typeof SEVERITIES[number];
export type Role = 'Inspector' | 'Responsable de corrección' | 'Coordinador';
export interface User { id:string; name:string; role:Role }
export interface Project { id:string; code:string; name:string; location:string; specialty:string; responsibleId:string; status:'En ejecución'|'Finalizado'; physicalProgress:number }
export interface Inspection { id:string; code:string; projectId:string; date:string; sector:string; specialty:string; inspectorId:string; activity:string; result:string; visitState:'Programada'|'Completada' }
export interface Finding { id:string; code:string; inspectionId:string; title:string; description:string; specialty:string; location:string; severity:Severity; state:State; responsibleId:string; createdAt:string; dueDate:string; correctiveAction:string }
export interface Evidence { id:string; findingId?:string; inspectionId?:string; name:string; type:string; phase:'detección'|'corrección'; reference:string; addedBy:string; addedAt:string; isExample:boolean }
export interface Event { id:string; findingId:string; type:'creación'|'transición'|'asignación'|'plazo'|'evidencia'; actorId:string; at:string; previousState:State; newState:State; comment:string; changes:Record<string,{before:string;after:string}> }
export interface Document { id:string; projectId:string; inspectionId?:string; name:string; type:string; revision:string; date:string; reference:string; isExample:boolean }
export interface InspectionEvent { id:string; inspectionId:string; type:'creación'|'compleción'; actorId:string; at:string; previousState:Inspection['visitState']|null; newState:Inspection['visitState'] }
export interface Data { version:number; users:User[]; projects:Project[]; inspections:Inspection[]; findings:Finding[]; evidence:Evidence[]; events:Event[]; inspectionEvents:InspectionEvent[]; documents:Document[] }
export interface Priority { findingId:string; code:string; state:State; severity:Severity; dueDate:string; reason:string; suggestion:string; sourceIds:string[] }
export interface Analysis { id:string; counts?:{active:number;overdue:number;criticalActive:number}; projectId?:string; mode:'simulado'; generatedAt:string; dataVersion:number; summary:string; priorities:Priority[]; concentrations:{projectId:string;specialty:string;count:number;sourceIds:string[]}[]; recommendations:string[]; limitations:string[] }
