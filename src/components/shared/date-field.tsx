'use client';

import { useId, useState } from 'react';
import { es } from 'date-fns/locale/es';
import { CalendarIcon } from '@phosphor-icons/react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent, PopoverTitle, PopoverDescription } from '@/components/ui/popover';
import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field';
import { calendarLabel, parseCalendarDate, serializeCalendarDate } from '@/lib/date-fields';
import { useFieldError, validationAttributes } from './validated-form';

export function DateField({ name, label, value, defaultValue = '', onValueChange, required = false, description }: {
  name: string; label: string; value?: string; defaultValue?: string;
  onValueChange?: (value: string) => void; required?: boolean; description?: string;
}) {
  const id = useId();
  const [internal, setInternal] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const selected = value ?? internal;
  const parsed = parseCalendarDate(selected);
  const error = useFieldError(name);
  function change(next: string) { setInternal(next); onValueChange?.(next); setOpen(false); }
  const describedBy = [`${id}-help`, error && `${id}-error`].filter(Boolean).join(' ');
  return <Field data-invalid={Boolean(error)}>
    <FieldLabel htmlFor={id}>{label}{required ? ' *' : ''}</FieldLabel>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button type="button" variant="outline" className="h-10 w-full justify-start rounded-lg bg-card px-3 text-sm font-normal shadow-xs focus-visible:ring-2 focus-visible:ring-ring/30 aria-invalid:border-destructive" />}
        id={id} aria-required={required} aria-invalid={Boolean(error)} aria-describedby={describedBy}
        {...validationAttributes(name, label, required)} data-date="true" data-value={selected}>
        <CalendarIcon aria-hidden="true" data-icon="inline-start" />{calendarLabel(selected)}
      </PopoverTrigger>
      <PopoverContent className="w-72 max-w-(--available-width) wrap-break-word" align="start">
        <PopoverTitle>{label}</PopoverTitle>
        <PopoverDescription>Seleccione un día. Use las flechas para recorrer el calendario.</PopoverDescription>
        <Calendar mode="single" locale={es} captionLayout="label" selected={parsed} defaultMonth={parsed} autoFocus
          labels={{
            labelPrevious: () => 'Mes anterior', labelNext: () => 'Mes siguiente',
            labelNav: () => 'Navegación del calendario', labelMonthDropdown: () => 'Mes', labelYearDropdown: () => 'Año',
            labelGrid: date => date.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' }),
            labelDayButton: (date, modifiers) => [date.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), modifiers.today && 'hoy', modifiers.selected && 'seleccionado'].filter(Boolean).join(', '),
          }}
          onSelect={date => change(serializeCalendarDate(date))} />
        <Button type="button" variant="ghost" onClick={() => change('')}>Borrar fecha</Button>
      </PopoverContent>
    </Popover>
    <input type="hidden" name={name} value={selected} />
    <FieldDescription id={`${id}-help`}>{description ?? 'Fecha de calendario; no incluye hora.'}</FieldDescription>
    {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
  </Field>;
}
