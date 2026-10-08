import type { SVGProps } from 'react';
import { B, L, LAV, SKY, Svg } from './shared';

type Props = SVGProps<SVGSVGElement>;

export function PumpStationIllustration(props: Props) {
  return (
    <Svg viewBox="0 0 320 160" {...props}>
      <g stroke={LAV} {...L}>
        <path d="M16 134H304" {...L} />
        {[40, 80, 120, 160, 200, 240, 280].map(x => <path key={x} d={`M${x} 134v4`} {...L} />)}
      </g>
      <g stroke={B} {...L}>
        {/* base plate and motor */}
        <path d="M48 134V124H176V134" {...L} />
        <rect x="56" y="82" width="62" height="42" rx="2" fill={B} fillOpacity=".06" {...L} />
        <path d="M66 82v42M76 82v42M86 82v42M96 82v42M106 82v42" {...L} />
        {/* pump casing */}
        <path d="M118 104H132" {...L} />
        <circle cx="156" cy="102" r="22" fill={B} fillOpacity=".06" {...L} />
        <circle cx="156" cy="102" r="9" {...L} />
        <path d="M156 93v18M147 102h18" stroke={SKY} {...L} />
        {/* discharge and suction pipes */}
        <path d="M156 80V50H252V40M178 112H252V134" {...L} />
        <path d="M148 50V30h16M244 40h16" {...L} />
        <path d="M252 134H292V108H252" {...L} />
        {/* valve */}
        <path d="M236 50l16 10v-20z" fill={B} fillOpacity=".06" {...L} />
        <path d="M252 40V26M244 26h16" {...L} />
        <path d="M20 108H48V86H20" {...L} />
      </g>
      <g stroke={SKY} {...L}>
        <path d="M262 76h26M282 70l6 6-6 6" {...L} />
        <path d="M52 62H122M52 58v8M122 58v8" {...L} />
      </g>
      <text x="87" y="56" textAnchor="middle" fontSize="7" fill={B} stroke="none" fontFamily="var(--font-mono, monospace)">M-01</text>
    </Svg>
  );
}

export function ServiceGalleryIllustration(props: Props) {
  return (
    <Svg viewBox="0 0 320 160" {...props}>
      <g stroke={B} {...L}>
        {/* arched gallery section */}
        <path d="M70 140V70a90 56 0 0 1 180 0V140" {...L} />
        <path d="M86 140V72a74 46 0 0 1 148 0V140" stroke={LAV} {...L} />
        <path d="M54 140H266" {...L} />
        {/* ground hatching */}
        {[58, 72, 86, 100, 114, 128, 142, 156, 170, 184, 198, 212, 226, 240, 254].map(x => <path key={x} d={`M${x} 140l-6 8`} stroke={LAV} {...L} />)}
        {/* cable trays on bracket supports */}
        <path d="M86 78H134M86 98H134M186 78H234M186 98H234" {...L} />
        <path d="M110 78v20M210 78v20" {...L} />
        <path d="M86 78v24M234 78v24" stroke={LAV} {...L} />
        {[92, 102, 112, 122].map(x => <path key={x} d={`M${x} 98v-6`} stroke={SKY} {...L} />)}
        <rect x="92" y="68" width="36" height="10" rx="1" fill={B} fillOpacity=".06" {...L} />
        <rect x="192" y="68" width="36" height="10" rx="1" fill={B} fillOpacity=".06" {...L} />
        {/* floor duct */}
        <path d="M140 140V124H180V140" {...L} />
      </g>
      <g stroke={SKY} {...L}>
        <path d="M70 154H250M70 150v8M250 150v8" {...L} />
        <path d="M262 70V140M258 70h8M258 140h8" {...L} />
      </g>
      <text x="160" y="152" textAnchor="middle" fontSize="7" fill={B} stroke="none" fontFamily="var(--font-mono, monospace)">GAL-O</text>
    </Svg>
  );
}

export function WaterPipelineIllustration(props: Props) {
  return (
    <Svg viewBox="0 0 320 160" {...props}>
      <g stroke={B} {...L}>
        {/* pipe run with a rise */}
        <path d="M12 76H110V50H214V76H308M12 100H122V74H202V100H308" {...L} />
        {/* flanges */}
        {[64, 122, 202, 262].map(x => <path key={x} d={`M${x} 68v40`} {...L} />)}
        {[110, 214].map(x => <path key={x} d={`M${x} 44v38`} {...L} />)}
        {/* supports */}
        <path d="M40 100v30M30 130h20M160 74v56M150 130h20M290 100v30M280 130h20" {...L} />
        {/* gate valve */}
        <path d="M232 64l12 12v-24z M256 64l-12 12v-24z" fill={B} fillOpacity=".06" {...L} />
      </g>
      <g stroke={LAV} {...L}>
        <path d="M10 134H310" {...L} />
        {[20, 70, 120, 170, 220, 270].map(x => <path key={x} d={`M${x} 134v5`} {...L} />)}
      </g>
      <g stroke={SKY} {...L}>
        <path d="M24 88H92M84 83l8 5-8 5" {...L} />
        <path d="M220 88H292M284 83l8 5-8 5" {...L} />
        <path d="M110 26H214M110 22v8M214 22v8" {...L} />
      </g>
      <text x="162" y="22" textAnchor="middle" fontSize="7" fill={B} stroke="none" fontFamily="var(--font-mono, monospace)">DN 300</text>
    </Svg>
  );
}

const bySpecialty: Record<string, (p: Props) => React.JSX.Element> = { Mecánica: PumpStationIllustration, Civil: ServiceGalleryIllustration, Hidráulica: WaterPipelineIllustration };
const byId: Record<string, (p: Props) => React.JSX.Element> = { p1: PumpStationIllustration, p2: ServiceGalleryIllustration, p3: WaterPipelineIllustration };

export function ProjectIllustration({ projectId, specialty, ...props }: Props & { projectId?: string; specialty?: string }) {
  const Component = (projectId && Object.hasOwn(byId, projectId) ? byId[projectId] : undefined) || (specialty && Object.hasOwn(bySpecialty, specialty) ? bySpecialty[specialty] : undefined) || PumpStationIllustration;
  return <Component {...props} />;
}
