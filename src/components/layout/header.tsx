'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SidebarSimpleIcon } from '@phosphor-icons/react/dist/csr/SidebarSimple';
import { useDemo } from '@/components/demo-provider';
import { projectScopeHref } from '@/lib/list-filters';
import { formatDate } from '@/lib/format';
import { REFERENCE_DATE } from '@/domain/types';
import { Button } from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { useSidebar } from '@/components/ui/sidebar';
import { ContextSelect, DemoControls, RoleSwitcher } from './demo-controls';

export function WorkspaceHeader() {
  const demo = useDemo();
  const path = usePathname();
  const params = useSearchParams();
  const router = useRouter();
  const sidebar = useSidebar();
  const queryScoped = ['/hallazgos', '/inspecciones', '/analisis'].includes(path);
  const scope = queryScoped ? params.get('project') ?? demo.projectId : demo.projectId;

  function changeScope(id: string) {
    demo.setProjectId(id);
    if (queryScoped) {
      router.replace(projectScopeHref(path, params.toString(), window.location.hash, id));
    }
  }

  return (
    <header className="no-print flex flex-wrap items-center gap-2 border-b bg-background px-5 py-2 lg:gap-4 lg:px-8">
      <Button variant="outline" size="icon" className="size-11 shrink-0" onClick={sidebar.toggleSidebar} aria-label={sidebar.isMobile ? 'Abrir navegación' : 'Mostrar u ocultar navegación'} aria-expanded={sidebar.isMobile ? sidebar.openMobile : sidebar.open} title="Navegación · Ctrl/⌘ B"><SidebarSimpleIcon aria-hidden="true" /></Button>
      <FieldGroup className="order-last w-full min-w-0 basis-full sm:order-none sm:w-auto sm:max-w-xs sm:flex-1 sm:basis-0">
        <ContextSelect id="work-scope" label="Alcance de trabajo" value={scope} items={[{ value: '', label: 'Cartera completa' }, ...demo.data.projects.map(project => ({ value: project.id, label: `${project.code} · ${project.name}` }))]} onChange={changeScope} compact />
      </FieldGroup>
      <div className="ml-auto hidden shrink-0 items-center gap-2 text-xs text-muted-foreground 2xl:flex">
        <span>Referencia · Santiago</span>
        <time dateTime={REFERENCE_DATE} className="font-semibold text-foreground tabular-nums">{formatDate(REFERENCE_DATE)}</time>
      </div>
      <RoleSwitcher />
      <DemoControls />
    </header>
  );
}
