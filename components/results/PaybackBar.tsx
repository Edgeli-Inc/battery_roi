'use client';

import { MODEL } from '@/lib/constants';
import type { RoiSummary } from '@/lib/types';

interface Props {
  summary: RoiSummary;
}

/** Color thresholds per spec §4.3: green ≤8 yrs, amber 9–12, red >12. */
function tone(year: number | null): { bar: string; text: string; label: string } {
  if (year === null) return { bar: 'bg-rose-500', text: 'text-rose-600', label: 'No payback within 15 yrs' };
  if (year <= 8) return { bar: 'bg-emerald-500', text: 'text-emerald-600', label: 'Strong' };
  if (year <= 12) return { bar: 'bg-amber-500', text: 'text-amber-600', label: 'Moderate' };
  return { bar: 'bg-rose-500', text: 'text-rose-600', label: 'Weak' };
}

export default function PaybackBar({ summary }: Props) {
  const { paybackYear } = summary;
  const t = tone(paybackYear);
  const max = MODEL.modelYears;
  const pct = paybackYear ? Math.min(100, (paybackYear / max) * 100) : 100;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Payback timeline</h3>
        <span className={`text-sm font-semibold ${t.text}`}>
          {paybackYear ? `Year ${paybackYear} · ${t.label}` : t.label}
        </span>
      </div>
      <div className="relative h-4 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${t.bar} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-slate-400 tabular-nums">
        {Array.from({ length: max + 1 }, (_, i) => i).map((y) =>
          y % 5 === 0 ? <span key={y}>{y}</span> : <span key={y} />
        )}
      </div>
    </div>
  );
}
