import { parseCalendarDate } from './date-fields.ts';

export function formValue(form: FormData, key: string): string {
  return String(form.get(key) ?? '').trim();
}

export type FieldRule = {
  name: string;
  label: string;
  required?: boolean;
  date?: boolean;
  checkbox?: boolean;
};
export type FieldErrors = Record<string, string>;

/** Explicit checks also cover Base Select's hidden input and date triggers. */
export function validateFields(values: Record<string, unknown>, rules: readonly FieldRule[]): FieldErrors {
  const errors: FieldErrors = {};
  for (const rule of rules) {
    const value = values[rule.name];
    const text = typeof value === 'string' ? value.trim() : '';
    if (rule.required && (rule.checkbox ? value !== true : !text)) {
      errors[rule.name] = rule.checkbox ? 'Confirme para continuar.' : `${rule.label}: campo obligatorio.`;
    } else if (rule.date && text && !parseCalendarDate(text)) {
      errors[rule.name] = `${rule.label}: seleccione una fecha válida.`;
    }
  }
  return errors;
}
