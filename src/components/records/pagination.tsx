'use client';

import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { pageWindow, type Page } from '@/lib/paginate';
import { cn } from 'cn';

const btn = 'inline-flex h-8 min-w-8 items-center justify-center rounded-sm border border-transparent px-2 font-mono text-xs tabular-nums text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40';

/** Footer with range summary and compact page controls. Hidden when everything fits one page. */
export function Pagination({ page, onPageChange, label = 'registros' }: { page: Page<unknown>; onPageChange: (page: number) => void; label?: string }) {
  if (page.pageCount <= 1) return null;
  return <div className="flex flex-wrap items-center justify-between gap-2 pt-3">
    <p role="status" className="text-xs text-muted-foreground tabular-nums">Mostrando {page.from}–{page.to} de {page.total} {label}</p>
    <nav aria-label="Paginación"><ul className="flex items-center gap-1">
      <li><button type="button" className={btn} disabled={page.page <= 1} onClick={() => onPageChange(page.page - 1)} aria-label="Página anterior"><CaretLeftIcon aria-hidden="true" /></button></li>
      {pageWindow(page.page, page.pageCount).map((n, i) => <li key={`${n}-${i}`}>{n === '…'
        ? <span aria-hidden="true" className="px-1 text-xs text-muted-foreground">…</span>
        : <button type="button" className={cn(btn, n === page.page && 'bg-(--brand-blue) text-white hover:bg-(--brand-blue)')} aria-current={n === page.page ? 'page' : undefined} aria-label={`Página ${n}`} onClick={() => onPageChange(n)}>{n}</button>}</li>)}
      <li><button type="button" className={btn} disabled={page.page >= page.pageCount} onClick={() => onPageChange(page.page + 1)} aria-label="Página siguiente"><CaretRightIcon aria-hidden="true" /></button></li>
    </ul></nav>
  </div>;
}
