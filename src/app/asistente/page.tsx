import { Suspense } from 'react';
import { AssistantView } from '@/features/assistant/assistant-view';

export const metadata = { title: 'Asistente de análisis' };

export default function Page() {
  return <Suspense fallback={<p>Cargando asistente…</p>}><AssistantView /></Suspense>;
}
