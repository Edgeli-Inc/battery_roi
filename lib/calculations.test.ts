import { describe, expect, it } from 'vitest';
import { calcRoi, calcYear1Breakdown } from './calculations';
import { DEFAULTS } from './constants';
import type { InputParams } from './types';

const hybrid: InputParams = { ...DEFAULTS, scenario: 'hybrid' };

describe('calcYear1Breakdown — hybrid at defaults', () => {
  const b = calcYear1Breakdown(hybrid);

  it('VPP payment = 3.6 kW × $160 = $576', () => {
    expect(b.vppPayment).toBeCloseTo(576, 2);
  });

  it('TOU during VPP events ≈ $188 (3.6 × 3 × 40 × 0.4357)', () => {
    expect(b.touDuringVppEvents).toBeCloseTo(188.22, 1);
  });

  it('TOU residual hour ≈ $63 (3.6 × 1 × 40 × 0.4357)', () => {
    expect(b.touResidualHour).toBeCloseTo(62.76, 1);
  });

  it('TOU non-event days ≈ $1,310 (3.6 × 4 × 210 × 0.4357)', () => {
    expect(b.touNonEventDays).toBeCloseTo(1317.92, 0);
  });

  it('total Year 1 ≈ $2,145', () => {
    expect(b.total).toBeCloseTo(2144.96, 0);
    expect(b.total).toBeGreaterThan(2100);
    expect(b.total).toBeLessThan(2200);
  });
});

describe('scenario gating', () => {
  it('vpp-only zeroes all TOU components', () => {
    const b = calcYear1Breakdown({ ...DEFAULTS, scenario: 'vpp' });
    expect(b.vppPayment).toBeCloseTo(576, 2);
    expect(b.touDuringVppEvents).toBe(0);
    expect(b.touResidualHour).toBe(0);
    expect(b.touNonEventDays).toBe(0);
  });

  it('tou-only zeroes the VPP payment', () => {
    const b = calcYear1Breakdown({ ...DEFAULTS, scenario: 'tou' });
    expect(b.vppPayment).toBe(0);
    expect(b.touDuringVppEvents).toBeGreaterThan(0);
  });
});

describe('effective discharge cap', () => {
  it('caps TOU at home load but not VPP payment', () => {
    // discharge 6 kW but home only draws 3 kW
    const p: InputParams = {
      ...DEFAULTS,
      scenario: 'hybrid',
      avgVppDischarge: 6,
      homePeakLoad: 3,
    };
    const b = calcYear1Breakdown(p);
    // VPP uncapped: 6 × 160 = 960
    expect(b.vppPayment).toBeCloseTo(960, 2);
    // TOU uses min(6,3)=3 kW
    const spread = DEFAULTS.touOnPeak - DEFAULTS.touOffPeak;
    expect(b.touDuringVppEvents).toBeCloseTo(3 * 3 * 40 * spread, 4);
  });
});

describe('calcRoi — multi-year model', () => {
  const r = calcRoi(hybrid);

  it('produces 15 annual rows', () => {
    expect(r.annualResults).toHaveLength(15);
  });

  it('net cost = installed − rebate', () => {
    expect(r.netCost).toBe(14000);
  });

  it('payback lands around year 7–8', () => {
    expect(r.paybackYear).toBeGreaterThanOrEqual(7);
    expect(r.paybackYear).toBeLessThanOrEqual(8);
  });

  it('VPP payment is zero in years 11–15', () => {
    for (const row of r.annualResults.slice(10)) {
      expect(row.vppPayment).toBe(0);
    }
    expect(r.annualResults[9].vppPayment).toBeGreaterThan(0); // year 10 active
  });

  it('degradation reduces the TOU stream before escalation outpaces it', () => {
    // capFactor shrinks, rateFactor grows; both applied to TOU.
    const y1 = r.annualResults[0].touValue;
    const y2 = r.annualResults[1].touValue;
    // 1.5% degradation vs 4% escalation → year 2 TOU should exceed year 1
    expect(y2).toBeGreaterThan(y1);
  });

  it('15-year net position is positive at defaults', () => {
    expect(r.net15).toBeGreaterThan(0);
  });
});
