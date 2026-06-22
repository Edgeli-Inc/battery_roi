# Powerwall ROI Estimator — Application Spec
**For Claude Code scaffolding**
Version 1.0 — June 2026

---

## 1. Purpose

Build a web application that estimates the financial return on a Tesla Powerwall 3 installation in a CMP (Central Maine Power) or Versant service territory, incorporating three stacked revenue streams:

1. **Efficiency Maine VPP program payment** (contractually locked, 10-year term)
2. **TOU rate arbitrage** (CMP time-of-use delivery rate, market-rate risk)
3. **Backup resilience value** (optional, qualitative)

The app should produce a year-by-year ROI model, simple payback period, and cumulative net position over a 15-year battery lifespan.

---

## 2. Background & Business Logic

### 2.1 The Three Revenue Streams

#### Stream 1 — EMT VPP Payment
- Efficiency Maine Trust (EMT) pays Program Partners **$200/kW-year** based on average kW discharged during peak load events
- Tesla passes through **$160/kW-year** to the homeowner (80% of EMT rate)
- Program runs **10 years** (EMT signs 10-year agreements with partners)
- Events: up to **60 per program year** (April 1–March 31), typically **40 events** in practice
- Each event: **3 hours**, called on weekdays between **5:00–9:00 PM**, at least 4 hours advance notice
- Payment is based on **average kW discharged across all events in a year**, not peak kW
- Payment arrives annually in December via Tesla app
- This stream is **independent of CMP TOU rate changes** — contractually fixed at EMT level

**Formula:**
```
VPP Annual Payment = Pass-through Rate ($/kW) × Avg Discharge (kW)
Default: $160 × 3.6 kW = $576/year (Tesla's published example)
```

#### Stream 2 — TOU Rate Arbitrage
- Requires enrolling in CMP's optional **Rate TOU** (separate from standard Rate A)
- Battery charges overnight at **off-peak rate**, discharges during **5–9 PM on-peak window** every weekday
- Arbitrage value = spread between on-peak and off-peak rates × kWh served

**CMP Rate Inputs (effective January 1, 2026):**

| Component | Rate TOU On-Peak | Rate TOU Off-Peak | Rate A (flat) |
|---|---|---|---|
| Delivery | $0.503144/kWh | $0.067452/kWh | $0.136474/kWh |
| Standard Offer Supply | $0.127210/kWh | $0.127210/kWh | $0.127210/kWh |
| **All-in** | **$0.630354/kWh** | **$0.194662/kWh** | **$0.263684/kWh** |
| Service charge | $26.71/month | — | $30.21/month |

- On-peak hours: **5:00 PM–9:00 PM, Monday–Friday, excluding holidays**
- Off-peak: all other hours including all day Saturday, Sunday, and holidays
- **Break-even threshold:** at least 86% of total usage must fall in off-peak period (CMP published)
- A battery makes TOU enrollment viable for almost any household by eliminating on-peak grid draw

**TOU Arbitrage Formula (per kWh served by battery during peak window):**
```
Net value per kWh = All-in On-Peak − All-in Off-Peak
                  = $0.6304 − $0.1947 = $0.4357/kWh

Annual TOU value = Effective Discharge (kW) × Peak Hours (4) × Weekdays × $0.4357/kWh
```

**Note:** The recharge cost is already embedded in this spread. Do NOT subtract recharge cost as a separate line item — it is captured in the off-peak rate.

#### Stream 3 — Hybrid (VPP + TOU combined)
The optimal strategy stacks both: VPP dispatch on event days, TOU arbitrage on all other weekdays.

| Day Type | Value Sources |
|---|---|
| VPP event day (40/yr) | VPP cash payment + TOU spread during 3-hr event window + TOU spread on residual 1 peak hr |
| Non-event weekday (~210/yr) | TOU spread on full 4-hr peak window |
| Weekend / holiday | No arbitrage value |

**Hybrid Annual Formula:**
```
Hybrid = VPP Payment
       + (Discharge × 3 hrs × Events × TOU Spread)        // on-peak during event hours
       + (Discharge × 1 hr × Events × TOU Spread)          // residual peak hr on event days
       + (Discharge × 4 hrs × Non-Event Weekdays × TOU Spread)  // full peak on non-event days
```

