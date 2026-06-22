'use client';

import { fmtUSD } from '@/lib/format';
import type { RoiSummary } from '@/lib/types';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface Props {
  summary: RoiSummary;
}

interface Point {
  year: number;
  net: number;
  gross: number;
}

export default function CumulativeChart({ summary }: Props) {
  // Prepend year 0: net starts at -netCost, gross at 0.
  const data: Point[] = [
    { year: 0, net: -summary.netCost, gross: 0 },
    ...summary.annualResults.map((r) => ({
      year: r.year,
      net: r.cumulativeNet,
      gross: r.cumulativeGross,
    })),
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">
        Cumulative position over 15 years
      </h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12, fill: '#64748b' }}
              label={{ value: 'Year', position: 'insideBottom', offset: -2, fontSize: 12, fill: '#94a3b8' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              width={48}
            />
            <Tooltip
              formatter={(v: number, name) => [
                fmtUSD(v),
                name === 'net' ? 'Net position' : 'Gross value',
              ]}
              labelFormatter={(y) => `Year ${y}`}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
            <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="4 4" />
            {summary.paybackYear && (
              <ReferenceLine
                x={summary.paybackYear}
                stroke="#10b981"
                strokeDasharray="4 4"
                label={{ value: 'payback', fontSize: 11, fill: '#10b981', position: 'top' }}
              />
            )}
            <Line
              type="monotone"
              dataKey="gross"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 4"
              dot={false}
              name="gross"
            />
            <Line
              type="monotone"
              dataKey="net"
              stroke="#1d4ed8"
              strokeWidth={2.5}
              dot={false}
              name="net"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 flex gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 bg-brand" /> Net position (after cost)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 border-t-2 border-dashed border-emerald-500" /> Gross value
        </span>
      </div>
    </div>
  );
}
