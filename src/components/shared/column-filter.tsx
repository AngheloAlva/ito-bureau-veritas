'use client';

import type { ReactNode } from 'react';
import { FunnelIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription } from '@/components/ui/popover';
import { SelectField, type SelectOption } from './select-field';

/** Presentation only: values and changes belong to the list URL. */
export function ColumnFilter({ label, active, children }: { label: string; active: boolean; children: ReactNode }) {
  return <Popover>
    <PopoverTrigger render={<Button variant={active ? 'secondary' : 'ghost'} size="sm" className="-ml-2 min-h-10 gap-1 px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase hover:text-foreground data-[popup-open]:text-foreground" />}
      aria-label={`Filtrar ${label}${active ? ': filtro activo' : ''}`}>
      {label}<FunnelIcon aria-hidden="true" data-icon="inline-end" />{active ? <span aria-hidden="true">·</span> : null}
    </PopoverTrigger>
    <PopoverContent align="start" className="w-80 max-w-(--available-width) max-h-(--available-height) gap-3 overflow-y-auto p-4 [&_[data-slot=field-label]]:text-xs [&_[data-slot=field-label]]:font-medium [&_[data-slot=field-group]]:gap-3 [&_[data-slot=field]]:gap-1.5 [&_[data-slot=select-trigger]]:h-9">
      <PopoverTitle>Filtrar {label}</PopoverTitle>
      <PopoverDescription>También disponible en «Filtros».</PopoverDescription>
      {children}
    </PopoverContent>
  </Popover>;
}

export function SelectColumnFilter({ label, name, value, options, onChange }: {
  label: string; name: string; value: string; options: SelectOption[]; onChange: (value: string) => void;
}) {
  return <ColumnFilter label={label} active={Boolean(value)}>
    <SelectField name={name} label={label} value={value} options={options} placeholder="Todos" onValueChange={onChange} />
  </ColumnFilter>;
}
