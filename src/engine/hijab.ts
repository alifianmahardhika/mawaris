import type { HeirInput, HeirKind, Predicates } from './types';

/** Hasil resolusi hijab: kind => terblokir oleh siapa */
export type BlockedMap = Partial<Record<HeirKind, HeirKind>>;

/**
 * Hitung predikat dasar dari daftar ahli waris yang HADIR (count > 0).
 * Predikat dihitung SEBELUM hijab karena beberapa aturan (mis. siblingCountAll
 * untuk ibu 1/6) menggunakan keberadaan walau terblokir.
 */
export function buildPredicates(heirs: HeirInput[]): Predicates {
  const has = (k: HeirKind) => heirs.some(h => h.kind === k && h.count > 0);
  const cnt = (k: HeirKind) => heirs.find(h => h.kind === k)?.count ?? 0;

  const hasSon              = has('anakLk');
  const hasGrandsonViaSon   = has('cucuLkDariAnakLk');
  const hasMaleDescendant   = hasSon || hasGrandsonViaSon;
  const hasDescendant       = hasSon || has('anakPr') || hasGrandsonViaSon || has('cucuPrDariAnakLk');
  const hasFather           = has('ayah');
  const hasGrandfather      = has('kakek');

  // siblingCountAll: jumlah KEBERADAAN saudara (bukan jumlah orangnya).
  // Dipakai untuk menentukan apakah ibu turun ke 1/6.
  // Dihitung walau saudara terblokir (hajb nuqshan — sesuai jumhur & referensi).
  const siblingKinds: HeirKind[] = [
    'saudaraLkKandung','saudariPrKandung',
    'saudaraLkSeayah','saudariPrSeayah',
    'saudaraSeibu',
  ];
  const siblingCountAll = siblingKinds.reduce((s, k) => s + (cnt(k) > 0 ? 1 : 0), 0);

  return {
    hasSon, hasGrandsonViaSon, hasMaleDescendant,
    hasDescendant, hasFather, hasGrandfather,
    siblingCountAll,
  };
}

/**
 * Resolusi hijab (hirman — blokir total).
 * Mengembalikan map: kind → kind-yang-memblokir.
 * Urutan resolusi penting; ditetapkan sesuai urutan prioritas.
 *
 * Cucu perempuan (cucuPrDariAnakLk) TIDAK diblok di sini —
 * dia bisa mengambil 1/6 pelengkap atau ashabah bersama cucu laki;
 * diputus di langkah furudh/ashabah.
 */
export function resolveHijab(heirs: HeirInput[], p: Predicates): BlockedMap {
  const blocked: BlockedMap = {};
  const has = (k: HeirKind) => heirs.some(h => h.kind === k && h.count > 0);

  // Anak laki-laki memblokir:
  if (p.hasSon) {
    block('cucuLkDariAnakLk', 'anakLk');
    block('cucuPrDariAnakLk', 'anakLk'); // tetapi lihat catatan di bawah
    blockAllSiblings('anakLk');
  }

  // Ayah memblokir:
  if (p.hasFather) {
    block('kakek', 'ayah');
    block('nenekDariAyah', 'ayah');
    blockAllSiblings('ayah');
  }

  // Ibu memblokir semua nenek:
  if (has('ibu')) {
    block('nenekDariIbu', 'ibu');
    block('nenekDariAyah', 'ibu');
  }

  // Keturunan apa pun (son/daughter/grandson/granddaughter) memblokir saudara seibu:
  if (p.hasDescendant) {
    block('saudaraSeibu', 'anakLk'); // label blocker = ahli waris mana saja yang ada
  }

  // Saudara laki-laki kandung memblokir saudara seayah:
  if (has('saudaraLkKandung') && !blocked['saudaraLkKandung']) {
    block('saudaraLkSeayah', 'saudaraLkKandung');
    block('saudariPrSeayah', 'saudaraLkKandung');
  }

  // Kakek (muqasamah Syafi'i): kakek TIDAK memblokir saudara kandung/seayah —
  // mereka berbagi (muqasamah). Kakek diblok oleh ayah (sudah di atas).
  // Saudara seibu tetap diblok oleh keturunan (sudah di atas).

  return blocked;

  function block(target: HeirKind, by: HeirKind) {
    if (!blocked[target] && has(target)) {
      blocked[target] = by;
    }
  }

  function blockAllSiblings(by: HeirKind) {
    const siblings: HeirKind[] = [
      'saudaraLkKandung','saudariPrKandung',
      'saudaraLkSeayah','saudariPrSeayah',
      'saudaraSeibu',
    ];
    for (const k of siblings) block(k, by);
  }
}

/** Apakah ahli waris ini terblokir? */
export function isBlocked(kind: HeirKind, blocked: BlockedMap): boolean {
  return !!blocked[kind];
}
