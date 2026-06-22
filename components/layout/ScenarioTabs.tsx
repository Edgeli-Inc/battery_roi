'use client';

import type { Scenario } from '@/lib/types';

const TABS: { id: Scenario; label: string; sub?: string }[] = [
  { id: 'vpp', label: 'VPP Only' },
  { id: 'tou', label: 'TOU Only' },
  { id: 'hybrid', label: 'Hybrid', sub: 'Recommended' },
];

interface Props {
  scenario: Scenario;
  onChange: (s: Scenario) => void;
}

export default function ScenarioTabs({ scenario, onChange }: Props) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
      {TABS.map((t) => {
        const active = t.id === scenario;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              active
                ? 'bg-brand text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t.label}
            {t.sub && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                  active ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {t.sub}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
