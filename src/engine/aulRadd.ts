/**
 * Langkah 4 & 5: 'Aul dan Radd.
 *
 * 'Aul: total furudh > 1 → naikkan asal masalah proporsional.
 * Radd: total furudh < 1 & tidak ada ashabah → kembalikan sisa ke pemegang furudh
 *       selain pasangan. Pengecualian: pasangan tunggal → radd ke pasangan.
 */

import { Fraction, sumFractions } from './fraction';
import type { HeirKind } from './types';
import type { FurудhMap } from './furudh';
import type { AshabahMap } from './ashabah';

export type Adjustment = 'none' | 'aul' | 'radd';

export interface AulRaddResult {
  adjustedFurudh: FurудhMap;
  adjustment: Adjustment;
  warnings: string[];
}

const SPOUSE_KINDS: HeirKind[] = ['suami', 'istri'];

export function applyAulRadd(
  furudh: FurудhMap,
  ashabah: AshabahMap,
): AulRaddResult {
  const warnings: string[] = [];

  const furudhEntries = Object.entries(furudh) as [HeirKind, Fraction][];
  const ashabahEntries = Object.entries(ashabah) as [HeirKind, Fraction][];

  const totalFurudh = sumFractions(furudhEntries.map(([, v]) => v));
  const hasAshabah = ashabahEntries.length > 0 && ashabahEntries.some(([, v]) => !v.isZero());

  // Sudah seimbang
  if (totalFurudh.eq(Fraction.one) || hasAshabah) {
    return { adjustedFurudh: { ...furudh }, adjustment: 'none', warnings };
  }

  // ── 'Aul ──────────────────────────────────────────────────────────────
  if (totalFurudh.gt(Fraction.one)) {
    // Naikkan asal masalah: setiap bagian dikali (1/totalFurudh)
    // Ekuivalen: kalikan semua bagian dengan d/n (kebalikan totalFurudh)
    const adjusted: FurудhMap = {};
    const inv = Fraction.of(totalFurudh.d, totalFurudh.n);
    for (const [k, v] of furudhEntries) {
      adjusted[k] = v.mul(inv);
    }
    return { adjustedFurudh: adjusted, adjustment: 'aul', warnings };
  }

  // ── Radd ───────────────────────────────────────────────────────────────
  // Total furudh < 1, tidak ada ashabah → radd
  const sisa = Fraction.one.sub(totalFurudh);

  const spouseEntry = furudhEntries.find(([k]) => SPOUSE_KINDS.includes(k));
  const nonSpouseEntries = furudhEntries.filter(([k]) => !SPOUSE_KINDS.includes(k));

  if (nonSpouseEntries.length === 0) {
    // Pasangan satu-satunya ahli waris → radd ke pasangan
    if (spouseEntry) {
      const adjusted: FurудhMap = { ...furudh };
      adjusted[spouseEntry[0]] = Fraction.one;
      return { adjustedFurudh: adjusted, adjustment: 'radd', warnings };
    }
    // Tidak ada ahli waris sama sekali → baitulmal
    warnings.push('Tidak ada ahli waris yang berhak; harta diserahkan ke baitulmal.');
    return { adjustedFurudh: { ...furudh }, adjustment: 'none', warnings };
  }

  // Radd ke pemegang furudh selain pasangan, proporsional dengan bagian mereka
  const totalNonSpouse = sumFractions(nonSpouseEntries.map(([, v]) => v));
  const adjusted: FurудhMap = { ...furudh };

  for (const [k, v] of nonSpouseEntries) {
    // Tambahkan porsi sisa proporsional
    const tambahan = sisa.mul(v).mul(Fraction.of(totalNonSpouse.d, totalNonSpouse.n));
    adjusted[k] = v.add(tambahan);
  }

  return { adjustedFurudh: adjusted, adjustment: 'radd', warnings };
}
