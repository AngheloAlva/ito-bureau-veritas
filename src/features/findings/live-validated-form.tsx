'use client';

import { useLayoutEffect, useRef, type ComponentProps } from 'react';
import { ValidatedForm } from '@/components/shared/validated-form';

type Props = ComponentProps<typeof ValidatedForm> & { valid: boolean };

/**
 * ValidatedForm keeps its errors until the next submit. Remounting when the form turns valid
 * (and back) clears stale "campo obligatorio" messages; focus and caret are restored.
 */
export function LiveValidatedForm({ valid, ...props }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const last = useRef<{ name: string; start: number | null; end: number | null } | null>(null);
  function remember() {
    const el = document.activeElement as HTMLInputElement | null;
    const name = el?.dataset?.validationName;
    if (el && name && root.current?.contains(el)) last.current = { name, start: el.selectionStart ?? null, end: el.selectionEnd ?? null };
  }
  useLayoutEffect(() => {
    const saved = last.current;
    if (!saved || document.activeElement !== document.body) return;
    const el = root.current?.querySelector<HTMLInputElement>(`[data-validation-name="${saved.name}"]`);
    el?.focus();
    if (el && saved.start !== null && saved.end !== null) try { el.setSelectionRange(saved.start, saved.end); } catch { /* not a text control */ }
  }, [valid]);
  return <div ref={root} className="w-full min-w-0" onInputCapture={remember} onFocusCapture={remember} onKeyUpCapture={remember}>
    <ValidatedForm key={valid ? 'valid' : 'invalid'} {...props} />
  </div>;
}