---

### 2.2 Battery Parameters

**Tesla Powerwall 3 (single unit):**
- Usable capacity: 13.5 kWh
- Max continuous discharge: 11.5 kW
- LFP chemistry (lithium iron phosphate) — superior cycle life
- Warranty: 10 years, 70% capacity retention guaranteed
- Expected functional lifespan: 12–15 years
- Round-trip efficiency: ~90%
- Typical average discharge during VPP events: **3.6 kW** (Tesla's published example)
- Internet connectivity required to maintain full warranty (drops to 4 years without)

**Degradation:**
- Model as annual linear capacity degradation, default **1.5%/year**
- Apply degradation factor to both discharge output and TOU kWh served each year
- VPP payment in years 11–15: $0 (program ends at year 10)

---

### 2.3 Cost Inputs

**Installed cost range (New England, 2026):** $12,000–$16,000 for single unit
- Default: **$14,000**
- New construction installs (like Bristol, ME) trend toward lower end due to no retrofit costs

**Incentives:**
- Federal 30% ITC (Residential Clean Energy Credit): **expired December 31, 2025** — do NOT include by default
- Maine state battery rebate: **none currently exists**
- UI should allow manual rebate input for any future programs

**Net cost = Installed cost − Rebates**

---

### 2.4 Multi-Year Model

Apply these factors year over year:

| Factor | Default | Range | Notes |
|---|---|---|---|
| Capacity degradation | 1.5%/yr | 0.5–3.0% | Reduces effective discharge kW |
| Rate escalation | 4.0%/yr | 0–8% | Applies to TOU arbitrage value only |
| VPP payment escalation | 0% | — | Fixed at $160/kW for 10-yr term |
| VPP active years | Years 1–10 | — | Zero VPP revenue in years 11–15 |

**Year N value:**
```
cap_factor = (1 - degradation)^(N-1)
rate_factor = (1 + escalation)^(N-1)
vpp_active = 1 if N <= 10, else 0

Annual_Value(N) = VPP_Payment × vpp_active × cap_factor
               + TOU_Value_yr1 × cap_factor × rate_factor
```

**Cumulative net position:**
```
Net(N) = -Net_Cost + Σ Annual_Value(1..N)
```

Payback year = first year where Net(N) >= 0

---

## 3. Application Architecture

### 3.1 Recommended Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **State:** React useState / useReducer (no external state library needed)
- **Deployment:** Vercel (or static export)

No backend required — all calculations are client-side.

### 3.2 File Structure

```
/app
  /page.tsx                  # Main ROI calculator page
  /layout.tsx                # Root layout
/components
  /inputs/
    CostInputs.tsx           # Installed cost, rebate sliders
    BatteryInputs.tsx        # Discharge, degradation, efficiency
    ProgramInputs.tsx        # VPP events, pass-through rate, weekdays
    RateInputs.tsx           # TOU rates, escalation (read-only defaults + override)
  /results/
    MetricCards.tsx          # Year 1 breakdown, payback, 10yr/15yr net
    PaybackBar.tsx           # Visual payback timeline bar
    CumulativeChart.tsx      # Recharts line chart, net position + gross value
    YearByYearTable.tsx      # Expandable annual breakdown table
  /layout/
    ScenarioTabs.tsx         # VPP only / TOU only / Hybrid tabs
/lib
  /calculations.ts           # Pure functions — all financial math
  /constants.ts              # CMP rate constants, defaults
  /types.ts                  # TypeScript interfaces
```

### 3.3 Core Types (`/lib/types.ts`)

```typescript
export interface InputParams {
  // Cost
  installedCost: number;          // dollars
  rebate: number;                 // dollars

  // Battery
  avgVppDischarge: number;        // kW — average during VPP events
  homePeakLoad: number;           // kW — home load served during 5-9 PM
  degradationPct: number;         // annual %, e.g. 1.5

  // Program
  vppEvents: number;              // events per year, e.g. 40
  passThrough: number;            // $/kW-year, e.g. 160
  weekdays: number;               // weekdays per year, e.g. 250

  // Rates
  touOnPeak: number;              // all-in $/kWh, default 0.630354
  touOffPeak: number;             // all-in $/kWh, default 0.194662
  rateA: number;                  // all-in $/kWh, default 0.263684
  rateEscalation: number;         // annual %, e.g. 4.0

  // Scenario
  scenario: 'vpp' | 'tou' | 'hybrid';
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
  simplePayback: number;         // years
  paybackYear: number | null;    // first year net position >= 0
  cum10: number;                 // cumulative gross at year 10
  net10: number;                 // net position at year 10
  cum15: number;
  net15: number;
  annualResults: AnnualResult[]; // years 1–15
}
```

### 3.4 Calculation Engine (`/lib/calculations.ts`)

All financial logic lives here as pure functions — no React, no side effects.

```typescript
export const CMP_RATES = {
  touOnPeakDelivery: 0.503144,
  touOffPeakDelivery: 0.067452,
  rateADelivery: 0.136474,
  standardOfferSupply: 0.127210,
  // All-in (delivery + supply)
  touOnPeakAllIn: 0.630354,
  touOffPeakAllIn: 0.194662,
  rateAAllIn: 0.263684,
} as const;

export const DEFAULTS = {
  installedCost: 14000,
  rebate: 0,
  avgVppDischarge: 3.6,
  homePeakLoad: 3.6,
  degradationPct: 1.5,
  vppEvents: 40,
  passThrough: 160,
  weekdays: 250,
  rateEscalation: 4.0,
  vppPeakHours: 3,        // VPP event duration (hours)
  totalPeakHours: 4,      // Total on-peak window 5-9 PM (hours)
  programYears: 10,       // VPP program term
  modelYears: 15,         // Full model horizon
} as const;

// Year 1 value breakdown by component
export function calcYear1Breakdown(p: InputParams): {
  vppPayment: number;
  touDuringVppEvents: number;
  touResidualHour: number;
  touNonEventDays: number;
  total: number;
} {
  const effDischarge = Math.min(p.avgVppDischarge, p.homePeakLoad);
  const nonEventDays = p.weekdays - p.vppEvents;
  const spread = p.touOnPeak - p.touOffPeak;

  const vppPayment = p.passThrough * p.avgVppDischarge;
  const touDuringVppEvents = effDischarge * DEFAULTS.vppPeakHours * p.vppEvents * spread;
  const touResidualHour = effDischarge * (DEFAULTS.totalPeakHours - DEFAULTS.vppPeakHours) * p.vppEvents * spread;
  const touNonEventDays = effDischarge * DEFAULTS.totalPeakHours * nonEventDays * spread;

  // For VPP-only scenario: no TOU enrollment, battery still offsets Rate A load
  // For TOU-only scenario: no VPP payment, full 4hr arbitrage all weekdays
  // For hybrid: all four components

  return {
    vppPayment: p.scenario !== 'tou' ? vppPayment : 0,
    touDuringVppEvents: p.scenario !== 'vpp' ? touDuringVppEvents : 0,
    touResidualHour: p.scenario !== 'vpp' ? touResidualHour : 0,
    touNonEventDays: p.scenario !== 'vpp' ? touNonEventDays : 0,
    total: /* sum of applicable components */,
  };
}

// Multi-year model
export function calcRoi(p: InputParams): RoiSummary {
  const netCost = p.installedCost - p.rebate;
  const yr1 = calcYear1Breakdown(p);
  const yr1Total = yr1.total;

  const annualResults: AnnualResult[] = [];
  let cumulativeGross = 0;

  for (let yr = 1; yr <= DEFAULTS.modelYears; yr++) {
    const capFactor = Math.pow(1 - p.degradationPct / 100, yr - 1);
    const rateFactor = Math.pow(1 + p.rateEscalation / 100, yr - 1);
    const vppActive = yr <= DEFAULTS.programYears ? 1 : 0;

    const vppComponent = yr1.vppPayment * vppActive * capFactor;
    const touComponent = (yr1.touDuringVppEvents + yr1.touResidualHour + yr1.touNonEventDays)
                          * capFactor * rateFactor;

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

  const paybackYear = annualResults.find(r => r.cumulativeNet >= 0)?.year ?? null;
  const simplePayback = netCost / yr1Total;

  return {
    netCost,
    year1Value: yr1Total,
    simplePayback,
    paybackYear,
    cum10: annualResults[9].cumulativeGross,
    net10: annualResults[9].cumulativeNet,
    cum15: annualResults[14].cumulativeGross,
    net15: annualResults[14].cumulativeNet,
    annualResults,
  };
}
```

---

## 4. UI Specification

### 4.1 Layout

Two-column desktop layout, single column on mobile:
- **Left column:** Input controls (sliders + numeric inputs)
- **Right column:** Results (metric cards, payback bar, chart)

Scenario tabs at top: `VPP Only` | `TOU Only` | `Hybrid (Recommended)`

Default to **Hybrid** tab.

### 4.2 Input Controls

Each input should have:
- A slider for quick adjustment
- A numeric input field that stays in sync with slider
- Label with units
- Tooltip icon with explanation

**Cost Inputs:**
| Label | Default | Min | Max | Step | Unit |
|---|---|---|---|---|---|
| Installed cost | 14,000 | 10,000 | 20,000 | 500 | $ |
| Rebates / incentives | 0 | 0 | 5,000 | 250 | $ |

**Battery Performance:**
| Label | Default | Min | Max | Step | Unit |
|---|---|---|---|---|---|
| Avg. VPP discharge | 3.6 | 1.0 | 11.5 | 0.1 | kW |
| Home peak load (5–9 PM) | 3.6 | 1.0 | 11.5 | 0.1 | kW |
| Annual degradation | 1.5 | 0.5 | 3.0 | 0.1 | %/yr |

**Program Inputs:**
| Label | Default | Min | Max | Step | Unit |
|---|---|---|---|---|---|
| VPP events per year | 40 | 20 | 60 | 5 | events |
| Tesla pass-through rate | 160 | 100 | 200 | 10 | $/kW |
| Weekdays per year | 250 | 240 | 262 | 1 | days |

**Rate Inputs (advanced / collapsed by default):**
| Label | Default | Notes |
|---|---|---|
| All-in on-peak rate | $0.6304/kWh | CMP TOU + Standard Offer, Jan 2026 |
| All-in off-peak rate | $0.1947/kWh | CMP TOU + Standard Offer, Jan 2026 |
| Annual rate escalation | 4.0%/yr | Applies to TOU arbitrage only |

Include a "Reset to CMP defaults" button in this section.

### 4.3 Results Display

**Metric cards (Year 1 breakdown):**
- VPP payment from Tesla
- TOU bill savings (arbitrage)
- Total Year 1 value
- Simple payback (years)
- 10-year net profit (after cost)
- 15-year net profit (after cost)

**Payback bar:**
- Horizontal bar, 0–15 year scale, showing payback point
- Color: green ≤ 8 yrs, amber 9–12 yrs, red > 12 yrs

**Cumulative chart (Recharts LineChart):**
- X axis: Years 0–15
- Y axis: Dollars
- Line 1 (blue, filled): Net position after cost (starts at -$14,000)
- Line 2 (green, dashed): Gross cumulative value (starts at $0)
- Zero line reference: horizontal dashed gray line at $0
- Tooltip: year + net position + gross value

**Year-by-year table (expandable):**
- Columns: Year | VPP Payment | TOU Value | Total | Cumulative Gross | Net Position
- Highlight payback year row
- Collapse by default, "Show annual detail" toggle

### 4.4 Disclaimers (footer)

- CMP TOU rates effective January 1, 2026. Rates subject to change by MPUC.
- Federal 30% ITC expired December 31, 2025 and is not reflected in this model.
- EMT VPP program rate fixed at $200/kW for 10-year program partner agreements. Tesla pass-through rate of $160/kW per published program terms as of June 2026.
- Model assumes Powerwall 3 single unit. Installed cost estimates for New England market.
- This tool is for estimation purposes only and does not constitute financial advice.

---

## 5. Key Business Logic Rules

### 5.1 Effective Discharge Cap
The battery cannot serve more home load than the home is drawing:
```
effDischarge = Math.min(avgVppDischarge, homePeakLoad)
```
Apply `effDischarge` to TOU calculations. Use `avgVppDischarge` (uncapped) for VPP payment since the VPP discharge may export beyond home load.

### 5.2 Recharge Cost Treatment
**Do NOT add a separate recharge cost line.** The TOU arbitrage spread already nets this out:
```
Spread = On-Peak All-In − Off-Peak All-In
       = $0.6304 − $0.1947 = $0.4357/kWh
```
This spread represents: avoided on-peak purchase price minus cost to buy overnight recharge energy. It is the complete net benefit per kWh cycled.

### 5.3 VPP-Only Scenario (Rate A baseline)
When scenario = 'vpp' (no TOU enrollment):
- Homeowner stays on Rate A flat rate
- Battery still offsets home load at all hours, but there is no arbitrage spread
- VPP payment is the primary financial benefit
- No rate escalation benefit (Rate A may also change, but model conservatively as flat)

### 5.4 Degradation Application
Apply to both VPP and TOU components:
- Reduced discharge kW → less VPP payment AND less TOU kWh served
- Rate escalation partially offsets degradation on the TOU side over time

### 5.5 Years 11–15 (Post-VPP)
After year 10, VPP payment = $0. Battery continues to provide TOU arbitrage value (with accumulated degradation and rate escalation applied). These years represent the "bonus" beyond the program term.

---

## 6. Rate Risk Disclosure Logic

Include a visible callout in the UI:

> **Rate risk:** CMP TOU rates are set by the MPUC and can change at any time. The current on-peak/off-peak spread of 7.5:1 on the delivery component is significantly higher than the 3–4:1 range regulators typically consider sustainable for broad residential adoption. An MPUC docket (2024-00231) is actively reviewing TOU rate design. The VPP payment ($160/kW from Tesla) is contractually fixed for the 10-year program term and is not subject to rate case changes.

---

## 7. Future Features (Post-MVP)

- **Multi-unit support:** 2× Powerwall stacking (linear scaling)
- **Solar + battery:** Add solar production to reduce or eliminate overnight recharge cost
- **Versant territory:** Versant rates run ~$0.32/kWh all-in vs. CMP's $0.27; higher base rates mean stronger TOU case
- **V2H value:** Backup resilience valuation (cost per outage-hour avoided)
- **Partner comparison:** Compare Tesla $160/kW vs. EG4 $180/kW vs. other partners side-by-side
- **PDF export:** Generate a shareable one-page ROI summary

---

## 8. Rate Source & Verification

| Source | URL | Date Verified |
|---|---|---|
| CMP TOU rates | https://www.cmpco.com/time-of-use-delivery-rate | June 2026 |
| CMP Standard Offer | https://www.cmpco.com/account/understandyourbill/pricing | June 2026 |
| EMT program terms | https://www.efficiencymaine.com/small-battery-incentives/ | June 2026 |
| Tesla compensation | Tesla VPP program page (screenshot verified) | June 2026 |
| EMT board funding source | EMT Board Minutes Nov 19 2025 (Ian Burnes) | June 2026 |

**Rates must be verified and updated whenever CMP files a new tariff sheet with the MPUC.**

---

## 9. Scaffolding Prompt for Claude Code

When feeding this document to Claude Code, use the following prompt:

```
Read the attached spec document and scaffold a Next.js 14 TypeScript application 
for a Powerwall ROI estimator. 

Start with:
1. /lib/types.ts — all TypeScript interfaces
2. /lib/constants.ts — CMP rate constants and default values
3. /lib/calculations.ts — pure calculation functions (no React)
4. Unit tests for calculations.ts covering the hybrid scenario at default inputs

The expected Year 1 hybrid value at defaults should be approximately:
- VPP payment: $576 (3.6 kW × $160)
- TOU during VPP events: ~$188 (3.6 kW × 3 hrs × 40 events × $0.4357)
- TOU residual hour: ~$63 (3.6 kW × 1 hr × 40 events × $0.4357)  
- TOU non-event days: ~$1,310 (3.6 kW × 4 hrs × 210 days × $0.4357)
- Total Year 1: ~$2,137

Do NOT subtract recharge cost as a separate line — it is embedded in the spread.
Payback at defaults should be approximately year 7–8.

After the calculation layer is verified, scaffold the component tree per the 
file structure in section 3.2, using Tailwind CSS and Recharts.
```
