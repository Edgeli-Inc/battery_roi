'use client';

import type { InputParams } from '@/lib/types';
import ControlRow from './ControlRow';
import Section from './Section';

interface Props {
  params: InputParams;
  update: (patch: Partial<InputParams>) => void;
}

export default function CostInputs({ params, update }: Props) {
  return (
    <Section title="Cost">
      <ControlRow
        label="Installed cost"
        value={params.installedCost}
        onChange={(v) => update({ installedCost: v })}
        min={10000}
        max={20000}
        step={500}
        prefix="$"
        tooltip="Turnkey install for a single Powerwall 3 in New England (2026). New construction trends to the low end."
      />
      <ControlRow
        label="Rebates / incentives"
        value={params.rebate}
        onChange={(v) => update({ rebate: v })}
        min={0}
        max={5000}
        step={250}
        prefix="$"
        tooltip="No Maine state battery rebate exists today; the federal 30% ITC expired Dec 31 2025. Enter any future incentive manually."
      />
    </Section>
  );
}
