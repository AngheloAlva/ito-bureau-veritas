'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { countUpFrame } from './overview-charts.ts';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Hydration-safe count-up: the first render (server and client) returns the final
 * value, so markup always matches. After mount, a layout effect rewinds to the start
 * before paint and animates with rAF. Reduced motion keeps the final value.
 */
export function useCountUp(target: number, duration = 700) {
  const [value, setValue] = useState(target);
  const from = useRef(0);
  const first = useRef(true);
  useIsoLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const start = first.current ? 0 : from.current;
    first.current = false;
    if (reduce || start === target) { from.current = target; setValue(target); return; }
    let frame = 0;
    const t0 = performance.now();
    setValue(start);
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / duration);
      const next = countUpFrame(start, target, p);
      from.current = next;
      setValue(next);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
}
