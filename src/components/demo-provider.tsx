'use client';
import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from 'react';
import { createBrowserRepository, type RepositorySnapshot } from '@/data/repository';
import { createSeed } from '@/data/seed';
import type { Data, Role, User } from '@/domain/types';

type Repository = ReturnType<typeof createBrowserRepository>;
type Context = RepositorySnapshot & { projectId:string; setProjectId:(id:string)=>void; user:User; selectRole:(role:Role)=>void; selectUser:(id:string)=>void; apply:(transform:(data:Data)=>Data)=>void; reset:()=>void; notice:string; error:string; storageError:string|null; run:(action:()=>void,message?:string)=>boolean };
const DemoContext=createContext<Context|null>(null);
export function DemoProvider({children}:{children:ReactNode}) {
 const repository=useRef<Repository|null>(null);
 const [snapshot,setSnapshot]=useState<RepositorySnapshot>(()=>({data:createSeed(),hydrated:false,persistent:false,error:null}));
 const [projectId,setProjectId]=useState('');
 const [userId,setUserId]=useState('u1');
 const [notice,setNotice]=useState(''); const [error,setError]=useState('');
 useEffect(()=>{
  const repo=createBrowserRepository();
  const refresh=()=>setSnapshot(repo.getSnapshot());
  const unsubscribe=repo.subscribe(refresh); repository.current=repo; repo.hydrate();
  return unsubscribe;
 },[]);
 const user=snapshot.data.users.find(u=>u.id===userId)??snapshot.data.users[0];
 function run(action:()=>void,message='Cambio guardado en la sesión demo.') {try{action();setError('');setNotice(message);return true;}catch(e){setNotice('');setError(e instanceof Error?e.message:'No se pudo completar el cambio.');return false;}}
 const value:Context={...snapshot,projectId,setProjectId,user,notice,error,storageError:snapshot.error,run,selectUser:setUserId,selectRole:role=>setUserId(snapshot.data.users.find(u=>u.role===role)!.id),apply:transform=>{if(!repository.current)throw new Error('Espere la carga de datos.');repository.current.apply(transform);},reset:()=>{run(()=>{if(!repository.current||!snapshot.hydrated)throw new Error('Espere la carga de datos.');repository.current.reset(true);},'Datos ficticios restablecidos.');}};
 return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}
export function useDemo(){const context=useContext(DemoContext);if(!context)throw new Error('Proveedor demo no disponible.');return context;}
