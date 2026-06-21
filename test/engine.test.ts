import { describe, it, expect } from 'vitest';
import { calculate } from '../src/engine/calculate';
import { Fraction } from '../src/engine/fraction';
import type { HeirInput, HeirKind } from '../src/engine/types';
import { fixtures } from './fixtures';

function h(kind: HeirKind, count = 1): HeirInput {
  return { kind, count };
}

// Toleransi perbandingan fraksi (pembulatan floating point)
function fractionStr(f: Fraction): string {
  return f.toString();
}

describe('Fixtures dari rencana implementasi', () => {
  for (const fix of fixtures) {
    it(fix.name, () => {
      const result = calculate(
        { estate: fix.estate, heirs: fix.heirs.filter(h => h.count > 0) },
        fix.deceased,
      );

      // Cek adjustment
      if (fix.adjustment) {
        expect(result.adjustment).toBe(fix.adjustment);
      }

      // Cek bagian tiap ahli waris yang disebutkan
      for (const [kind, expected] of Object.entries(fix.expected)) {
        const heir = result.heirs.find(h => h.kind === kind);

        if (expected === 'mahjub') {
          expect(heir?.status, `${kind} harus mahjub`).toBe('mahjub');
        } else if (expected === 'ashabah') {
          expect(
            ['ashabah','furudh+ashabah'].includes(heir?.status ?? ''),
            `${kind} harus ashabah`,
          ).toBe(true);
        } else {
          // Bandingkan fraksi
          const [n, d] = expected.split('/').map(Number);
          const expectedFrac = d ? Fraction.of(n!, d) : Fraction.of(n ?? 1, 1);
          expect(
            heir,
            `${kind} harus ada dalam hasil (expected ${expected})`,
          ).toBeDefined();
          if (heir) {
            expect(
              fractionStr(heir.share),
              `${kind} share: got ${fractionStr(heir.share)}, expected ${expected}`,
            ).toBe(fractionStr(expectedFrac));
          }
        }
      }
    });
  }
});

describe('Kasus dasar manual', () => {
  it('hanya 1 anak laki-laki (ashabah, ambil semua)', () => {
    const result = calculate(
      { estate: 100_000, heirs: [h('istri', 0), h('anakLk')] },
      'suami',
    );
    const anak = result.heirs.find(h => h.kind === 'anakLk')!;
    expect(anak.share.toString()).toBe('1');
    expect(anak.status).toBe('ashabah');
  });

  it('ayah + ibu saja (bukan Umariyatain, tidak ada pasangan)', () => {
    const result = calculate(
      { estate: 100_000, heirs: [h('ayah'), h('ibu')] },
      'suami',
    );
    const ibu = result.heirs.find(h => h.kind === 'ibu')!;
    const ayah = result.heirs.find(h => h.kind === 'ayah')!;
    // Ibu 1/3, ayah ashabah 2/3
    expect(ibu.share.toString()).toBe('1/3');
    expect(ayah.status).toBe('ashabah');
    expect(ayah.share.toString()).toBe('2/3');
  });

  it('ibu diblokir nenek dari ibu', () => {
    const result = calculate(
      { estate: 100_000, heirs: [h('ibu'), h('nenekDariIbu')] },
      'suami',
    );
    const nenek = result.heirs.find(h => h.kind === 'nenekDariIbu')!;
    expect(nenek.status).toBe('mahjub');
  });

  it('anakLk memblokir semua saudara', () => {
    const result = calculate(
      {
        estate: 100_000,
        heirs: [h('anakLk'), h('saudaraLkKandung', 2), h('saudaraSeibu', 1)],
      },
      'suami',
    );
    const bro = result.heirs.find(h => h.kind === 'saudaraLkKandung')!;
    const seibu = result.heirs.find(h => h.kind === 'saudaraSeibu')!;
    expect(bro.status).toBe('mahjub');
    expect(seibu.status).toBe('mahjub');
  });

  it('ayah memblokir kakek', () => {
    const result = calculate(
      { estate: 100_000, heirs: [h('ayah'), h('kakek')] },
      'suami',
    );
    const kakek = result.heirs.find(h => h.kind === 'kakek')!;
    expect(kakek.status).toBe('mahjub');
  });

  it('total nominal = total harta (rekonsiliasi)', () => {
    const result = calculate(
      {
        estate: 100_001, // jumlah ganjil untuk uji rekonsiliasi
        heirs: [h('istri'), h('anakLk', 2), h('anakPr'), h('ibu'), h('ayah')],
      },
      'suami',
    );
    const totalNominal = result.heirs
      .filter(h => h.status !== 'mahjub')
      .reduce((s, h) => s + h.amount, 0);
    expect(totalNominal).toBe(100_001);
  });
});
