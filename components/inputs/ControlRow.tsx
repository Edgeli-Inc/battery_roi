'use client';

import { useId, useState } from 'react';

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
  const [showTip, setShowTip] = useState(false);

  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  return (
    <div className="py-2.5">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label htmlFor={id} className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
          {label}
          {tooltip && (
            <span className="relative inline-flex">
              <button
                type="button"
                aria-label={`About ${label}`}
                onMouseEnter={() => setShowTip(true)}
                onMouseLeave={() => setShowTip(false)}
                onFocus={() => setShowTip(true)}
                onBlur={() => setShowTip(false)}
                className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-300"
              >
                ?
              </button>
              {showTip && (
                <span className="absolute bottom-full left-1/2 z-10 mb-1 w-56 -translate-x-1/2 rounded-md bg-slate-800 px-2.5 py-1.5 text-xs font-normal leading-snug text-white shadow-lg">
                  {tooltip}
                </span>
              )}
            </span>
          )}
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
