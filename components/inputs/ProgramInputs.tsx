'use client';

import type { InputParams } from '@/lib/types';
import ControlRow from './ControlRow';
import Section from './Section';

interface Props {
  params: InputParams;
  update: (patch: Partial<InputParams>) => void;
}

export default function ProgramInputs({ params, update }: Props) {
  return (
    <Section title="VPP program">
      <ControlRow
        label="VPP events per year"
        value={params.vppEvents}
        onChange={(v) => update({ vppEvents: v })}
        min={20}
        max={60}
        step={5}
        unit="events"
        tooltip="EMT may call up to 60 events/year (Apr 1–Mar 31); ~40 is typical. Each is a 3-hr weekday dispatch within 5–9 PM."
      />
      <ControlRow
        label="Tesla pass-through rate"
        value={params.passThrough}
        onChange={(v) => update({ passThrough: v })}
        min={100}
        max={200}
        step={10}
        prefix="$"
        unit="/kW"
        tooltip="Tesla passes through $160/kW-yr (80% of EMT's $200/kW). Fixed for the 10-year program term."
      />
      <ControlRow
        label="Weekdays per year"
        value={params.weekdays}
        onChange={(v) => update({ weekdays: v })}
        min={240}
        max={262}
        step={1}
        unit="days"
        tooltip="Weekdays eligible for TOU arbitrage. Roughly 250 after holidays. Weekends/holidays earn no on-peak spread."
      />
    </Section>
  );
}
