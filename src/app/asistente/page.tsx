import { redirect } from 'next/navigation';

type Params = Promise<Record<string, string | string[] | undefined>>;

// Legacy route: the assistant now lives in /analisis. Preserve the scope param.
export default async function Page({ searchParams }: { searchParams: Params }) {
  const params = await searchParams;
  const raw = params.alcance ?? params.project;
  const scope = Array.isArray(raw) ? raw[0] : raw;
  if (scope === undefined) redirect('/analisis');
  redirect(`/analisis?project=${encodeURIComponent(scope || 'all')}`);
}
