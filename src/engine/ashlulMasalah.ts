/**
 * Langkah 6: Ashlul-masalah (asal masalah).
 * Menghitung LCM dari semua penyebut bagian furudh/ashabah,
 * lalu mengonversi setiap bagian ke siham (bilangan bulat).
 */

import { lcm } from './fraction';
import type { Fraction } from './fraction';
import type { HeirKind } from './types';

export interface SihamResult {
  asalMasalah: number;
  siham: Partial<Record<HeirKind, number>>;
}

export function computeAshlulMasalah(
  shares: Partial<Record<HeirKind, Fraction>>,
): SihamResult {
  const entries = Object.entries(shares) as [HeirKind, Fraction][];
  if (entries.length === 0) return { asalMasalah: 1, siham: {} };

  // LCM semua penyebut
  let base = 1;
  for (const [, f] of entries) {
    base = lcm(base, f.d);
  }

  // Siham tiap ahli waris = n * (base / d)
  const siham: Partial<Record<HeirKind, number>> = {};
  for (const [k, f] of entries) {
    siham[k] = Math.round(f.n * (base / f.d));
  }

  return { asalMasalah: base, siham };
}
