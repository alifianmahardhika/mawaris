import type { Fraction } from './fraction';

/** Semua jenis ahli waris yang didukung */
export type HeirKind =
  | 'suami'
  | 'istri'
  | 'anakLk'             // anak laki-laki
  | 'anakPr'             // anak perempuan
  | 'cucuLkDariAnakLk'  // cucu laki-laki dari anak laki-laki
  | 'cucuPrDariAnakLk'  // cucu perempuan dari anak laki-laki
  | 'ayah'
  | 'ibu'
  | 'kakek'              // kakek (ayahnya ayah)
  | 'nenekDariIbu'       // nenek (ibunya ibu) — jalur ibu
  | 'nenekDariAyah'      // nenek (ibunya ayah) — jalur ayah
  | 'saudaraLkKandung'  // saudara laki-laki kandung (seayah-seibu)
  | 'saudariPrKandung'  // saudari perempuan kandung
  | 'saudaraLkSeayah'   // saudara laki-laki seayah
  | 'saudariPrSeayah'   // saudari perempuan seayah
  | 'saudaraSeibu';     // saudara/saudari seibu (L+P, bagi rata)

/** Input: satu jenis ahli waris + jumlah orang */
export interface HeirInput {
  kind: HeirKind;
  count: number; // 0 = tidak ada / tidak dimasukkan
}

/** Input satu skenario (siapa yang wafat + daftar ahli waris + nominal harta) */
export interface EstateCase {
  estate: number;        // nominal harta dalam IDR
  heirs: HeirInput[];
}

/** Status ahli waris dalam pembagian */
export type Status =
  | 'furudh'         // mendapat bagian tetap
  | 'ashabah'        // mendapat sisa (ashabah)
  | 'furudh+ashabah' // ayah: 1/6 + sisa
  | 'radd'           // mendapat tambahan radd
  | 'mahjub';        // terhalang (tidak mendapat apa-apa)

/** Hasil per-ahli waris */
export interface HeirResult {
  kind: HeirKind;
  label: string;           // label Bahasa Indonesia
  count: number;
  status: Status;
  share: Fraction;         // total bagian (0 jika mahjub)
  sharePerHead: Fraction;  // bagian per orang
  shareDecimal: number;    // desimal 0-1
  amount: number;          // nominal IDR total
  amountPerHead: number;   // nominal IDR per orang
  reason: string;          // penjelasan Bahasa Indonesia
  blockedBy?: HeirKind;    // jika mahjub, siapa yang menghalangi
}

/** Hasil satu skenario lengkap */
export interface ScenarioResult {
  deceased: 'suami' | 'istri';
  estate: number;
  asalMasalahAsli: number;  // LCM sebelum 'aul
  asalMasalah: number;      // LCM setelah 'aul (sama jika tidak 'aul)
  adjustment: 'none' | 'aul' | 'radd';
  heirs: HeirResult[];      // termasuk yang mahjub
  warnings: string[];
}

/** Predikat yang diturunkan dari daftar ahli waris aktif */
export interface Predicates {
  hasSon: boolean;
  hasGrandsonViaSon: boolean;
  hasMaleDescendant: boolean;   // son OR grandson-via-son
  hasDescendant: boolean;       // fara' waris: son/daughter/grandson/granddaughter
  hasFather: boolean;
  hasGrandfather: boolean;
  siblingCountAll: number;      // jumlah KEBERADAAN saudara (walau terblokir)
}
