/**
 * Orchestrator: satu entry point publik untuk perhitungan faraidh.
 * Pipeline: predikat → hijab → furudh → ashabah → 'aul/radd → ashlul-masalah → nominal.
 */

import { Fraction, sumFractions } from './fraction';
import type { EstateCase, HeirResult, ScenarioResult, Status, HeirKind } from './types';
import { getLabel } from './heirs';
import { buildPredicates, resolveHijab } from './hijab';
import { assignFurudh } from './furudh';
import { distributeAshabah } from './ashabah';
import { applyAulRadd } from './aulRadd';
import { computeAshlulMasalah } from './ashlulMasalah';
import { getReason } from './reasons';

export function calculate(
  input: EstateCase,
  deceased: 'suami' | 'istri',
): ScenarioResult {
  const { estate, heirs } = input;
  const warnings: string[] = [];

  // ── Step 0: Predikat ──────────────────────────────────────────────────
  const p = buildPredicates(heirs);

  // ── Step 1: Hijab ─────────────────────────────────────────────────────
  const blocked = resolveHijab(heirs, p);

  // ── Step 2: Furudh ────────────────────────────────────────────────────
  const {
    furudh,
    ayahMode,
    kakekMode,
    ashabahMaalGhair,
    isUmariyatain,
    spouseShare,
  } = assignFurudh(heirs, blocked, p);

  const totalFurudh = sumFractions(Object.values(furudh) as Fraction[]);

  // ── Step 3: Ashabah ───────────────────────────────────────────────────
  const ashabah = distributeAshabah(
    heirs, blocked, furudh, ayahMode, kakekMode, ashabahMaalGhair, p, totalFurudh,
  );

  // ── Step 4 & 5: 'Aul & Radd ───────────────────────────────────────────
  const { adjustedFurudh, adjustment, warnings: adjWarnings } = applyAulRadd(furudh, ashabah);
  warnings.push(...adjWarnings);

  // Gabungkan semua share: furudh yang sudah disesuaikan + ashabah
  // (Setelah 'aul/radd, ashabah mungkin nol atau tetap)
  const finalShares: Partial<Record<HeirKind, Fraction>> = { ...adjustedFurudh };

  if (adjustment === 'none') {
    // Tambahkan ashabah
    for (const [k, v] of Object.entries(ashabah) as [HeirKind, Fraction][]) {
      const existing = finalShares[k];
      finalShares[k] = existing ? existing.add(v) : v;
    }
  }
  // Jika radd: ashabah tidak ada (sudah dihandle di adjustedFurudh)
  // Jika 'aul: ashabah tidak ada

  // ── Step 6: Ashlul-masalah ────────────────────────────────────────────
  const { asalMasalah: asalMasalahAsli } = computeAshlulMasalah(furudh);
  const { asalMasalah } = computeAshlulMasalah(finalShares);

  // ── Step 7: Nominal + rekonsiliasi ────────────────────────────────────
  const shareEntries = Object.entries(finalShares) as [HeirKind, Fraction][];
  const rawAmounts = shareEntries.map(([k, f]) => ({
    kind: k,
    amount: f.toNumber() * estate,
  }));
  const totalRaw = rawAmounts.reduce((s, { amount }) => s + amount, 0);
  const drift = estate - Math.round(totalRaw);

  // Pembulatan: assigned ke bagian terbesar (biasanya ashabah)
  const largestIdx = rawAmounts.reduce(
    (best, cur, i) => (cur.amount > rawAmounts[best]!.amount ? i : best),
    0,
  );
  const rounded = rawAmounts.map((r, i) => ({
    kind: r.kind,
    amount: Math.round(r.amount) + (i === largestIdx ? drift : 0),
  }));

  // ── Step 8: Susun HeirResult ──────────────────────────────────────────
  const resultMap = new Map(rounded.map(r => [r.kind, r.amount]));
  const heirResults: HeirResult[] = [];

  // Proses semua ahli waris yang diinput (count > 0)
  const inputKinds = heirs.filter(h => h.count > 0).map(h => h.kind);

  for (const kind of inputKinds) {
    const inp = heirs.find(h => h.kind === kind)!;
    const count = inp.count;
    const isBlockedResult = !!blocked[kind];
    const share = finalShares[kind] ?? Fraction.zero;
    const amount = resultMap.get(kind) ?? 0;

    let status: Status;
    if (isBlockedResult) {
      status = 'mahjub';
    } else if (ashabah[kind] && furudh[kind]) {
      status = 'furudh+ashabah';
    } else if (ashabah[kind] || (ashabahMaalGhair[kind] && !furudh[kind])) {
      status = adjustment === 'radd' ? 'radd' : 'ashabah';
    } else if (furudh[kind]) {
      status = adjustment === 'radd' && !['suami','istri'].includes(kind) ? 'radd' : 'furudh';
    } else {
      // Ahli waris tidak mendapat apa-apa (mis cucu pr tanpa hak)
      status = 'mahjub';
    }

    // Jika cucu perempuan tidak mendapat bagian (2+ anak pr tanpa cucu lk)
    if (kind === 'cucuPrDariAnakLk' && !blocked[kind] && share.isZero()) {
      status = 'mahjub';
      blocked[kind] = 'anakPr'; // blocked by daughters
    }

    const sharePerHead = count > 0 && !share.isZero()
      ? share.divBy(count)
      : Fraction.zero;

    // Tentukan apakah kakek pakai muqasamah
    const isMuqasamah = kind === 'kakek' &&
      (heirs.some(h => h.kind === 'saudaraLkKandung' && h.count > 0 && !blocked['saudaraLkKandung']) ||
       heirs.some(h => h.kind === 'saudariPrKandung' && h.count > 0 && !blocked['saudariPrKandung']));

    const reason = getReason(kind, status, {
      hasDescendant: p.hasDescendant,
      hasMaleDescendant: p.hasMaleDescendant,
      hasSon: p.hasSon,
      isUmariyatain,
      siblingCountAll: p.siblingCountAll,
      ayahMode,
      kakekMode,
      blockedBy: blocked[kind],
      nDaughter: heirs.find(h => h.kind === 'anakPr')?.count,
      nGrandson: heirs.find(h => h.kind === 'cucuLkDariAnakLk')?.count,
      nGranddaughter: heirs.find(h => h.kind === 'cucuPrDariAnakLk')?.count,
      hasCucuPrWithOneDaughter: kind === 'cucuPrDariAnakLk' && (heirs.find(h => h.kind === 'anakPr')?.count ?? 0) === 1,
      isMaalGhair: !!ashabahMaalGhair[kind],
      isMuqasamah,
    });

    heirResults.push({
      kind,
      label: getLabel(kind),
      count,
      status,
      share,
      sharePerHead,
      shareDecimal: share.toNumber(),
      amount,
      amountPerHead: count > 0 ? Math.round(amount / count) : 0,
      reason,
      blockedBy: blocked[kind],
    });
  }

  // Urutkan: status aktif dulu, kemudian mahjub
  heirResults.sort((a, b) => {
    const order = { furudh: 0, 'furudh+ashabah': 1, ashabah: 2, radd: 3, mahjub: 4 };
    return (order[a.status] ?? 5) - (order[b.status] ?? 5);
  });

  void spouseShare; // digunakan di furudh.ts via isUmariyatain

  return {
    deceased,
    estate,
    asalMasalahAsli,
    asalMasalah,
    adjustment,
    heirs: heirResults,
    warnings,
  };
}
