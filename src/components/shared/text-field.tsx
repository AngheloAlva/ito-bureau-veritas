'use client';

import { useId, type ComponentProps } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field';
import { useFieldError, validationAttributes } from './validated-form';

type Props = ComponentProps<'input'> & { name: string; label: string; description?: string; multiline?: boolean; rows?: number };
export function TextField({ label, description, multiline, rows = 3, ...props }: Props) {
  const id = useId();
  const error = useFieldError(props.name);
  const attributes = { ...props, id, 'aria-invalid': Boolean(error),
    'aria-describedby': [description && `${id}-help`, error && `${id}-error`].filter(Boolean).join(' ') || undefined,
    ...validationAttributes(props.name, label, props.required),
  };
  return <Field data-invalid={Boolean(error)}>
    <FieldLabel htmlFor={id}>{label}{props.required ? ' *' : ''}</FieldLabel>
    {multiline ? <Textarea {...attributes as ComponentProps<typeof Textarea>} rows={rows} /> : <Input {...attributes} />}
    {description ? <FieldDescription id={`${id}-help`}>{description}</FieldDescription> : null}
    {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
  </Field>;
}
