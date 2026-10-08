import type { Metadata } from 'next';
import { Suspense } from 'react';
import { GeistSans } from 'geist/font/sans';
import { DemoProvider } from '@/components/demo-provider';
import { Shell } from '@/components/shell';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AnalysisStore } from '@/features/analysis';
import { cn } from '@/lib/utils';
import './globals.css';

export const metadata: Metadata = {
  title: 'ITO | Gestión de inspecciones',
  description: 'Demostración con datos ficticios de inspecciones, correcciones y análisis simulado.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={cn('font-sans', GeistSans.variable)}>
      <body>
        <TooltipProvider>
          <DemoProvider>
            <AnalysisStore>
              <Suspense fallback={<p role="status">Cargando registros…</p>}>
                <Shell>{children}</Shell>
              </Suspense>
            </AnalysisStore>
          </DemoProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
