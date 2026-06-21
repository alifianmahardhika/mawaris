/**
 * Langkah 3: Distribusi ashabah (sisa harta).
 * Termasuk muqasamah kakek (jumhur/Syafi'i).
 */

import { Fraction, sumFractions } from './fraction';
import type { HeirInput, HeirKind, Predicates } from './types';
import type { BlockedMap } from './hijab';
import type { FurудhMap, AyahMode, AshabahMaalGhairMap } from './furudh';

export type AshabahMap = Partial<Record<HeirKind, Fraction>>;


export function distributeAshabah(
  heirs: HeirInput[],
  blocked: BlockedMap,
  furudh: FurудhMap,
  ayahMode: AyahMode,
  kakekMode: AyahMode,
  ashabahMaalGhair: AshabahMaalGhairMap,
  p: Predicates,
  totalFurudh: Fraction,
): AshabahMap {
  const result: AshabahMap = {};
  const sisa = Fraction.one.sub(totalFurudh);

  if (sisa.isZero()) return result;

  const has = (k: HeirKind) =>
    heirs.some(h => h.kind === k && h.count > 0) && !blocked[k];
  const cnt = (k: HeirKind) =>
    heirs.find(h => h.kind === k)?.count ?? 0;

  // ── Tier 1: Anak laki-laki + anak perempuan ────────────────────────────
  const hasSon = has('anakLk');
  const hasDaughter = has('anakPr');
  if (hasSon || (hasDaughter && furudh['anakPr'] === undefined && !furudh['anakPr'])) {
    // Jika ada anak laki, anak perempuan pun jadi ashabah (2:1)
    if (hasSon) {
      const nSon = cnt('anakLk');
      const nDau = hasDaughter ? cnt('anakPr') : 0;
      const parts = nSon * 2 + nDau; // total unit
      if (parts === 0) return result;
      result['anakLk'] = sisa.scale(nSon * 2).divBy(parts);
      if (hasDaughter && nDau > 0) {
        result['anakPr'] = sisa.scale(nDau).divBy(parts);
      }
      return result;
    }
  }

  // Jika anak perempuan sudah dapat furudh (1/2 atau 2/3), cek ayah furudh+ashabah
  // Ayah furudh+ashabah: sudah ada 1/6 di furudh, sisanya untuk ayah
  if (ayahMode === 'furudh_plus_ashabah' && has('ayah')) {
    // Hanya tambahkan ke ashabah jika memang ada sisa positif.
    // Jika sisa negatif atau nol (kasus 'aul), ayah cukup dengan 1/6 furudh saja.
    if (sisa.isPositive()) {
      result['ayah'] = sisa;
    }
    return result;
  }

  // ── Tier 2: Cucu laki + cucu perempuan (via anak laki) ────────────────
  const hasCucuLk = has('cucuLkDariAnakLk');
  const hasCucuPr = has('cucuPrDariAnakLk') && furudh['cucuPrDariAnakLk'] === undefined;
  if (hasCucuLk) {
    const nCucuLk = cnt('cucuLkDariAnakLk');
    const nCucuPr = hasCucuPr ? cnt('cucuPrDariAnakLk') : 0;
    const parts = nCucuLk * 2 + nCucuPr;
    if (parts > 0) {
      result['cucuLkDariAnakLk'] = sisa.scale(nCucuLk * 2).divBy(parts);
      if (nCucuPr > 0) {
        result['cucuPrDariAnakLk'] = sisa.scale(nCucuPr).divBy(parts);
      }
    }
    return result;
  }

  // ── Tier 3: Ayah (ashabah murni) ──────────────────────────────────────
  if (ayahMode === 'ashabah_only' && has('ayah')) {
    result['ayah'] = sisa;
    return result;
  }

  // ── Tier 4: Kakek (mungkin muqasamah) + saudara kandung ───────────────
  const hasKakek = has('kakek') && kakekMode !== 'furudh_only';
  const hasSaudaraLkKandung = has('saudaraLkKandung');
  const hasSaudariPrKandung = has('saudariPrKandung') &&
    furudh['saudariPrKandung'] === undefined &&
    !ashabahMaalGhair['saudariPrKandung'];
  const hasSaudariKandungMaalGhair = !!ashabahMaalGhair['saudariPrKandung'] &&
    has('saudariPrKandung');
  const hasSaudariSeayahMaalGhair = !!ashabahMaalGhair['saudariPrSeayah'] &&
    has('saudariPrSeayah');

  // Ashabah ma'al ghair (saudari kandung/seayah bersama anak/cucu perempuan):
  // Sisa dibagi di antara mereka saja
  if (hasSaudariKandungMaalGhair && !hasSaudaraLkKandung && !hasKakek) {
    result['saudariPrKandung'] = sisa;
    return result;
  }
  if (hasSaudariSeayahMaalGhair && !has('saudaraLkSeayah') && !hasKakek && !hasSaudaraLkKandung) {
    result['saudariPrSeayah'] = sisa;
    return result;
  }

  if (hasKakek) {
    const hasSiblings = hasSaudaraLkKandung || hasSaudariPrKandung;
    if (hasSiblings) {
      // Muqasamah (jumhur/Syafi'i):
      // Kakek ambil terbaik dari: (a) bagi rata sebagai saudara, (b) 1/3 sisa, (c) 1/6 harta
      distributeWithMuqasamah(
        sisa, heirs, blocked, furudh, p,
        hasSaudaraLkKandung, hasSaudariPrKandung,
        result,
      );
    } else {
      // Kakek sendirian: ambil semua sisa
      result['kakek'] = sisa;
    }
    return result;
  }

  // ── Saudara/saudari kandung (tanpa kakek) ─────────────────────────────
  if (hasSaudaraLkKandung || hasSaudariPrKandung || hasSaudariKandungMaalGhair) {
    if (hasSaudaraLkKandung) {
      const nBro = cnt('saudaraLkKandung');
      const nSis = hasSaudariPrKandung ? cnt('saudariPrKandung') : 0;
      const parts = nBro * 2 + nSis;
      if (parts > 0) {
        result['saudaraLkKandung'] = sisa.scale(nBro * 2).divBy(parts);
        if (nSis > 0) result['saudariPrKandung'] = sisa.scale(nSis).divBy(parts);
      }
    } else if (hasSaudariKandungMaalGhair) {
      result['saudariPrKandung'] = sisa;
    } else {
      // Hanya saudari kandung (furudh 1/2 atau 2/3 sudah ditetapkan, tidak masuk sini)
    }
    return result;
  }

  // ── Tier 5: Saudara/saudari seayah ────────────────────────────────────
  const hasSaudaraLkSeayah = has('saudaraLkSeayah') && !blocked['saudaraLkSeayah'];
  const hasSaudariPrSeayah = has('saudariPrSeayah') &&
    furudh['saudariPrSeayah'] === undefined &&
    !blocked['saudariPrSeayah'] &&
    !ashabahMaalGhair['saudariPrSeayah'];

  if (hasSaudaraLkSeayah || hasSaudariPrSeayah || hasSaudariSeayahMaalGhair) {
    if (hasSaudaraLkSeayah) {
      const nBro = cnt('saudaraLkSeayah');
      const nSis = hasSaudariPrSeayah ? cnt('saudariPrSeayah') : 0;
      const parts = nBro * 2 + nSis;
      if (parts > 0) {
        result['saudaraLkSeayah'] = sisa.scale(nBro * 2).divBy(parts);
        if (nSis > 0) result['saudariPrSeayah'] = sisa.scale(nSis).divBy(parts);
      }
    } else if (hasSaudariSeayahMaalGhair) {
      result['saudariPrSeayah'] = sisa;
    }
    return result;
  }

  return result;
}

