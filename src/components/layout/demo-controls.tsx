'use client';

import { useRef, useState } from 'react';
import { UserCircleIcon } from '@phosphor-icons/react/dist/csr/UserCircle';
import { useDemo } from '@/components/demo-provider';
import type { Role } from '@/domain/types';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

import { Popover, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type Option = { value: string; label: string };
export function ContextSelect({ id, label, value, items, onChange, compact = false }: { id: string; label: string; value: string; items: Option[]; onChange: (value: string) => void; compact?: boolean }) {
  return (
    <Field className="min-w-0 gap-1">
      <FieldLabel htmlFor={id} className={compact ? 'sr-only' : undefined}>{label}</FieldLabel>
      <Select items={items} value={value} onValueChange={next => { if (next !== null) onChange(next); }}>
        <SelectTrigger id={id} className="min-h-11 w-full"><SelectValue /></SelectTrigger>
        <SelectContent alignItemWithTrigger={false} align="start">
          <SelectGroup>{items.map(item => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}

const SHORT_ROLE: Record<Role, string> = { 'Inspector': 'Inspector', 'Responsable de corrección': 'Responsable', 'Coordinador': 'Coordinador' };
const ROLES: Role[] = ['Inspector', 'Responsable de corrección', 'Coordinador'];

/** Always-visible "Viendo como" switcher: segmented on wide screens, compact select on narrow ones. */
export function RoleSwitcher() {
  const demo = useDemo();
  return (
    <div className="ml-auto flex min-w-0 shrink-0 items-center gap-2 2xl:ml-0">
      <div className="hidden min-w-0 flex-col leading-tight xl:flex">
        <span className="text-[0.6875rem] font-semibold tracking-wide text-muted-foreground uppercase">Viendo como</span>
        <span className="max-w-48 truncate text-xs font-medium" title={`${demo.user.name} · ${demo.user.role}`}>{demo.user.name}</span>
      </div>
      <div role="group" aria-label="Viendo como (rol de demo)" className="hidden items-center gap-0.5 rounded-sm border bg-muted/50 p-0.5 md:flex">
        {ROLES.map(role => {
          const active = demo.user.role === role;
          return <button key={role} type="button" aria-pressed={active} title={`${role}${active ? ` · ${demo.user.name}` : ''}`} onClick={() => demo.selectRole(role)}
            className={`min-h-9 rounded-sm px-3 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring ${active ? 'bg-[var(--brand-blue)] text-white' : 'text-muted-foreground hover:bg-background hover:text-foreground'}`}>{SHORT_ROLE[role]}</button>;
        })}
      </div>
      <div className="w-40 md:hidden">
        <ContextSelect id="demo-role-compact" label="Viendo como" compact value={demo.user.role} items={ROLES.map(role => ({ value: role, label: `${SHORT_ROLE[role]}${demo.user.role === role ? ` · ${demo.user.name}` : ''}` }))} onChange={role => demo.selectRole(role as Role)} />
      </div>
    </div>
  );
}

export function DemoControls() {
  const demo = useDemo();
  const [resetOpen, setResetOpen] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const roles: Role[] = ['Inspector', 'Responsable de corrección', 'Coordinador'];
  const people = demo.data.users.filter(user => user.role === demo.user.role);
  const identity = `${demo.user.name} · ${demo.user.role}`;
  return (
    <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
      <Popover open={controlsOpen} onOpenChange={setControlsOpen}>
        <Tooltip>
          <TooltipTrigger render={<PopoverTrigger render={<Button ref={triggerRef} variant="ghost" size="icon" className="size-11 shrink-0" />} />} aria-label={`Controles de demo · ${identity}`}>
            <UserCircleIcon aria-hidden="true" />
          </TooltipTrigger>
          <TooltipContent>Demo · {identity}</TooltipContent>
        </Tooltip>
        <PopoverContent align="end" className="w-80 max-w-[calc(100vw-2rem)]" finalFocus={resetOpen ? false : triggerRef}>
          <PopoverHeader><PopoverTitle>Identidad de demo</PopoverTitle></PopoverHeader>
          <FieldGroup className="gap-4">
            <ContextSelect id="demo-role" label="Rol" value={demo.user.role} items={roles.map(role => ({ value: role, label: role }))} onChange={role => demo.selectRole(role as Role)} />
            {people.length > 1 ? (
              <ContextSelect id="demo-person" label="Persona" value={demo.user.id} items={people.map(user => ({ value: user.id, label: user.name }))} onChange={demo.selectUser} />
            ) : (
              <Field className="gap-1"><FieldLabel>Persona</FieldLabel><p className="text-sm">{demo.user.name}</p></Field>
            )}
          </FieldGroup>
          <p className="text-xs text-muted-foreground">{demo.hydrated ? (demo.persistent ? 'Guardado local en este navegador.' : 'Sesión sin persistencia garantizada.') : 'Recuperando datos locales…'}</p>
          <Button variant="outline" className="min-h-11" disabled={!demo.hydrated} onClick={() => { setResetOpen(true); setControlsOpen(false); }}>Restablecer demo</Button>
        </PopoverContent>
      </Popover>
      <AlertDialogContent initialFocus={cancelRef} finalFocus={triggerRef}>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Restablecer los datos de la demo?</AlertDialogTitle>
          <AlertDialogDescription>Se perderán los cambios de este navegador y se recuperarán los registros de ejemplo. Esta acción no se puede deshacer.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel ref={cancelRef}>Conservar cambios</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={() => { demo.reset(); setResetOpen(false); }} disabled={!demo.hydrated}>Restablecer datos</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
