'use client';

import { useState } from 'react';
import { fmtUSD, fmtUSDSigned } from '@/lib/format';
import type { RoiSummary } from '@/lib/types';

interface Props {
  summary: RoiSummary;
}

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
                <th className="py-2 font-medium">VPP</th>
                <th className="py-2 font-medium">TOU</th>
                <th className="py-2 font-medium">Total</th>
                <th className="py-2 font-medium">Cum. gross</th>
                <th className="py-2 font-medium">Net position</th>
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
