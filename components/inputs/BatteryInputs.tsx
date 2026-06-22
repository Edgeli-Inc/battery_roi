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
        tooltip="Average kW discharged across VPP events. Drives the VPP payment (uncapped — can export beyond home load). Tesla's example is 3.6 kW."
      />
      <ControlRow
        label="Home peak load (5–9 PM)"
        value={params.homePeakLoad}
        onChange={(v) => update({ homePeakLoad: v })}
        min={1.0}
        max={11.5}
        step={0.1}
        unit="kW"
        tooltip="Home load served during the on-peak window. Caps the kWh that earn TOU arbitrage (you can't offset more than you draw)."
      />
      <ControlRow
        label="Annual degradation"
        value={params.degradationPct}
        onChange={(v) => update({ degradationPct: v })}
        min={0.5}
        max={3.0}
        step={0.1}
        unit="%/yr"
        tooltip="Linear capacity loss applied to both VPP and TOU output each year. LFP cells degrade slowly; 1.5%/yr is typical."
      />
    </Section>
  );
}
