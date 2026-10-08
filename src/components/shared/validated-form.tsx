'use client';

import { createContext, useContext, useState, type ComponentProps, type SubmitEvent } from 'react';
import { cn } from 'cn';
import { FieldError } from '@/components/ui/field';
import { validateFields, type FieldErrors, type FieldRule } from '@/lib/form-validation';

const ValidationContext = createContext<FieldErrors>({});
export function useFieldError(name: string) { return useContext(ValidationContext)[name]; }

/** Validate visible controls, not the constraint-ineligible hidden serialization inputs. */
export function ValidatedForm({ children, onSubmit, className, ...props }: ComponentProps<'form'>) {
  const [errors, setErrors] = useState<FieldErrors>({});
  function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const controls = Array.from(form.querySelectorAll<HTMLElement>('[data-validation-name]'));
    const rules: FieldRule[] = controls.map(control => ({
      name: control.dataset.validationName!,
      label: control.dataset.validationLabel!,
      required: control.dataset.required === 'true',
      date: control.dataset.date === 'true',
      checkbox: control.dataset.checkbox === 'true',
    }));
    const values = Object.fromEntries(controls.map(control => [control.dataset.validationName!,
      control.dataset.checkbox === 'true' ? control.dataset.value === 'true' :
        control.dataset.value !== undefined ? control.dataset.value :
          'value' in control ? (control as HTMLInputElement).value : '',
    ]));
    const next = validateFields(values, rules);
    setErrors(next);
    const first = controls.find(control => next[control.dataset.validationName!]);
    if (first) { first.focus(); return; }
    onSubmit?.(event);
  }
  return <ValidationContext.Provider value={errors}>
    <form {...props} className={cn('w-full min-w-0', className)} noValidate onSubmit={submit}>
      {children}
    </form>
  </ValidationContext.Provider>;
}

export function FormError({ message }: { message: string }) {
  return message ? <FieldError role="alert" tabIndex={-1} ref={node => { node?.focus(); }}>{message}</FieldError> : null;
}

export function validationAttributes(name: string, label: string, required = false) {
  return { 'data-validation-name': name, 'data-validation-label': label, 'data-required': String(required) };
}
