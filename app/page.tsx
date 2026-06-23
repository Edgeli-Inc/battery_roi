'use client';

import { useMemo, useState } from 'react';
import BatteryInputs from '@/components/inputs/BatteryInputs';
import CostInputs from '@/components/inputs/CostInputs';
import HomeInputs from '@/components/inputs/HomeInputs';
import ProgramInputs from '@/components/inputs/ProgramInputs';
import RateInputs from '@/components/inputs/RateInputs';
import Disclaimers from '@/components/layout/Disclaimers';
import RateRiskCallout from '@/components/layout/RateRiskCallout';
import ScenarioTabs from '@/components/layout/ScenarioTabs';
import MetricCards from '@/components/results/MetricCards';
import PaybackBar from '@/components/results/PaybackBar';
import YearByYearTable from '@/components/results/YearByYearTable';
import { calcRoi, calcYear1Breakdown } from '@/lib/calculations';
import { DEFAULTS } from '@/lib/constants';
import { lookupHomePeakLoad } from '@/lib/loadProfile';
import type { InputParams } from '@/lib/types';

const HOME_FIELDS = ['homeType', 'yearBuilt', 'sqft', 'heatingFuel'] as const;

export default function Home() {
  const [params, setParams] = useState<InputParams>(DEFAULTS);

  const update = (patch: Partial<InputParams>) =>
    setParams((p) => {
      const next = { ...p, ...patch };
      // homePeakLoad is derived — re-resolve it whenever a home field changes.
      if (HOME_FIELDS.some((f) => f in patch)) {
        next.homePeakLoad = lookupHomePeakLoad(
          next.homeType,
          next.yearBuilt,
          next.sqft,
          next.heatingFuel,
        );
      }
      return next;
    });

  const summary = useMemo(() => calcRoi(params), [params]);
  const breakdown = useMemo(() => calcYear1Breakdown(params), [params]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Powerwall ROI Estimator
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Stacked VPP + time-of-use arbitrage returns for a Tesla Powerwall 3 in
          CMP territory, over a 15-year horizon.
        </p>
      </header>

      <div className="mb-6">
        <ScenarioTabs
          scenario={params.scenario}
          onChange={(scenario) => update({ scenario })}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        {/* Left column — inputs */}
        <div className="space-y-4">
          <HomeInputs params={params} update={update} />
          <CostInputs params={params} update={update} />
          <BatteryInputs params={params} update={update} />
          <ProgramInputs params={params} update={update} />
          <RateInputs params={params} update={update} />
          <button
            type="button"
            onClick={() => setParams(DEFAULTS)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Reset all to defaults
          </button>
        </div>

        {/* Right column — results */}
        <div className="space-y-4">
          <MetricCards summary={summary} breakdown={breakdown} />
          <PaybackBar summary={summary} />
          <YearByYearTable summary={summary} />
          <RateRiskCallout />
        </div>
      </div>

      <Disclaimers />
    </main>
  );
}
