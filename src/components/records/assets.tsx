import type { Document, Evidence } from '@/domain/types';
import { ArrowSquareOutIcon } from '@phosphor-icons/react/dist/csr/ArrowSquareOut';
import { date, Empty, time } from './presentation';

export function Assets({ documents = [], evidence = [] }: { documents?: Document[]; evidence?: Evidence[] }) {
  if (!documents.length && !evidence.length) return <Empty>No hay documentos ni evidencias asociados.</Empty>;
  return (
    <ul data-slot="record-assets" className="flex flex-col divide-y">
      {documents.map(document => (
        <li key={document.id} className="flex flex-col gap-2 py-3 first:pt-0">
          <a className="record-link inline-flex items-center gap-2" href={document.reference} target="_blank" rel="noreferrer">{document.name}<ArrowSquareOutIcon aria-hidden="true" className="size-4" /><span className="sr-only">(abre en otra pestaña)</span></a>
          <p className="text-xs text-muted-foreground">{document.type} · {document.revision} · {date(document.date)}</p>
        </li>
      ))}
      {evidence.map(item => (
        <li key={item.id} className="flex flex-col gap-2 py-3 first:pt-0">
          <a className="record-link inline-flex items-center gap-2" href={item.reference} target="_blank" rel="noreferrer">{item.name}<ArrowSquareOutIcon aria-hidden="true" className="size-4" /><span className="sr-only">(abre en otra pestaña)</span></a>
          <p className="text-xs text-muted-foreground">{item.phase} · {time(item.addedAt)} · Evidencia de ejemplo, no archivo real de terreno</p>
        </li>
      ))}
    </ul>
  );
}
