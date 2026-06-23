'use client';

import { useId } from 'react';
import InfoTip from '@/components/ui/InfoTip';

interface ControlRowProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
  prefix?: string;
  tooltip?: string;
}

export default function ControlRow({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
  prefix,
  tooltip,
}: ControlRowProps) {
  const id = useId();

  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  return (
    <div className="py-2.5">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label htmlFor={id} className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
          {label}
          {tooltip && <InfoTip label={label} text={tooltip} />}
        </label>
        <div className="flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-0.5 text-sm">
          {prefix && <span className="text-slate-400">{prefix}</span>}
          <input
            id={id}
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              const n = parseFloat(e.target.value);
              onChange(Number.isNaN(n) ? min : clamp(n));
            }}
            className="w-16 bg-transparent text-right tabular-nums outline-none"
          />
          {unit && <span className="text-slate-400">{unit}</span>}
        </div>
      </div>
      <input
        type="range"
        aria-label={label}
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(clamp(parseFloat(e.target.value)))}
      />
      <div className="mt-0.5 flex justify-between text-[10px] text-slate-400 tabular-nums">
        <span>{min.toLocaleString()}</span>
        <span>{max.toLocaleString()}</span>
      </div>
    </div>
  );
}
