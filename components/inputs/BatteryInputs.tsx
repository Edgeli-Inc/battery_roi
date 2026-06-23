'use client';

import type { InputParams } from '@/lib/types';
import ControlRow from './ControlRow';
import Section from './Section';

interface Props {
  params: InputParams;
  update: (patch: Partial<InputParams>) => void;
}

export default function BatteryInputs({ params, update }: Props) {
  return (
    <Section title="Battery performance">
      <ControlRow
        label="Avg. VPP discharge"
        value={params.avgVppDischarge}
        onChange={(v) => update({ avgVppDischarge: v })}
        min={1.0}
        max={11.5}
        step={0.1}
        unit="kW"
        tooltip="Average kW discharged across VPP events. Drives the VPP payment (uncapped — can export beyond home load). No EMT vendor publishes this, so the default uses Tesla's 3.6 kW example."
      />
    </Section>
  );
}
