export function fmtUSD(n: number, fractionDigits = 0): string {
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

export function fmtUSDSigned(n: number, fractionDigits = 0): string {
  const s = fmtUSD(Math.abs(n), fractionDigits);
  return n < 0 ? `−${s}` : s;
}

export function fmtYears(n: number): string {
  if (!isFinite(n)) return 'Never';
  return `${n.toFixed(1)} yrs`;
}
