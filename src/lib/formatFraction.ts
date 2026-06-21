import type { Fraction } from '../engine/fraction';

export function formatFraction(f: Fraction): string {
  if (f.d === 1) return f.n === 0 ? '0' : `${f.n}`;
  return `${f.n}/${f.d}`;
}

export function formatPercent(f: Fraction, decimals = 1): string {
  return `${(f.toNumber() * 100).toFixed(decimals)}%`;
}
