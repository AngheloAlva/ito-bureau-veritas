'use client';

import type { ReactNode } from 'react';
import { FunnelIcon, XIcon, ArrowCounterClockwiseIcon } from '@phosphor-icons/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription } from '@/components/ui/popover';

export type FilterChip = { key: string; label: string };
export function FilterToolbar({ title, count, chips, onRemove, onClear, search, children }: {
  title: string; count: string; chips: FilterChip[]; onRemove: (key: string) => void;
  onClear: () => void; search?: ReactNode; children: ReactNode;
}) {
  return <section aria-label={title} className="flex min-w-0 flex-col gap-3">
    <div className="flex min-w-0 flex-wrap items-end gap-2">
      {search ? <div className="min-w-0 flex-1 basis-44 sm:max-w-sm">{search}</div> : null}
      <Popover>
        <PopoverTrigger render={<Button variant="outline" size="sm" className="min-h-10" />} aria-label={`${title}: ${chips.length} filtros activos`}>
          <FunnelIcon aria-hidden="true" data-icon="inline-start" />Filtros
          {chips.length ? <Badge variant="secondary" className="tabular-nums">{chips.length}</Badge> : null}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-96 max-w-(--available-width) max-h-(--available-height) overflow-y-auto">
          <PopoverTitle>{title}</PopoverTitle>
          <PopoverDescription>Combine filtros. Los resultados se actualizan al instante.</PopoverDescription>
          {children}
          <p role="status" className="text-sm text-muted-foreground tabular-nums">{count}</p>
          <Button variant="ghost" onClick={onClear} disabled={!chips.length}>
            <ArrowCounterClockwiseIcon aria-hidden="true" data-icon="inline-start" />Limpiar todos
          </Button>
        </PopoverContent>
      </Popover>
      {chips.length ? <Button variant="ghost" className="min-h-10" onClick={onClear}>
        <ArrowCounterClockwiseIcon aria-hidden="true" data-icon="inline-start" />Limpiar
      </Button> : null}
    </div>
    {chips.length ? <ul aria-label="Filtros activos" className="flex min-w-0 flex-wrap gap-2">
      {chips.map(chip => <li key={chip.key} className="max-w-full">
        <Button variant="outline" className="h-auto min-h-10 max-w-full whitespace-normal text-left" onClick={() => onRemove(chip.key)} aria-label={`Quitar filtro ${chip.label}`}>
          <span className="min-w-0 wrap-anywhere">{chip.label}</span><XIcon aria-hidden="true" data-icon="inline-end" />
        </Button>
      </li>)}
    </ul> : null}
  </section>;
}
