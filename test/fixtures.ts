/**
 * Named test fixtures: input → bagian yang diharapkan.
 * format expected: { kind: "n/d" } atau { kind: "ashabah" }
 */

import type { HeirInput, HeirKind } from '../src/engine/types';

export interface Fixture {
  name: string;
  deceased: 'suami' | 'istri';
  estate: number;
  heirs: HeirInput[];
  expected: Partial<Record<HeirKind, string>>; // "n/d" | "ashabah" | "mahjub"
  adjustment?: 'none' | 'aul' | 'radd';
  note?: string;
}

function h(kind: HeirKind, count = 1): HeirInput {
  return { kind, count };
}

export const fixtures: Fixture[] = [
  // ── DASAR ────────────────────────────────────────────────────────────────
  {
    name: 'BASIC-1: istri + 2 anakLk + 1 anakPr',
    deceased: 'suami',
    estate: 240_000,
    heirs: [h('istri'), h('anakLk', 2), h('anakPr', 1)],
    expected: {
      istri: '1/8',
      // sisa=7/8, units: 2sons×2 + 1dau×1 = 5 → anakLk total=7/8×4/5=7/10, anakPr=7/8×1/5=7/40
      anakLk: '7/10',
      anakPr: '7/40',
    },
    adjustment: 'none',
    note: 'Istri 1/8, anak ashabah 4:4:2 dari 7/8',
  },
  {
    name: 'BASIC-2: istri + 1 anakLk',
    deceased: 'suami',
    estate: 100_000,
    heirs: [h('istri'), h('anakLk', 1)],
    expected: { istri: '1/8', anakLk: '7/8' },
    adjustment: 'none',
  },
  {
    name: 'BASIC-3: istri + ayah + ibu + 1 anakLk',
    deceased: 'suami',
    estate: 240_000,
    heirs: [h('istri'), h('ayah'), h('ibu'), h('anakLk')],
    expected: { istri: '1/8', ayah: '1/6', ibu: '1/6', anakLk: '13/24' },
    adjustment: 'none',
  },
  {
    name: 'BASIC-4: suami + 1 anakPr (radd)',
    deceased: 'istri',
    estate: 100_000,
    heirs: [h('suami'), h('anakPr')],
    expected: { suami: '1/4', anakPr: '3/4' },
    adjustment: 'radd',
    note: 'Radd ke anak perempuan (bukan ke suami)',
  },
  {
    name: 'BASIC-5: suami saja (radd ke pasangan)',
    deceased: 'istri',
    estate: 100_000,
    heirs: [h('suami')],
    expected: { suami: '1/1' },
    adjustment: 'radd',
    note: 'Pasangan tunggal → radd ke pasangan, ambil semua',
  },

  // ── 'AUL ─────────────────────────────────────────────────────────────────
  {
    name: 'AUL-1: suami + 2 saudariPrKandung (6→7)',
    deceased: 'istri',
    estate: 70_000,
    heirs: [h('suami'), h('saudariPrKandung', 2)],
    expected: { suami: '3/7', saudariPrKandung: '4/7' },
    adjustment: 'aul',
    note: '1/2+2/3=7/6 → aul 6→7',
  },
  {
    name: 'AUL-2: Mimbariyah — istri + ayah + ibu + 2 anakPr (24→27)',
    deceased: 'suami',
    estate: 270_000,
    heirs: [h('istri'), h('ayah'), h('ibu'), h('anakPr', 2)],
    expected: { istri: '3/27', ibu: '4/27', ayah: '4/27', anakPr: '16/27' },
    adjustment: 'aul',
    note: 'Kasus Mimbariyah: 1/8+1/6+1/6+2/3=27/24 → aul 24→27',
  },
  {
    name: 'AUL-3: suami + ibu + 2 saudaraSeibu + 2 saudariPrKandung (6→10)',
    deceased: 'istri',
    estate: 100_000,
    heirs: [h('suami'), h('ibu'), h('saudaraSeibu', 2), h('saudariPrKandung', 2)],
    expected: { suami: '3/10', ibu: '1/10', saudaraSeibu: '2/10', saudariPrKandung: '4/10' },
    adjustment: 'aul',
    note: '1/2+1/6+1/3+2/3=10/6 → aul 6→10',
  },

  // ── RADD ─────────────────────────────────────────────────────────────────
  {
    name: 'RADD-1: ibu + 1 anakPr (tanpa pasangan)',
    deceased: 'suami',
    estate: 100_000,
    heirs: [h('istri', 0), h('ibu'), h('anakPr')],
    expected: { ibu: '1/4', anakPr: '3/4' },
    adjustment: 'radd',
    note: 'ibu 1/6 + anak 1/2 = 2/3 → radd: ibu 1/4, anak 3/4',
  },
  {
    name: 'RADD-2: 2 anakPr saja',
    deceased: 'suami',
    estate: 100_000,
    heirs: [h('istri', 0), h('anakPr', 2)],
    expected: { anakPr: '1/1' },
    adjustment: 'radd',
    note: 'anakPr mendapat 2/3 furudh, radd → semua',
  },
  {
    name: 'RADD-3: istri + ibu + 1 saudaraSeibu',
    deceased: 'suami',
    estate: 100_000,
    heirs: [h('istri'), h('ibu'), h('saudaraSeibu')],
    expected: { istri: '1/4', ibu: '1/2', saudaraSeibu: '1/4' },
    adjustment: 'radd',
    note: 'Istri 1/4 tetap; ibu 1/3 & seibu 1/6 → radd proporsional',
  },

  // ── UMARIYATAIN ───────────────────────────────────────────────────────────
  {
    name: 'UMR-1: suami + ayah + ibu (Umariyatain)',
    deceased: 'istri',
    estate: 180_000,
    heirs: [h('suami'), h('ayah'), h('ibu')],
    expected: { suami: '1/2', ibu: '1/6', ayah: '1/3' },
    adjustment: 'none',
    note: 'Ibu 1/3 dari sisa (1/2) = 1/6; ayah sisanya 1/3',
  },
  {
    name: 'UMR-2: istri + ayah + ibu (Umariyatain)',
    deceased: 'suami',
    estate: 120_000,
    heirs: [h('istri'), h('ayah'), h('ibu')],
    expected: { istri: '1/4', ibu: '1/4', ayah: '1/2' },
    adjustment: 'none',
    note: 'Ibu 1/3 dari sisa (3/4) = 1/4; ayah sisanya 1/2',
  },
  {
    name: 'UMR-NEG: suami + ayah + ibu + 1 anakLk (bukan Umariyatain)',
    deceased: 'istri',
    estate: 240_000,
    heirs: [h('suami'), h('ayah'), h('ibu'), h('anakLk')],
    expected: { suami: '1/4', ayah: '1/6', ibu: '1/6', anakLk: '5/12' },
    adjustment: 'none',
    note: 'Ada keturunan → bukan Umariyatain',
  },

  // ── CUCU PEREMPUAN ────────────────────────────────────────────────────────
  {
    name: 'GD-1: ayah + 1 anakPr + 1 cucuPr (pelengkap 1/6)',
    deceased: 'suami',
    estate: 180_000,
    heirs: [h('istri', 0), h('ayah'), h('anakPr'), h('cucuPrDariAnakLk')],
    expected: { anakPr: '1/2', cucuPrDariAnakLk: '1/6', ayah: '1/3' },
    adjustment: 'none',
    note: 'Cucu pr 1/6 pelengkap; ayah 1/6+ashabah=1/6+(1-1/2-1/6-1/6)=1/6+1/6=1/3',
  },
  {
    name: 'GD-2: 2 anakPr + 1 cucuPr (cucu mahjub)',
    deceased: 'suami',
    estate: 100_000,
    heirs: [h('istri', 0), h('anakPr', 2), h('cucuPrDariAnakLk')],
    expected: { anakPr: '1/1', cucuPrDariAnakLk: 'mahjub' },
    adjustment: 'radd',
    note: 'Cucu pr mahjub; anakPr furudh 2/3 → radd → anakPr dapat semua',
  },
  {
    name: 'GD-3: 2 anakPr + 1 cucuPr + 1 cucuLk (cucu ashabah)',
    deceased: 'suami',
    estate: 90_000,
    heirs: [h('istri', 0), h('anakPr', 2), h('cucuPrDariAnakLk'), h('cucuLkDariAnakLk')],
    expected: { anakPr: '2/3', cucuLkDariAnakLk: '2/9', cucuPrDariAnakLk: '1/9' },
    adjustment: 'none',
    note: 'Cucu lk+pr ashabah 2:1 dari sisa 1/3',
  },

  // ── MA'AL GHAIR ───────────────────────────────────────────────────────────
  {
    name: 'MAG-1: 1 anakPr + 1 saudariPrKandung',
    deceased: 'suami',
    estate: 100_000,
    heirs: [h('istri', 0), h('anakPr'), h('saudariPrKandung')],
    expected: { anakPr: '1/2', saudariPrKandung: '1/2' },
    adjustment: 'none',
    note: 'Saudari kandung ashabah ma\'al ghair, dapat sisa 1/2',
  },
  {
    name: 'MAG-2: 2 anakPr + saudariKandung + saudariSeayah',
    deceased: 'suami',
    estate: 100_000,
    heirs: [h('istri', 0), h('anakPr', 2), h('saudariPrKandung'), h('saudariPrSeayah')],
    expected: { anakPr: '2/3', saudariPrKandung: '1/3', saudariPrSeayah: 'mahjub' },
    adjustment: 'none',
    note: 'Saudari kandung ma\'al ghair 1/3 sisa; saudari seayah mahjub oleh saudari kandung',
  },

  // ── SAUDARA SEIBU ─────────────────────────────────────────────────────────
  {
    name: 'MAT-1: 1 anakLk + saudaraSeibu (seibu mahjub)',
    deceased: 'suami',
    estate: 100_000,
    heirs: [h('istri', 0), h('anakLk'), h('saudaraSeibu', 2)],
    expected: { anakLk: '1/1', saudaraSeibu: 'mahjub' },
    adjustment: 'none',
    note: 'Keturunan memblokir saudara seibu',
  },
  {
    name: 'MAT-2: ayah + saudaraSeibu (seibu mahjub)',
    deceased: 'suami',
    estate: 100_000,
    heirs: [h('istri', 0), h('ayah'), h('saudaraSeibu', 2)],
    expected: { ayah: '1/1', saudaraSeibu: 'mahjub' },
    adjustment: 'none',
    note: 'Ayah memblokir saudara seibu',
  },

  // ── KAKEK (MUQASAMAH) ─────────────────────────────────────────────────────
  {
    name: 'GF-1: kakek + ibu + 1 anakLk',
    deceased: 'suami',
    estate: 600_000,
    heirs: [h('istri', 0), h('kakek'), h('ibu'), h('anakLk')],
    expected: { kakek: '1/6', ibu: '1/6', anakLk: '2/3' },
    adjustment: 'none',
    note: 'Kakek 1/6 furudh (ada anak laki), ibu 1/6, anak lk ashabah',
  },
  {
    name: 'GF-2: kakek + 2 saudaraLkKandung (muqasamah)',
    deceased: 'suami',
    estate: 90_000,
    heirs: [h('istri', 0), h('kakek'), h('saudaraLkKandung', 2)],
    expected: { kakek: '1/3', saudaraLkKandung: '2/3' },
    adjustment: 'none',
    note: 'Muqasamah: kakek dapat terbaik dari {1/3 sbg saudara, 1/3 sisa (=1/3 total), 1/6 total} = 1/3; saudara 2/3',
  },
  {
    name: 'GM-1: nenekDariIbu + nenekDariAyah + 1 anakLk',
    deceased: 'suami',
    estate: 600_000,
    heirs: [h('istri', 0), h('nenekDariIbu'), h('nenekDariAyah'), h('anakLk')],
    expected: { nenekDariIbu: '1/12', nenekDariAyah: '1/12', anakLk: '5/6' },
    adjustment: 'none',
    note: '2 nenek bagi 1/6 → 1/12 masing',
  },
  {
    name: 'GM-2: ibu + nenekDariIbu (nenek mahjub)',
    deceased: 'suami',
    estate: 100_000,
    heirs: [h('istri', 0), h('ibu'), h('nenekDariIbu')],
    expected: { ibu: '1/1', nenekDariIbu: 'mahjub' },
    adjustment: 'radd',
    note: 'Ibu memblokir nenek; ibu 1/3 furudh → radd → ibu dapat semua',
  },
];
