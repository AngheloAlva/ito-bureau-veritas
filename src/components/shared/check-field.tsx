'use client';

import { useId } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { useFieldError, validationAttributes } from './validated-form';

export function CheckField({ name, label, checked, onCheckedChange, required = false }: {
  name: string; label: string; checked: boolean; onCheckedChange: (value: boolean) => void; required?: boolean;
}) {
  const id = useId();
  const error = useFieldError(name);
  return <Field data-invalid={Boolean(error)}>
    <Field orientation="horizontal">
      <Checkbox id={id} checked={checked} onCheckedChange={next => onCheckedChange(next === true)}
        aria-required={required} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}
        {...validationAttributes(name, label, required)} data-checkbox="true" data-value={String(checked)} />
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
    </Field>
    {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
  </Field>;
}
