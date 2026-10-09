import type { ReactNode } from 'react';

export const INK = '#1B2B44';

/** Shared gradients and filters, defined once. */
export function SiteDefs() {
  return (
    <defs>
      <linearGradient id="sm-steel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f4f8fc" /><stop offset="1" stopColor="#c3d0e0" /></linearGradient>
      <linearGradient id="sm-steel-side" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c9d6e6" /><stop offset="1" stopColor="#97a9c0" /></linearGradient>
      <linearGradient id="sm-steel-top" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#dbe5f1" /></linearGradient>
      <linearGradient id="sm-cyl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#b3c3d8" /><stop offset="0.28" stopColor="#f6f9fd" /><stop offset="0.7" stopColor="#d3deec" /><stop offset="1" stopColor="#9fb1c8" /></linearGradient>
      <linearGradient id="sm-motor" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#8aa3c4" /><stop offset="0.35" stopColor="#d6e3f3" /><stop offset="1" stopColor="#7d95b7" /></linearGradient>
      <linearGradient id="sm-copper" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#e3a686" /><stop offset="0.3" stopColor="#fbe3d3" /><stop offset="0.72" stopColor="#efbea1" /><stop offset="1" stopColor="#d58f6b" /></linearGradient>
      <linearGradient id="sm-copper-top" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff1e8" /><stop offset="1" stopColor="#f0c4a9" /></linearGradient>
      <linearGradient id="sm-water" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#9fe0d8" /><stop offset="1" stopColor="#3aaea3" /></linearGradient>
      <linearGradient id="sm-dark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a4d6b" /><stop offset="1" stopColor="#1B2B44" /></linearGradient>
      <radialGradient id="sm-dial" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#dfe8f3" /></radialGradient>
      <filter id="sm-card-shadow" x="-10%" y="-10%" width="120%" height="140%"><feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#1B2B44" floodOpacity="0.12" /></filter>
    </defs>
  );
}

const Shadow = ({ rx = 40 }: { rx?: number }) => <ellipse cx="0" cy="3" rx={rx} ry={rx / 5} fill="#1B2B44" opacity="0.14" />;
const stroke = { stroke: INK, strokeWidth: 1.4, strokeLinejoin: 'round' as const };

/** Three-quarter pump unit: skid, motor and volute. Origin: ground centre. */
export function PumpArt() {
  return (
    <g>
      <Shadow rx={46} />
      <polygon points="-38,-8 -30,-14 44,-14 36,-8" fill="url(#sm-steel-top)" {...stroke} />
      <rect x="-38" y="-8" width="74" height="8" fill="url(#sm-steel)" {...stroke} />
      <polygon points="36,-8 44,-14 44,-6 36,0" fill="url(#sm-steel-side)" {...stroke} />
      <rect x="-34" y="-50" width="44" height="36" rx="5" fill="url(#sm-motor)" {...stroke} />
      {[-42, -34, -26, -18].map(y => <line key={y} x1="-34" x2="10" y1={y} y2={y} stroke={INK} strokeOpacity="0.28" strokeWidth="1" />)}
      <ellipse cx="-12" cy="-50" rx="22" ry="5" fill="url(#sm-steel-top)" {...stroke} />
      <circle cx="24" cy="-30" r="17" fill="url(#sm-cyl)" {...stroke} />
      <circle cx="24" cy="-30" r="8" fill="url(#sm-steel-top)" {...stroke} />
      <circle cx="24" cy="-30" r="2.5" fill={INK} />
      <rect x="20" y="-62" width="8" height="18" fill="url(#sm-cyl)" {...stroke} />
      <rect x="17" y="-65" width="14" height="5" rx="1.5" fill="url(#sm-steel-top)" {...stroke} />
    </g>
  );
}

