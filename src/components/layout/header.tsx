'use client';

import { SidebarSimpleIcon } from '@phosphor-icons/react/dist/csr/SidebarSimple';
import { formatDate } from '@/lib/format';
import { REFERENCE_DATE } from '@/domain/types';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { DemoControls } from './demo-controls';

export function WorkspaceHeader() {
  const sidebar = useSidebar();

  return (
    <header className="no-print flex flex-wrap items-center gap-2 border-b bg-background/80 px-5 py-2 lg:gap-4 lg:px-8">
      <Button variant="outline" size="icon" className="size-11 shrink-0 rounded-xl" onClick={sidebar.toggleSidebar} aria-label={sidebar.isMobile ? 'Abrir navegación' : 'Mostrar u ocultar navegación'} aria-expanded={sidebar.isMobile ? sidebar.openMobile : sidebar.open} title="Navegación · Ctrl/⌘ B"><SidebarSimpleIcon aria-hidden="true" /></Button>
      <div className="ml-auto hidden shrink-0 items-center gap-2 text-xs text-muted-foreground 2xl:flex">
        <span>Referencia · Santiago</span>
        <time dateTime={REFERENCE_DATE} className="font-semibold text-foreground tabular-nums">{formatDate(REFERENCE_DATE)}</time>
      </div>
      <DemoControls />
    </header>
  );
}
