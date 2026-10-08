import type { SVGProps } from 'react';
import { B, L, LAV, SKY, Svg } from './shared';

type Props = SVGProps<SVGSVGElement>;

export function AnalysisIllustration(props: Props) {
  return (
    <Svg viewBox="0 0 240 200" {...props}>
      <g stroke={B} {...L}>
        <rect x="48" y="24" width="124" height="152" rx="3" fill={B} fillOpacity=".04" {...L} />
        <rect x="88" y="16" width="44" height="16" rx="2" fill="var(--background, #fff)" {...L} />
        <path d="M64 56H156M64 68H130" stroke={LAV} {...L} />
        {/* small drawing */}
        <rect x="64" y="84" width="92" height="50" rx="1" {...L} />
        <path d="M72 124V108H100V96H124V124M72 124H148" {...L} />
        <circle cx="136" cy="106" r="6" stroke={SKY} {...L} />
        <path d="M64 148H156M64 160H116" stroke={LAV} {...L} />
      </g>
      <g stroke={SKY} {...L}>
        <path className="analysis-scan-line" d="M56 100H164" {...L} />
      </g>
      {/* magnifier */}
      <g stroke={B} {...L}>
        <circle cx="160" cy="124" r="28" fill="var(--background, #fff)" fillOpacity=".7" {...L} />
        <circle cx="160" cy="124" r="21" stroke={SKY} {...L} />
        <path d="M180 144l28 28" strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
        <path d="M148 128l8-8 6 5 8-10" stroke={SKY} {...L} />
      </g>
    </Svg>
  );
}

export function EmptyRecordsIllustration(props: Props) {
  return (
    <Svg viewBox="0 0 160 120" {...props}>
      <g stroke={LAV} {...L}>
        <path d="M24 100H136M36 100v4M60 100v4M84 100v4M108 100v4M132 100v4" {...L} />
      </g>
      <g stroke={B} {...L}>
        <path d="M30 94V34h32l8 8h50v52z" fill={B} fillOpacity=".04" {...L} />
        <rect x="46" y="22" width="68" height="62" rx="2" fill="var(--background, #fff)" {...L} />
        <path d="M56 38H104M56 50H104M56 62H88" stroke={LAV} {...L} />
        <path d="M30 94l8-30h100l-8 30z" fill={B} fillOpacity=".06" {...L} />
      </g>
      <path d="M96 66l12 12M108 66L96 78" stroke={SKY} {...L} />
    </Svg>
  );
}

export function ClosedCheckIllustration(props: Props) {
  return (
    <Svg viewBox="0 0 160 120" {...props}>
      <g stroke={LAV} {...L}>
        <path d="M20 104H140M32 104v4M56 104v4M80 104v4M104 104v4M128 104v4" {...L} />
      </g>
      <g stroke={B} {...L}>
        <rect x="40" y="14" width="80" height="84" rx="2" fill={B} fillOpacity=".04" {...L} />
        <path d="M52 30H108M52 40H108M52 50H90" stroke={LAV} {...L} />
        <circle cx="96" cy="74" r="20" fill="var(--background, #fff)" {...L} />
        <circle cx="96" cy="74" r="15" stroke={SKY} strokeDasharray="2 2.5" {...L} />
        <path d="M87 74l6 6 11-13" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      </g>
    </Svg>
  );
}
