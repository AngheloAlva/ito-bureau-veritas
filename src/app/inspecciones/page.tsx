import { Suspense } from 'react';
import { Inspections } from '@/features/inspections';
export default function Page(){return <Suspense fallback={<p>Cargando filtros…</p>}><Inspections/></Suspense>;}
