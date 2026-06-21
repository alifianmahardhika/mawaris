import type { HeirKind } from './types';

/** Metadata tiap jenis ahli waris */
export interface HeirMeta {
  kind: HeirKind;
  label: string;   // Bahasa Indonesia
  gender: 'L' | 'P' | 'LP'; // LP = campuran / tidak dibedakan
  order: number;   // urutan tampil (lebih kecil = lebih awal)
}

export const HEIR_META: Record<HeirKind, HeirMeta> = {
  suami:              { kind: 'suami',              label: 'Suami',                          gender: 'L',  order: 1  },
  istri:              { kind: 'istri',              label: 'Istri',                          gender: 'P',  order: 1  },
  anakLk:             { kind: 'anakLk',             label: 'Anak Laki-laki',                 gender: 'L',  order: 2  },
  anakPr:             { kind: 'anakPr',             label: 'Anak Perempuan',                 gender: 'P',  order: 3  },
  cucuLkDariAnakLk:   { kind: 'cucuLkDariAnakLk',  label: 'Cucu Laki-laki (dari Anak Laki)',gender: 'L',  order: 4  },
  cucuPrDariAnakLk:   { kind: 'cucuPrDariAnakLk',  label: 'Cucu Perempuan (dari Anak Laki)',gender: 'P',  order: 5  },
  ayah:               { kind: 'ayah',               label: 'Ayah',                           gender: 'L',  order: 6  },
  ibu:                { kind: 'ibu',                label: 'Ibu',                            gender: 'P',  order: 7  },
  kakek:              { kind: 'kakek',              label: 'Kakek (dari Ayah)',              gender: 'L',  order: 8  },
  nenekDariIbu:       { kind: 'nenekDariIbu',       label: 'Nenek (dari Ibu)',               gender: 'P',  order: 9  },
  nenekDariAyah:      { kind: 'nenekDariAyah',      label: 'Nenek (dari Ayah)',              gender: 'P',  order: 10 },
  saudaraLkKandung:   { kind: 'saudaraLkKandung',  label: 'Saudara Laki-laki Kandung',      gender: 'L',  order: 11 },
  saudariPrKandung:   { kind: 'saudariPrKandung',  label: 'Saudari Perempuan Kandung',      gender: 'P',  order: 12 },
  saudaraLkSeayah:    { kind: 'saudaraLkSeayah',   label: 'Saudara Laki-laki Seayah',       gender: 'L',  order: 13 },
  saudariPrSeayah:    { kind: 'saudariPrSeayah',   label: 'Saudari Perempuan Seayah',       gender: 'P',  order: 14 },
  saudaraSeibu:       { kind: 'saudaraSeibu',       label: 'Saudara/Saudari Seibu',          gender: 'LP', order: 15 },
};

export function getLabel(kind: HeirKind): string {
  return HEIR_META[kind].label;
}
