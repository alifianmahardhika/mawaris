/**
 * Langkah 2: Penetapan bagian furudh (bagian tetap).
 * Mengembalikan map HeirKind → Fraction bagian dari total harta.
 * Ahli waris yang menjadi ashabah murni TIDAK dimasukkan di sini
 * (mereka ditangani di ashabah.ts).
 */

import { Fraction } from './fraction';
import type { HeirInput, HeirKind, Predicates } from './types';
import type { BlockedMap } from './hijab';

export type FurудhMap = Partial<Record<HeirKind, Fraction>>;
export type AyahMode = 'furudh_only' | 'furudh_plus_ashabah' | 'ashabah_only';
export type AshabahMaalGhairMap = Partial<Record<HeirKind, true>>;

export interface FurудhResult {
  furudh: FurудhMap;
  /** Ayah/kakek mungkin 1/6 saja, 1/6+ashabah, atau ashabah murni */
  ayahMode: AyahMode;
  kakekMode: AyahMode;
  /** Saudari yang menjadi ashabah ma'al ghair (bersama anak/cucu perempuan) */
  ashabahMaalGhair: AshabahMaalGhairMap;
  /** Apakah Umariyatain berlaku? */
  isUmariyatain: boolean;
  /** Bagian furudh pasangan (untuk Umariyatain) */
  spouseShare: Fraction;
}

// Helper: apakah ada pasangan (suami/istri) yang tidak terblokir?
function getSpouseShare(
  heirs: HeirInput[],
  blocked: BlockedMap,
  p: Predicates,
): { kind: HeirKind | null; share: Fraction } {
  const hasSpouse = (k: HeirKind) =>
    heirs.some(h => h.kind === k && h.count > 0) && !blocked[k];

  if (hasSpouse('suami')) {
    return { kind: 'suami', share: p.hasDescendant ? Fraction.of(1, 4) : Fraction.of(1, 2) };
  }
  if (hasSpouse('istri')) {
    return { kind: 'istri', share: p.hasDescendant ? Fraction.of(1, 8) : Fraction.of(1, 4) };
  }
  return { kind: null, share: Fraction.zero };
}

