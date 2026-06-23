'use client';

import { useId } from 'react';
import InfoTip from '@/components/ui/InfoTip';

interface Option {
  value: string;
  label: string;
}

interface SelectRowProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  tooltip?: string;
}

export default function SelectRow({
  label,
  value,
  onChange,
  options,
  tooltip,
}: SelectRowProps) {
  const id = useId();

  return (
    <div className="flex items-center justify-between gap-2 py-2.5">
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-sm font-medium text-slate-700"
      >
        {label}
        {tooltip && <InfoTip label={label} text={tooltip} />}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="max-w-[55%] rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-700 outline-none focus:border-brand"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
