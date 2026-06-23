'use client';

import InfoTip from '@/components/ui/InfoTip';
import { fmtUSD, fmtUSDSigned, fmtYears } from '@/lib/format';
import type { RoiSummary, Year1Breakdown } from '@/lib/types';

interface Props {
  summary: RoiSummary;
  breakdown: Year1Breakdown;
}

function Card({
  label,
  value,
  hint,
  info,
  tone = 'default',
}: {
  label: string;
  value: string;
  hint?: string;
  info: string;
  tone?: 'default' | 'positive' | 'negative' | 'brand';
}) {
  const toneCls = {
    default: 'text-slate-900',
    positive: 'text-emerald-600',
    negative: 'text-rose-600',
    brand: 'text-brand',
  }[tone];
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
        <InfoTip label={label} text={info} />
      </p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${toneCls}`}>{value}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export default function MetricCards({ summary, breakdown }: Props) {
  const touYear1 =
    breakdown.touDuringVppEvents +
    breakdown.touResidualHour +
    breakdown.touNonEventDays;

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      <Card
        label="VPP payment (yr 1)"
        value={fmtUSD(breakdown.vppPayment)}
        hint="Cash from Tesla"
        info="Year-1 cash Tesla pays you: avg VPP discharge (kW) × pass-through rate ($/kW-yr). Fixed for the 10-year program term."
        tone="brand"
      />
      <Card
        label="TOU savings (yr 1)"
        value={fmtUSD(touYear1)}
        hint="Bill arbitrage"
        info="Year-1 bill savings from discharging during the 5–9 PM weekday peak, valued at the on-peak minus off-peak rate spread (recharge cost already netted out)."
        tone="brand"
      />
      <Card
        label="Total year 1 value"
        value={fmtUSD(summary.year1Value)}
        hint="VPP + TOU combined"
        info="VPP payment plus TOU savings in the first year, before degradation and rate escalation are applied in later years."
      />
      <Card
        label="Simple payback"
        value={fmtYears(summary.simplePayback)}
        hint={
          summary.paybackYear
            ? `Net positive in year ${summary.paybackYear}`
            : 'Never recovers cost'
        }
        info="Years until cumulative value covers the net install cost (installed cost minus rebates). No discounting applied."
      />
      <Card
        label="10-year net"
        value={fmtUSDSigned(summary.net10)}
        hint="After install cost"
        info="Cumulative value through year 10 minus net install cost. VPP payments stop after year 10."
        tone={summary.net10 >= 0 ? 'positive' : 'negative'}
      />
      <Card
        label="15-year net"
        value={fmtUSDSigned(summary.net15)}
        hint="Full model horizon"
        info="Cumulative value over the full 15-year horizon minus net install cost. Years 11–15 are TOU-only (no VPP)."
        tone={summary.net15 >= 0 ? 'positive' : 'negative'}
      />
    </div>
  );
}
