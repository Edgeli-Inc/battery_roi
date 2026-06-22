'use client';

import { CMP_RATES, DEFAULTS } from '@/lib/constants';
import type { InputParams } from '@/lib/types';
import ControlRow from './ControlRow';
import Section from './Section';

interface Props {
  params: InputParams;
  update: (patch: Partial<InputParams>) => void;
}

export default function RateInputs({ params, update }: Props) {
  const resetRates = () =>
    update({
      touOnPeak: CMP_RATES.touOnPeakAllIn,
      touOffPeak: CMP_RATES.touOffPeakAllIn,
      rateA: CMP_RATES.rateAAllIn,
      rateEscalation: DEFAULTS.rateEscalation,
    });

  const spread = params.touOnPeak - params.touOffPeak;

  return (
    <Section
      title="Rates (advanced)"
      collapsible
      defaultOpen={false}
      action={
        <button
          type="button"
          onClick={resetRates}
          className="text-xs font-medium text-brand hover:underline"
        >
          Reset to CMP defaults
        </button>
      }
    >
      <ControlRow
        label="All-in on-peak rate"
        value={params.touOnPeak}
        onChange={(v) => update({ touOnPeak: v })}
        min={0.3}
        max={1.0}
        step={0.001}
        prefix="$"
        unit="/kWh"
        tooltip="CMP Rate TOU delivery + Standard Offer supply, effective Jan 1 2026."
      />
      <ControlRow
        label="All-in off-peak rate"
        value={params.touOffPeak}
        onChange={(v) => update({ touOffPeak: v })}
        min={0.05}
        max={0.4}
        step={0.001}
        prefix="$"
        unit="/kWh"
        tooltip="The overnight recharge cost is embedded here — the on-peak minus off-peak spread is the complete net benefit per kWh cycled."
      />
      <ControlRow
        label="Annual rate escalation"
        value={params.rateEscalation}
        onChange={(v) => update({ rateEscalation: v })}
        min={0}
        max={8}
        step={0.5}
        unit="%/yr"
        tooltip="Applied to TOU arbitrage value only. The VPP payment is contractually fixed and does not escalate."
      />
      <p className="pt-2 text-xs text-slate-500">
        Current arbitrage spread:{' '}
        <span className="font-semibold tabular-nums text-slate-700">
          ${spread.toFixed(4)}/kWh
        </span>
      </p>
    </Section>
  );
}
