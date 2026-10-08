import Link from 'next/link';
import { Empty, Panel } from '@/components/records/presentation';
import { Progress, type ProgressTone } from '@/components/ui/progress';

export function Distribution({ title, counts, total, href, label = key => key, tone = () => 'neutral' }: { title: string; counts: Record<string, number>; total: number; href: (key: string) => string; label?: (key: string) => string; tone?: (key: string) => ProgressTone }) {
  return (
    <Panel title={title} description={`${total} hallazgos registrados · distribución actual, no tendencia`}>
      {total ? <ul className="flex flex-col gap-3">
        {Object.entries(counts).map(([key, count]) => (
          <li key={key} className="flex flex-col gap-2">
            <Link href={href(key)} className="record-link flex min-h-10 items-center justify-between gap-4 text-sm"><span>{label(key)}</span><span className="tabular-nums">{count}</span></Link>
            <Progress tone={tone(key)} value={total ? count / total * 100 : 0} aria-label={`${label(key)}: ${count} de ${total} hallazgos`} />
          </li>
        ))}
      </ul> : <Empty>Sin hallazgos en este alcance.</Empty>}
    </Panel>
  );
}
