'use client';

import type { CSSProperties, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useDemo } from '@/components/demo-provider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './sidebar';
import { WorkspaceHeader } from './header';
import { DemoStatus, RecordsLoading } from './status';

export function Workspace({ children }: { children: ReactNode }) {
  const demo = useDemo();
  const path = usePathname();
  const legacy = path.startsWith('/inspecciones') || path.startsWith('/hallazgos');
  return (
    <SidebarProvider style={{ '--sidebar-width': '13rem' } as CSSProperties}>
      <a href="#contenido" className="skip-link">Saltar al contenido</a>
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col bg-muted/40">
        <WorkspaceHeader />
        <main id="contenido" tabIndex={-1} className="workspace-main flex w-full flex-col gap-6 p-5 lg:p-8">
          <DemoStatus />
          {demo.hydrated ? <div className={legacy ? 'legacy-records' : 'flex flex-col gap-6'}>{children}</div> : <RecordsLoading />}
        </main>
      </div>
    </SidebarProvider>
  );
}