export function assignFurudh(
  heirs: HeirInput[],
  blocked: BlockedMap,
  p: Predicates,
): FurудhResult {
  const furudh: FurудhMap = {};
  const ashabahMaalGhair: AshabahMaalGhairMap = {};
  let ayahMode: AyahMode = 'ashabah_only';
  let kakekMode: AyahMode = 'ashabah_only';
  let isUmariyatain = false;

  const has = (k: HeirKind) =>
    heirs.some(h => h.kind === k && h.count > 0) && !blocked[k];
  const cnt = (k: HeirKind) =>
    heirs.find(h => h.kind === k)?.count ?? 0;

  // ── Pasangan ──────────────────────────────────────────────────────────────
  const { kind: spouseKind, share: spouseShare } = getSpouseShare(heirs, blocked, p);
  if (spouseKind) furudh[spouseKind] = spouseShare;

  // ── Deteksi Umariyatain ───────────────────────────────────────────────────
  // Berlaku bila: tepat {pasangan, ayah, ibu} yang aktif — tidak ada keturunan,
  // tidak ada ahli waris aktif lain.
  const activeNonSpouseNonParent = heirs.filter(h =>
    h.count > 0 &&
    !blocked[h.kind] &&
    h.kind !== spouseKind &&
    h.kind !== 'ayah' &&
    h.kind !== 'ibu',
  );
  if (
    spouseKind !== null &&
    !p.hasDescendant &&
    has('ayah') && has('ibu') &&
    activeNonSpouseNonParent.length === 0
  ) {
    isUmariyatain = true;
  }

  // ── Ibu ───────────────────────────────────────────────────────────────────
  if (has('ibu')) {
    if (isUmariyatain) {
      // Ibu mendapat 1/3 dari SISA setelah pasangan
      const sisa = Fraction.one.sub(spouseShare);
      furudh['ibu'] = sisa.divBy(3);
    } else if (p.hasDescendant || p.siblingCountAll >= 2) {
      furudh['ibu'] = Fraction.of(1, 6);
    } else {
      furudh['ibu'] = Fraction.of(1, 3);
    }
  }

  // ── Ayah ──────────────────────────────────────────────────────────────────
  if (has('ayah')) {
    if (p.hasMaleDescendant) {
      // Ada anak/cucu laki → ayah hanya 1/6
      furudh['ayah'] = Fraction.of(1, 6);
      ayahMode = 'furudh_only';
    } else if (p.hasDescendant) {
      // Ada anak/cucu perempuan tapi tidak ada yang laki → 1/6 + sisa
      furudh['ayah'] = Fraction.of(1, 6);
      ayahMode = 'furudh_plus_ashabah';
    } else {
      // Tidak ada keturunan → ashabah murni (ditangani di ashabah.ts)
      ayahMode = 'ashabah_only';
    }
  }

  // ── Kakek (menggantikan ayah jika ayah tidak ada) ────────────────────────
  if (has('kakek') && !has('ayah')) {
    if (p.hasMaleDescendant) {
      furudh['kakek'] = Fraction.of(1, 6);
      kakekMode = 'furudh_only';
    } else if (p.hasDescendant) {
      furudh['kakek'] = Fraction.of(1, 6);
      kakekMode = 'furudh_plus_ashabah';
    } else {
      kakekMode = 'ashabah_only';
    }
  }

  // ── Nenek ─────────────────────────────────────────────────────────────────
  const nenekCount = (has('nenekDariIbu') ? 1 : 0) + (has('nenekDariAyah') ? 1 : 0);
  if (nenekCount > 0) {
    const perNenek = Fraction.of(1, 6 * nenekCount); // 1/6 dibagi rata
    if (has('nenekDariIbu'))  furudh['nenekDariIbu']  = perNenek;
    if (has('nenekDariAyah')) furudh['nenekDariAyah'] = perNenek;
  }

  // ── Anak perempuan ────────────────────────────────────────────────────────
  if (has('anakPr')) {
    if (p.hasSon) {
      // Ashabah bersama anak laki-laki → ditangani di ashabah.ts
    } else {
      const nDaughter = cnt('anakPr');
      if (nDaughter === 1) {
        furudh['anakPr'] = Fraction.of(1, 2);
      } else {
        furudh['anakPr'] = Fraction.of(2, 3);
      }
    }
  }

  // ── Cucu perempuan (dari anak laki) ──────────────────────────────────────
  // Hanya relevan jika tidak ada anak laki-laki (sudah terblokir oleh anak laki).
  if (has('cucuPrDariAnakLk') && !p.hasSon) {
    const hasCucuLk = has('cucuLkDariAnakLk');
    const nDaughter = cnt('anakPr');   // jumlah anak perempuan
    const nGrandson = cnt('cucuLkDariAnakLk');
    const nGranddaughter = cnt('cucuPrDariAnakLk');

    if (hasCucuLk) {
      // Ashabah bersama cucu laki-laki → ditangani di ashabah.ts
    } else if (!p.hasSon && nDaughter === 0) {
      // Tidak ada anak laki, tidak ada anak perempuan → cucu perempuan seperti anak perempuan
      if (nGranddaughter === 1) {
        furudh['cucuPrDariAnakLk'] = Fraction.of(1, 2);
      } else {
        furudh['cucuPrDariAnakLk'] = Fraction.of(2, 3);
      }
    } else if (nDaughter === 1) {
      // Tepat 1 anak perempuan → cucu perempuan mendapat 1/6 pelengkap (melengkapi ke 2/3)
      furudh['cucuPrDariAnakLk'] = Fraction.of(1, 6);
    } else {
      // 2+ anak perempuan tanpa cucu laki → cucu perempuan mahjub
      // (sudah terblokir di hijab atau dibiarkan tanpa furudh/ashabah)
      // Tidak diberi furudh — akan muncul sebagai mahjub di hasil akhir
    }
    void nGrandson; // dipakai implisit via has()
  }

  // ── Saudara/saudari seibu ─────────────────────────────────────────────────
  if (has('saudaraSeibu') && !blocked['saudaraSeibu']) {
    const n = cnt('saudaraSeibu');
    if (n === 1) {
      furudh['saudaraSeibu'] = Fraction.of(1, 6);
    } else {
      furudh['saudaraSeibu'] = Fraction.of(1, 3); // dibagi rata per orang di reasons
    }
  }

  // ── Saudari kandung ───────────────────────────────────────────────────────
  if (has('saudariPrKandung') && !blocked['saudariPrKandung']) {
    const hasBrotherKandung = has('saudaraLkKandung') && !blocked['saudaraLkKandung'];

    if (hasBrotherKandung) {
      // Ashabah bersama saudara kandung → ashabah.ts
    } else {
      // Apakah ada anak/cucu perempuan? → ashabah ma'al ghair
      const hasFemaleDescendant =
        (has('anakPr') && !blocked['anakPr']) ||
        (has('cucuPrDariAnakLk') && !blocked['cucuPrDariAnakLk']);

      if (hasFemaleDescendant) {
        // Ashabah ma'al ghair — dapat sisa; tidak diberi furudh tetap
        ashabahMaalGhair['saudariPrKandung'] = true;
        // Saudari seayah terblokir oleh saudari kandung yang jadi ashabah ma'al ghair
        if (has('saudariPrSeayah') && !blocked['saudariPrSeayah']) {
          blocked['saudariPrSeayah'] = 'saudariPrKandung';
        }
      } else {
        const n = cnt('saudariPrKandung');
        if (n === 1) {
          furudh['saudariPrKandung'] = Fraction.of(1, 2);
        } else {
          furudh['saudariPrKandung'] = Fraction.of(2, 3);
        }
      }
    }
  }

  // ── Saudari seayah ────────────────────────────────────────────────────────
  if (has('saudariPrSeayah') && !blocked['saudariPrSeayah']) {
    const hasBrotherSeayah = has('saudaraLkSeayah') && !blocked['saudaraLkSeayah'];
    const saudariKandungShare = furudh['saudariPrKandung'];

    if (hasBrotherSeayah) {
      // Ashabah bersama saudara seayah → ashabah.ts
    } else if (ashabahMaalGhair['saudariPrKandung']) {
      // Saudari kandung sudah ashabah ma'al ghair → saudari seayah terblokir
      blocked['saudariPrSeayah'] = 'saudariPrKandung';
    } else if (saudariKandungShare?.eq(Fraction.of(2, 3))) {
      // Saudari kandung sudah 2/3 → saudari seayah mahjub
      blocked['saudariPrSeayah'] = 'saudariPrKandung';
    } else if (saudariKandungShare?.eq(Fraction.of(1, 2))) {
      // Saudari kandung 1/2 → saudari seayah mendapat 1/6 pelengkap
      furudh['saudariPrSeayah'] = Fraction.of(1, 6);
    } else {
      // Tidak ada saudari kandung → seperti saudari kandung
      const hasFemaleDescendant =
        (has('anakPr') && !blocked['anakPr']) ||
        (has('cucuPrDariAnakLk') && !blocked['cucuPrDariAnakLk']);

      if (hasFemaleDescendant) {
        ashabahMaalGhair['saudariPrSeayah'] = true;
      } else {
        const n = cnt('saudariPrSeayah');
        if (n === 1) {
          furudh['saudariPrSeayah'] = Fraction.of(1, 2);
        } else {
          furudh['saudariPrSeayah'] = Fraction.of(2, 3);
        }
      }
    }
  }

  return { furudh, ayahMode, kakekMode, ashabahMaalGhair, isUmariyatain, spouseShare };
}
