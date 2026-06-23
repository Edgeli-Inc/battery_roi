'use client';

import {
  HEATING_FUELS,
  HEATING_FUEL_LABELS,
  HOME_TYPES,
} from '@/lib/loadProfile';
import type { HeatingFuel, HomeType, InputParams } from '@/lib/types';
import ControlRow from './ControlRow';
import Section from './Section';
import SelectRow from './SelectRow';

interface Props {
  params: InputParams;
  update: (patch: Partial<InputParams>) => void;
}

export default function HomeInputs({ params, update }: Props) {
  return (
    <Section title="Home energy consumption">
      <SelectRow
        label="Type"
        value={params.homeType}
        onChange={(v) => update({ homeType: v as HomeType })}
        options={HOME_TYPES.map((t) => ({ value: t, label: t }))}
        tooltip="Building type, per NREL ResStock categories. Drives the modeled electric load shape for your home."
      />
      <ControlRow
        label="Square footage"
        value={params.sqft}
        onChange={(v) => update({ sqft: v })}
        min={300}
        max={7500}
        step={50}
        unit="ft²"
        tooltip="Conditioned floor area. Binned to NREL ResStock size bands (0–1499, 1500–2499, 2500–3999, 4000+)."
      />
      <ControlRow
        label="Year built"
        value={params.yearBuilt}
        onChange={(v) => update({ yearBuilt: v })}
        min={1900}
        max={2025}
        step={1}
        tooltip="Construction year, binned to a ResStock vintage band (pre-1940 through 2010s). Older homes draw more for heating/cooling."
      />
      <SelectRow
        label="Heating source"
        value={params.heatingFuel}
        onChange={(v) => update({ heatingFuel: v as HeatingFuel })}
        options={HEATING_FUELS.map((f) => ({
          value: f,
          label: HEATING_FUEL_LABELS[f],
        }))}
        tooltip="Primary heating fuel. Electric heat dominates the 5–9 PM winter electric load a battery can offset; fossil-heated homes draw far less."
      />
      <div className="flex items-center justify-between pt-3 text-sm">
        <span className="flex items-center gap-1.5 font-medium text-slate-700">
          Estimated 5–9 PM load
        </span>
        <span className="font-semibold tabular-nums text-brand">
          {params.homePeakLoad.toFixed(2)} kW
        </span>
      </div>
      <p className="pt-1 text-xs text-slate-500">
        Derived from NREL ResStock 2024 (Maine) for your home profile. Caps the
        kWh that earn TOU arbitrage — the battery can&apos;t offset more than the
        home draws.
      </p>
    </Section>
  );
}
