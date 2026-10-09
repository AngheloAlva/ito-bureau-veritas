'use client';

import { useId, useState } from 'react';
import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem } from '@/components/ui/select';
import { useFieldError, validationAttributes } from './validated-form';

export type SelectOption = { value: string; label: string };
export function SelectField({ name, label, options, value, defaultValue, onValueChange, required = false, placeholder, description }: {
  name: string; label: string; options: SelectOption[]; value?: string; defaultValue?: string;
  onValueChange?: (value: string) => void; required?: boolean; placeholder?: string; description?: string;
}) {
  const id = useId();
  const [internal, setInternal] = useState(defaultValue ?? '');
  const selected = value ?? internal;
  const error = useFieldError(name);
  // Optional filters use their empty entry to reset; required fields cannot select it.
  const items = [{ value: null, label: placeholder ?? 'Seleccione una opción' }, ...options];
  const describedBy = [description && `${id}-description`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  return <Field className="w-full min-w-0" data-invalid={Boolean(error)}>
    <FieldLabel htmlFor={id}>{label}{required ? ' *' : ''}</FieldLabel>
    <Select items={items} value={options.some(option => option.value === selected) ? selected : null} onValueChange={next => {
      const text = next ?? '';
      setInternal(text);
      onValueChange?.(text);
    }}>
      <SelectTrigger id={id} className="w-full min-w-0 max-w-full" aria-required={required} aria-invalid={Boolean(error)} aria-describedby={describedBy}
        {...validationAttributes(name, label, required)} data-value={selected}>
        <SelectValue className="min-w-0 truncate" />
      </SelectTrigger>
      <SelectContent><SelectGroup>
        {!required && placeholder !== undefined && !options.some(option => option.value === '') ? <SelectItem value={null}>{placeholder}</SelectItem> : null}
        {options.map(option => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}
      </SelectGroup></SelectContent>
    </Select>
    <input type="hidden" name={name} value={selected} />
    {description ? <FieldDescription id={`${id}-description`}>{description}</FieldDescription> : null}
    {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
  </Field>;
}
