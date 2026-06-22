import type { InputParams } from './types';

/**
 * CMP rate constants, effective January 1, 2026.
 * All-in = delivery + standard-offer supply. Regulator-set (MPUC) — re-verify
 * whenever CMP files a new tariff sheet (see spec §8 for sources).
 */
export const CMP_RATES = {
  touOnPeakDelivery: 0.503144,
  touOffPeakDelivery: 0.067452,
  rateADelivery: 0.136474,
  standardOfferSupply: 0.12721,
  // All-in (delivery + supply)
  touOnPeakAllIn: 0.630354,
  touOffPeakAllIn: 0.194662,
  rateAAllIn: 0.263684,
} as const;

/** Model-wide structural constants (not user-editable). */
export const MODEL = {
  vppPeakHours: 3, // VPP event duration (hours)
  totalPeakHours: 4, // Total on-peak window 5-9 PM (hours)
  programYears: 10, // VPP program term
  modelYears: 15, // Full model horizon
} as const;

/** Default user inputs. */
export const DEFAULTS: InputParams = {
  installedCost: 14000,
  rebate: 0,
  avgVppDischarge: 3.6,
  homePeakLoad: 3.6,
  degradationPct: 1.5,
  vppEvents: 40,
  passThrough: 160,
  weekdays: 250,
  touOnPeak: CMP_RATES.touOnPeakAllIn,
  touOffPeak: CMP_RATES.touOffPeakAllIn,
  rateA: CMP_RATES.rateAAllIn,
  rateEscalation: 4.0,
  scenario: 'hybrid',
};