/**
 * Distribusi muqasamah: kakek bersama saudara kandung (tanpa ayah).
 * Kakek ambil terbaik dari 3 opsi, saudara dapat sisanya.
 */
function distributeWithMuqasamah(
  sisa: Fraction,
  heirs: HeirInput[],
  _blocked: BlockedMap,
  _furudh: FurудhMap,
  _p: Predicates,
  hasBro: boolean,
  hasSis: boolean,
  result: AshabahMap,
) {
  const cnt = (k: HeirKind) =>
    heirs.find(h => h.kind === k)?.count ?? 0;

  const nBro = hasBro ? cnt('saudaraLkKandung') : 0;
  const nSis = hasSis ? cnt('saudariPrKandung') : 0;
  // Kakek dihitung sebagai 1 saudara laki (unit 2)
  const totalUnits = 2 + nBro * 2 + nSis; // kakek + saudara

  // Opsi a: muqasamah (kakek = bagiannya sebagai 1 "saudara laki")
  const optA = sisa.scale(2).divBy(totalUnits);
  // Opsi b: 1/3 sisa
  const optB = sisa.divBy(3);
  // Opsi c: 1/6 harta penuh
  const optC = Fraction.of(1, 6);

  // Kakek ambil yang terbesar
  const kakekShare = [optA, optB, optC].reduce((best, cur) =>
    cur.gt(best) ? cur : best,
  );

  result['kakek'] = kakekShare;

  const saudara = sisa.sub(kakekShare);
  if (!saudara.isZero()) {
    if (hasBro) {
      const parts = nBro * 2 + nSis;
      if (parts > 0) {
        result['saudaraLkKandung'] = saudara.scale(nBro * 2).divBy(parts);
        if (hasSis && nSis > 0) {
          result['saudariPrKandung'] = saudara.scale(nSis).divBy(parts);
        }
      }
    } else if (hasSis) {
      result['saudariPrKandung'] = saudara;
    }
  }

  void sumFractions; // suppress unused warning
}
