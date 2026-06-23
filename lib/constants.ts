import { lookupHomePeakLoad } from './loadProfile';
import type { InputParams, VppVendor } from './types';

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

/**
 * VPP vendors from the Efficiency Maine approved list
 * (https://www.efficiencymaine.com/small-battery-incentives/).
 *
 * EMT itself publishes no per-vendor terms — each brand links out to the
 * vendor's own program page, where the terms (if any) live. Only vendors with
 * published, verifiable terms are encoded here; the rest are excluded from both
 * the average and the analysis. `null` fields are excluded per-field, so a
 * vendor can contribute to one average without distorting another.
 */
export const VPP_VENDORS: VppVendor[] = [
  {
    name: 'Tesla',
    passThrough: 160, // $160/kW-yr, explicit
    events: null, // no event count published on Tesla's Maine VPP page
    avgDischarge: 3.6, // Tesla's own example discharge
    source: 'https://www.tesla.com/support/energy/virtual-power-plant/maine',
    note: '$160/kW-yr → ~$576/yr at 3.6 kW; 10-yr term.',
  },
  {
    name: 'FranklinWH',
    passThrough: 160, // $200/kW-yr from the Trust, retains up to 20% → ≥ $160 passed through
    events: 40, // stated as ≥2/month and ≤60/yr; 40 chosen within that band
    avgDischarge: 3.6, // not published; uses the 3.6 kW fleet assumption
    source: 'https://www.franklinwh.com/',
    note: '$200/kW-yr from Trust, ≤20% retained; events ≥2/month and ≤60/yr.',
  },
];

/** Average a vendor field across vendors that publish it (ignores nulls). */
function vendorAvg(pick: (v: VppVendor) => number | null): number {
  const vals = VPP_VENDORS.map(pick).filter((n): n is number => n !== null);
  return vals.length ? vals.reduce((s, n) => s + n, 0) / vals.length : 0;
}

/** Fleet-wide averages across EMT vendors with published terms. */
export const VPP_VENDOR_AVERAGES = {
  passThrough: vendorAvg((v) => v.passThrough),
  vppEvents: vendorAvg((v) => v.events),
  avgVppDischarge: vendorAvg((v) => v.avgDischarge),
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
  // VPP program defaults are the fleet-wide average across EMT vendors with
  // published terms (see VPP_VENDORS). Currently both resolve to the prior
  // Tesla-based figures; adding vendors shifts these automatically.
  avgVppDischarge: VPP_VENDOR_AVERAGES.avgVppDischarge,
  degradationPct: 1.5,
  // Default home: an electric-heat 1980s ~1,800 sqft single-family detached.
  // Its NREL-derived 5–9 PM load (~3.6 kW) preserves the documented Year-1
  // regression (effDischarge stays capped at the 3.6 kW VPP discharge).
  homeType: 'Single-Family Detached',
  yearBuilt: 1985,
  sqft: 1800,
  heatingFuel: 'Electricity',
  homePeakLoad: lookupHomePeakLoad('Single-Family Detached', 1985, 1800, 'Electricity'),
  vppEvents: VPP_VENDOR_AVERAGES.vppEvents,
  passThrough: VPP_VENDOR_AVERAGES.passThrough,
  weekdays: 250,
  touOnPeak: CMP_RATES.touOnPeakAllIn,
  touOffPeak: CMP_RATES.touOffPeakAllIn,
  rateA: CMP_RATES.rateAAllIn,
  rateEscalation: 4.0,
  scenario: 'hybrid',
};
