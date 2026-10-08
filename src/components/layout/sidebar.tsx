'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChartBarIcon } from '@phosphor-icons/react/dist/csr/ChartBar';
import { BuildingsIcon } from '@phosphor-icons/react/dist/csr/Buildings';
import { ClipboardTextIcon } from '@phosphor-icons/react/dist/csr/ClipboardText';
import { WarningCircleIcon } from '@phosphor-icons/react/dist/csr/WarningCircle';
import { ListChecksIcon } from '@phosphor-icons/react/dist/csr/ListChecks';
import { XIcon } from '@phosphor-icons/react/dist/csr/X';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const routes = [
  { href: '/', label: 'Resumen', icon: ChartBarIcon },
  { href: '/proyectos', label: 'Proyectos', icon: BuildingsIcon },
  { href: '/inspecciones', label: 'Inspecciones', icon: ClipboardTextIcon },
  { href: '/hallazgos', label: 'Hallazgos', icon: WarningCircleIcon },
  { href: '/analisis', label: 'Análisis asistido', icon: ListChecksIcon },
];

function NavigationContent() {
  const path = usePathname();
  const { setOpenMobile } = useSidebar();
  return (
    <>
      <SidebarHeader className="px-5 py-4">
        <Link href="/" aria-label="ITO · volver al resumen" onClick={() => setOpenMobile(false)} className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-sidebar-ring">
          <Image src="/brand/bureau-veritas-chile.svg" alt="Bureau Veritas Chile" width={111} height={138} className="h-auto w-10 shrink-0" priority />
          <span className="text-lg font-semibold tracking-tight">ITO <span className="block text-xs font-normal tracking-normal">Gestión de inspecciones</span></span>
        </Link>
      </SidebarHeader>
      <div className="px-5"><Separator /></div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Control operacional</SidebarGroupLabel>
          <SidebarGroupContent>
            <nav aria-label="Navegación principal">
              <SidebarMenu>
                {routes.map(({ href, label, icon: Icon }) => {
                  const active = href === '/' ? path === '/' : path.startsWith(href);
                  return (
                    <SidebarMenuItem key={href}>
                      <SidebarMenuButton className="min-h-11" isActive={active} aria-current={active ? 'page' : undefined} render={<Link href={href} onClick={() => setOpenMobile(false)} />}>
                        <Icon aria-hidden="true" />
                        <span>{label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="px-5 py-4">
        <p className="text-xs text-muted-foreground">Demo</p>
      </SidebarFooter>
    </>
  );
}

export function AppSidebar() {
  const { isMobile, openMobile, setOpenMobile } = useSidebar();
  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent side="left" showCloseButton={false} className="max-w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navegación de inspecciones</SheetTitle>
            <SheetDescription>Seleccione una sección de la demostración.</SheetDescription>
          </SheetHeader>
          <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
            <SheetClose render={<Button variant="secondary" size="icon" className="absolute right-3 top-3" />} aria-label="Cerrar navegación"><XIcon aria-hidden="true" /></SheetClose>
            <NavigationContent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }
  return <Sidebar collapsible="offcanvas"><NavigationContent /></Sidebar>;
}
