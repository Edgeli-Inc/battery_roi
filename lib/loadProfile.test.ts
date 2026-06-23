import { describe, expect, it } from 'vitest';
import { DEFAULTS } from './constants';
import { lookupHomePeakLoad, sqftToBin, yearToVintage } from './loadProfile';

describe('yearToVintage', () => {
  it('bins years into ResStock vintage bands', () => {
    expect(yearToVintage(1935)).toBe('<1940');
    expect(yearToVintage(1985)).toBe('1980s');
    expect(yearToVintage(2007)).toBe('2000s');
    expect(yearToVintage(2023)).toBe('2010s'); // newest band caps the future
  });
});

describe('sqftToBin', () => {
  it('bins floor area into ResStock size bands', () => {
    expect(sqftToBin(900)).toBe('0-1499');
    expect(sqftToBin(1800)).toBe('1500-2499');
    expect(sqftToBin(3000)).toBe('2500-3999');
    expect(sqftToBin(5000)).toBe('4000+');
  });
});

describe('lookupHomePeakLoad', () => {
  it('returns a positive kW for every home type', () => {
    for (const t of [
      'Single-Family Detached',
      'Mobile Home',
      'Multi-Family with 5+ Units',
    ] as const) {
      expect(lookupHomePeakLoad(t, 1985, 1800, 'Electricity')).toBeGreaterThan(0);
    }
  });

  it('electric heat draws much more in the 5–9 PM window than fossil heat', () => {
    const elec = lookupHomePeakLoad('Single-Family Detached', 1985, 1800, 'Electricity');
    const oil = lookupHomePeakLoad('Single-Family Detached', 1985, 1800, 'Fuel Oil');
    expect(elec).toBeGreaterThan(oil * 2);
  });

  it('matches the default-archetype value baked into DEFAULTS', () => {
    expect(
      lookupHomePeakLoad('Single-Family Detached', 1985, 1800, 'Electricity'),
    ).toBeCloseTo(DEFAULTS.homePeakLoad, 5);
  });

  it('default archetype load is high enough to preserve the 3.6 kW VPP cap', () => {
    expect(DEFAULTS.homePeakLoad).toBeGreaterThanOrEqual(DEFAULTS.avgVppDischarge);
  });
});
