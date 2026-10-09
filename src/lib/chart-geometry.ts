export type DonutSegment = { share: number; start: number; end: number; path: string };

const pt = (cx: number, cy: number, r: number, a: number) => [cx + r * Math.sin(a), cy - r * Math.cos(a)] as const;
const f = (n: number) => Number(n.toFixed(3));

/** Donut ring segments starting at 12 o'clock, clockwise. Zero values produce an empty path. */
export function donutSegments(values: number[], r = 80, thickness = 22, cx = 100, cy = 100, gap = 0.02): DonutSegment[] {
  const total = values.reduce((a, b) => a + b, 0);
  const ro = r, ri = r - thickness;
  let acc = 0;
  const nonZero = values.filter(v => v > 0).length;
  return values.map(v => {
    const share = total ? v / total : 0;
    const start = acc * Math.PI * 2;
    acc += share;
    const end = acc * Math.PI * 2;
    if (!share) return { share, start, end, path: '' };
    if (nonZero === 1) {
      const m = cy;
      return { share, start, end, path: `M${cx},${m - ro}A${ro},${ro} 0 1 1 ${cx},${m + ro}A${ro},${ro} 0 1 1 ${cx},${m - ro}ZM${cx},${m - ri}A${ri},${ri} 0 1 0 ${cx},${m + ri}A${ri},${ri} 0 1 0 ${cx},${m - ri}Z` };
    }
    const g = Math.min(gap, (end - start) / 3);
    const s = start + g / 2, e = end - g / 2;
    const [x1, y1] = pt(cx, cy, ro, s), [x2, y2] = pt(cx, cy, ro, e);
    const [x3, y3] = pt(cx, cy, ri, e), [x4, y4] = pt(cx, cy, ri, s);
    const large = e - s > Math.PI ? 1 : 0;
    return { share, start, end, path: `M${f(x1)},${f(y1)}A${ro},${ro} 0 ${large} 1 ${f(x2)},${f(y2)}L${f(x3)},${f(y3)}A${ri},${ri} 0 ${large} 0 ${f(x4)},${f(y4)}Z` };
  });
}

/** Polyline path; null points break the line. */
export function linePath(points: ([number, number] | null)[]): string {
  let out = '', pen = false;
  for (const p of points) {
    if (!p) { pen = false; continue; }
    out += `${pen ? 'L' : 'M'}${f(p[0])},${f(p[1])}`;
    pen = true;
  }
  return out;
}

export function niceMax(v: number): number {
  if (v <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 2, 2.5, 3, 4, 5, 8, 10]) if (m * pow >= v) return m * pow;
  return 10 * pow;
}
