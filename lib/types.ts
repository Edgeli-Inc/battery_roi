export type Scenario = 'vpp' | 'tou' | 'hybrid';

/**
 * A VPP vendor on the Efficiency Maine (EMT) approved list.
 * Fields are `null` when the vendor publishes no value — null fields are
 * excluded from the fleet-wide average (see VPP_VENDOR_AVERAGES).
 */
export interface VppVendor {
  name: string;
  passThrough: number | null; // $/kW-yr passed through to the homeowner
  events: number | null; // dispatch events per year
  avgDischarge: number | null; // kW dispatched per event
  source: string; // URL the terms were read from
  note?: string; // how the figures were derived / caveats
}

export interface InputParams {
  // Cost
  installedCost: number; // dollars
  rebate: number; // dollars

  // Battery
  avgVppDischarge: number; // kW — average during VPP events
  homePeakLoad: number; // kW — home load served during 5-9 PM
  degradationPct: number; // annual %, e.g. 1.5

  // Program
  vppEvents: number; // events per year, e.g. 40
  passThrough: number; // $/kW-year, e.g. 160
  weekdays: number; // weekdays per year, e.g. 250

  // Rates
  touOnPeak: number; // all-in $/kWh, default 0.630354
  touOffPeak: number; // all-in $/kWh, default 0.194662
  rateA: number; // all-in $/kWh, default 0.263684
  rateEscalation: number; // annual %, e.g. 4.0

  // Scenario
  scenario: Scenario;
}

/** Year 1 value decomposed into its four contributing components. */
export interface Year1Breakdown {
  vppPayment: number;
  touDuringVppEvents: number;
  touResidualHour: number;
  touNonEventDays: number;
  total: number;
}

export interface AnnualResult {
  year: number;
  vppPayment: number;
  touValue: number;
  totalValue: number;
  cumulativeGross: number;
  cumulativeNet: number;
}

export interface RoiSummary {
  netCost: number;
  year1Value: number;
  simplePayback: number; // years (netCost / year1Value)
  paybackYear: number | null; // first year cumulative net position >= 0
  cum10: number; // cumulative gross at year 10
  net10: number; // net position at year 10
  cum15: number;
  net15: number;
  annualResults: AnnualResult[]; // years 1–15
}
