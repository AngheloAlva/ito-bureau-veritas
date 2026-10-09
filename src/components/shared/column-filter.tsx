'use client';

import type { ReactNode } from 'react';
import { FunnelIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription } from '@/components/ui/popover';
import { SelectField, type SelectOption } from './select-field';

/** Presentation only: values and changes belong to the list URL. */
export function ColumnFilter({ label, active, children }: { label: string; active: boolean; children: ReactNode }) {
  return <Popover>
    <PopoverTrigger render={<Button variant={active ? 'secondary' : 'ghost'} size="sm" className="min-h-10" />}
      aria-label={`Filtrar ${label}${active ? ': filtro activo' : ''}`}>
      {label}<FunnelIcon aria-hidden="true" data-icon="inline-end" />{active ? <span aria-hidden="true">·</span> : null}
    </PopoverTrigger>
    <PopoverContent align="start" className="max-w-(--available-width) max-h-(--available-height) overflow-y-auto">
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
