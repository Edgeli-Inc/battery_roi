'use client';

import { useState } from 'react';
import InfoTip from '@/components/ui/InfoTip';
import { fmtUSD, fmtUSDSigned } from '@/lib/format';
import type { RoiSummary } from '@/lib/types';

interface Props {
  summary: RoiSummary;
}

const COLUMNS: { label: string; info: string }[] = [
  {
    label: 'VPP',
    info: 'VPP cash that year (×0 after year 10), scaled down by battery degradation.',
  },
  {
    label: 'TOU',
    info: 'TOU arbitrage savings that year, after degradation and compounding rate escalation.',
  },
  { label: 'Total', info: 'VPP plus TOU value earned in that single year.' },
  {
    label: 'Cum. gross',
    info: 'Running sum of all value earned to date, before subtracting install cost.',
  },
  {
    label: 'Net position',
    info: 'Cumulative gross minus net install cost. Turns positive at payback.',
  },
];

export default function YearByYearTable({ summary }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-1.5 text-sm font-semibold text-slate-700"
      >
        <span className={`transition-transform ${open ? 'rotate-90' : ''}`}>›</span>
        Show annual detail
      </button>
      {open && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-right text-sm tabular-nums">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 text-left font-medium">Year</th>
                {COLUMNS.map((c) => (
                  <th key={c.label} className="py-2 font-medium">
                    <span className="inline-flex items-center justify-end gap-1">
                      {c.label}
                      <InfoTip label={c.label} text={c.info} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summary.annualResults.map((r) => {
                const isPayback = r.year === summary.paybackYear;
                return (
                  <tr
                    key={r.year}
                    className={`border-b border-slate-100 ${
                      isPayback ? 'bg-emerald-50 font-semibold' : ''
                    }`}
                  >
                    <td className="py-1.5 text-left">
                      {r.year}
                      {isPayback && (
                        <span className="ml-1 text-[10px] uppercase text-emerald-600">
                          payback
                        </span>
                      )}
                    </td>
                    <td className="py-1.5">{fmtUSD(r.vppPayment)}</td>
                    <td className="py-1.5">{fmtUSD(r.touValue)}</td>
                    <td className="py-1.5">{fmtUSD(r.totalValue)}</td>
                    <td className="py-1.5">{fmtUSD(r.cumulativeGross)}</td>
                    <td
                      className={`py-1.5 ${
                        r.cumulativeNet >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {fmtUSDSigned(r.cumulativeNet)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
