'use client';

import type { ComponentProps } from 'react';
import { Panel as RecordPanel } from './records/presentation';

// Stable imports for the inspection/finding workflows migrated in T3.
export { Heading, Badge, Empty, date, time } from './records/presentation';
export { FindingTable, InspectionTable } from './records/tables';
export { Assets } from './records/assets';
export { InspectionHistory } from './records/chronology';

export function Panel(props: ComponentProps<typeof RecordPanel>) {
  return <RecordPanel {...props} legacy={props.legacy ?? true} />;
}