/** Cylindrical storage tank with ellipse top and bands. Origin: ground centre. */
export function TankArt() {
  const w = 38, h = 118;
  return (
    <g>
      <Shadow rx={48} />
      <path d={`M${-w} ${-h} V0 A${w} 9 0 0 0 ${w} 0 V${-h} Z`} fill="url(#sm-cyl)" {...stroke} />
      {[-30, -62, -92].map(y => <path key={y} d={`M${-w} ${y} A${w} 9 0 0 0 ${w} ${y}`} fill="none" stroke={INK} strokeOpacity="0.4" strokeWidth="1.2" />)}
      <ellipse cx="0" cy={-h} rx={w} ry="9" fill="url(#sm-steel-top)" {...stroke} />
      <ellipse cx="0" cy={-h} rx="12" ry="3" fill="none" stroke={INK} strokeOpacity="0.35" />
      <rect x="-3" y={-h - 14} width="6" height="8" fill="url(#sm-cyl)" {...stroke} />
      <line x1={w - 10} x2={w - 10} y1={-h + 8} y2="-6" stroke="#fff" strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

/** Gate valve on the pipe. Origin: pipe centre. */
export function ValveArt() {
  return (
    <g>
      <rect x="-12" y="-34" width="24" height="26" rx="2" fill="url(#sm-cyl)" {...stroke} />
      <rect x="-3" y="-52" width="6" height="20" fill="url(#sm-steel-side)" {...stroke} />
      <ellipse cx="0" cy="-54" rx="17" ry="5.5" fill="none" stroke="#c2652f" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="0" cy="-54" rx="17" ry="5.5" fill="none" stroke={INK} strokeWidth="1" opacity="0.5" />
      <rect x="-20" y="-16" width="40" height="32" rx="5" fill="url(#sm-steel)" {...stroke} />
      <rect x="-20" y="-16" width="6" height="32" rx="2" fill="url(#sm-steel-side)" {...stroke} />
      <rect x="14" y="-16" width="6" height="32" rx="2" fill="url(#sm-steel-side)" {...stroke} />
      <circle cx="0" cy="0" r="6" fill="url(#sm-steel-top)" {...stroke} />
    </g>
  );
}

/** Pressure gauge on a stem. Origin: stem base (pipe side). */
export function GaugeArt() {
  const ticks = Array.from({ length: 9 }, (_, i) => -120 + i * 30);
  return (
    <g>
      <rect x="-4" y="-64" width="8" height="64" fill="url(#sm-cyl)" {...stroke} />
      <circle cx="0" cy="-86" r="26" fill="url(#sm-dark)" {...stroke} />
      <circle cx="0" cy="-86" r="21" fill="url(#sm-dial)" stroke={INK} strokeOpacity="0.4" />
      {ticks.map(a => <line key={a} x1="0" y1="-104" x2="0" y2="-100" stroke={INK} strokeWidth="1.2" transform={`rotate(${a} 0 -86)`} />)}
      <path d="M-13 -78 A15 15 0 0 1 13 -78" fill="none" stroke="#0E8C7E" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
      <line x1="0" y1="-86" x2="9" y2="-96" stroke="#c0392b" strokeWidth="2" strokeLinecap="round" />
      <circle cx="0" cy="-86" r="2.6" fill={INK} />
    </g>
  );
}

/** Isometric service-gallery portal with cable trays. Origin: ground centre. */
export function GalleryArt() {
  return (
    <g>
      <Shadow rx={78} />
      <polygon points="-66,-92 -36,-112 68,-112 38,-92" fill="url(#sm-steel-top)" {...stroke} />
      <polygon points="38,-92 68,-112 68,-22 38,0" fill="url(#sm-steel-side)" {...stroke} />
      <rect x="-66" y="-92" width="104" height="92" fill="url(#sm-steel)" {...stroke} />
      <path d="M-46 0 V-44 A26 26 0 0 1 6 -44 V0 Z" fill="url(#sm-dark)" {...stroke} />
      <path d="M-38 0 V-42 A18 18 0 0 1 -2 -42 V0" fill="none" stroke="#fff" strokeOpacity="0.18" strokeWidth="2" />
      <line x1="-20" x2="-20" y1="-70" y2="-2" stroke="#fff" strokeOpacity="0.1" />
      {[-82, -76].map(y => <line key={y} x1="-66" x2="38" y1={y} y2={y} stroke="#c2652f" strokeWidth="2.4" strokeLinecap="round" />)}
      {[-50, -22, 6, 30].map(x => <line key={x} x1={x} x2={x} y1="-84" y2="-74" stroke={INK} strokeOpacity="0.5" strokeWidth="1.2" />)}
      <path d="M-30 -102 L48 -102" stroke="#c2652f" strokeWidth="2" strokeDasharray="6 4" opacity="0.7" />
      <rect x="-66" y="-12" width="104" height="12" fill="url(#sm-steel-side)" opacity="0.55" />
    </g>
  );
}

/** Concentrator plant: copper towers, stack and shed. Decorative. Origin: ground centre. */
export function PlantArt() {
  const tower = (x: number, w: number, h: number, key: string) => (
    <g key={key}>
      <path d={`M${x - w} ${-h} V0 A${w} ${w / 4} 0 0 0 ${x + w} 0 V${-h} Z`} fill="url(#sm-copper)" stroke="#9a5a37" strokeWidth="1.3" />
      {[0.3, 0.55, 0.8].map(f => <path key={f} d={`M${x - w} ${-h * f} A${w} ${w / 4} 0 0 0 ${x + w} ${-h * f}`} fill="none" stroke="#9a5a37" strokeOpacity="0.45" />)}
      <ellipse cx={x} cy={-h} rx={w} ry={w / 4} fill="url(#sm-copper-top)" stroke="#9a5a37" strokeWidth="1.3" />
    </g>
  );
  return (
    <g>
      <Shadow rx={70} />
      {tower(-34, 20, 148, 't1')}
      {tower(8, 26, 108, 't2')}
      {tower(54, 9, 196, 't3')}
      <rect x="-62" y="-36" width="124" height="36" rx="3" fill="url(#sm-steel)" {...stroke} />
      <polygon points="-62,-36 -50,-44 74,-44 62,-36" fill="url(#sm-steel-top)" {...stroke} />
      {[-44, -22, 0, 22, 44].map(x => <rect key={x} x={x - 5} y="-26" width="10" height="14" rx="1.5" fill="#fff" stroke={INK} strokeOpacity="0.4" />)}
    </g>
  );
}

/** Intake basin with water surface. Decorative. Origin: ground centre. */
export function BasinArt() {
  return (
    <g>
      <Shadow rx={56} />
      <path d="M-50 -26 V-6 A50 14 0 0 0 50 -6 V-26 Z" fill="url(#sm-steel-side)" {...stroke} />
      <ellipse cx="0" cy="-26" rx="50" ry="14" fill="url(#sm-steel-top)" {...stroke} />
      <ellipse cx="0" cy="-26" rx="42" ry="10.5" fill="url(#sm-water)" stroke={INK} strokeOpacity="0.4" />
      <path d="M-24 -26 q6 -3 12 0 t12 0 M2 -22 q6 -3 12 0 t12 0" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.4" strokeLinecap="round" />
    </g>
  );
}

export function Plate({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return <text x={x} y={y} textAnchor="middle" fontSize="11" fontWeight="700" letterSpacing="1.4" fill={INK} style={{ textTransform: 'uppercase' }}>{children}</text>;
}
