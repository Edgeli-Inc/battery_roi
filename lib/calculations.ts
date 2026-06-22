import { MODEL } from './constants';
import type {
  AnnualResult,
  InputParams,
  RoiSummary,
  Year1Breakdown,
} from './types';

/**
 * Year 1 value broken into its four components.
 *
 * Key rules (spec §5):
 *  - effDischarge is capped at home load for TOU arbitrage (the battery can't
 *    serve more than the home draws), but VPP payment uses the UNCAPPED
 *    avgVppDischarge (VPP dispatch can export beyond home load).
 *  - The TOU spread (on-peak − off-peak) already nets out overnight recharge
 *    cost — never subtract recharge as a separate line.
 *  - Scenario gating: 'vpp' zeroes all TOU; 'tou' zeroes VPP; 'hybrid' = all.
 */
export function calcYear1Breakdown(p: InputParams): Year1Breakdown {
  const effDischarge = Math.min(p.avgVppDischarge, p.homePeakLoad);
  const nonEventDays = Math.max(0, p.weekdays - p.vppEvents);
  const spread = p.touOnPeak - p.touOffPeak;
  const residualHours = MODEL.totalPeakHours - MODEL.vppPeakHours;

  const includeVpp = p.scenario !== 'tou';
  const includeTou = p.scenario !== 'vpp';

  const vppPayment = includeVpp ? p.passThrough * p.avgVppDischarge : 0;
  const touDuringVppEvents = includeTou
    ? effDischarge * MODEL.vppPeakHours * p.vppEvents * spread
    : 0;
  const touResidualHour = includeTou
    ? effDischarge * residualHours * p.vppEvents * spread
    : 0;
  const touNonEventDays = includeTou
    ? effDischarge * MODEL.totalPeakHours * nonEventDays * spread
    : 0;

  const total =
    vppPayment + touDuringVppEvents + touResidualHour + touNonEventDays;

  return {
    vppPayment,
    touDuringVppEvents,
    touResidualHour,
    touNonEventDays,
    total,
  };
}

/**
 * Full 15-year model.
 *
 * Year N (spec §2.4):
 *   cap_factor  = (1 - degradation)^(N-1)          // applies to BOTH streams
 *   rate_factor = (1 + escalation)^(N-1)           // applies to TOU only
 *   vpp_active  = 1 if N <= programYears else 0
 *   Annual(N)   = VPP × vpp_active × cap_factor
 *               + TOU_yr1 × cap_factor × rate_factor
 */
export function calcRoi(p: InputParams): RoiSummary {
  const netCost = p.installedCost - p.rebate;
  const yr1 = calcYear1Breakdown(p);
  const yr1Vpp = yr1.vppPayment;
  const yr1Tou = yr1.touDuringVppEvents + yr1.touResidualHour + yr1.touNonEventDays;

  const annualResults: AnnualResult[] = [];
  let cumulativeGross = 0;

  for (let yr = 1; yr <= MODEL.modelYears; yr++) {
    const capFactor = Math.pow(1 - p.degradationPct / 100, yr - 1);
    const rateFactor = Math.pow(1 + p.rateEscalation / 100, yr - 1);
    const vppActive = yr <= MODEL.programYears ? 1 : 0;

    const vppComponent = yr1Vpp * vppActive * capFactor;
    const touComponent = yr1Tou * capFactor * rateFactor;
    const annualValue = vppComponent + touComponent;
    cumulativeGross += annualValue;

    annualResults.push({
      year: yr,
      vppPayment: vppComponent,
      touValue: touComponent,
      totalValue: annualValue,
      cumulativeGross,
      cumulativeNet: cumulativeGross - netCost,
    });
  }

  const paybackYear =
    annualResults.find((r) => r.cumulativeNet >= 0)?.year ?? null;
  const simplePayback = yr1.total > 0 ? netCost / yr1.total : Infinity;

  return {
    netCost,
    year1Value: yr1.total,
    simplePayback,
    paybackYear,
    cum10: annualResults[9].cumulativeGross,
    net10: annualResults[9].cumulativeNet,
    cum15: annualResults[14].cumulativeGross,
    net15: annualResults[14].cumulativeNet,
    annualResults,
  };
}
