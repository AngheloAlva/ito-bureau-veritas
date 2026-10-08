import type { ReactNode, SVGProps } from 'react';

export const B = 'var(--brand-blue)';
export const SKY = 'var(--brand-sky)';
export const LAV = 'var(--brand-lavender)';

export function Svg({ viewBox, children, ...props }: SVGProps<SVGSVGElement> & { viewBox: string; children: ReactNode }) {
  return (
    <svg viewBox={viewBox} fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" {...props}>
      {children}
    </svg>
  );
}

/** Stroke props shared by every path so lines stay crisp at any scale. */
export const L = { vectorEffect: 'non-scaling-stroke' as const };
