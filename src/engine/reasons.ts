/**
 * Kalimat alasan (Bahasa Indonesia) per cabang aturan.
 */

import type { HeirKind, Status } from './types';
import type { AyahMode } from './furudh';
import { getLabel } from './heirs';

export function getReason(
  kind: HeirKind,
  status: Status,
  ctx: {
    hasDescendant: boolean;
    hasMaleDescendant: boolean;
    hasSon: boolean;
    isUmariyatain: boolean;
    siblingCountAll: number;
    ayahMode: AyahMode;
    kakekMode: AyahMode;
    blockedBy?: HeirKind;
    nDaughter?: number;
    nGrandson?: number;
    nGranddaughter?: number;
    hasCucuPrWithOneDaughter?: boolean;
    isMaalGhair?: boolean;
    isMuqasamah?: boolean;
  },
): string {
  if (status === 'mahjub') {
    const blocker = ctx.blockedBy ? getLabel(ctx.blockedBy) : 'ahli waris lain';
    return `Terhalang (mahjub) oleh ${blocker}; tidak mendapat bagian.`;
  }

  switch (kind) {
    case 'suami':
      return ctx.hasDescendant
        ? 'Suami mendapat 1/4 karena almarhum (istri) memiliki keturunan (fara\' waris).'
        : 'Suami mendapat 1/2 karena almarhum (istri) tidak memiliki keturunan.';

    case 'istri':
      return ctx.hasDescendant
        ? 'Istri mendapat 1/8 karena almarhum (suami) memiliki keturunan (fara\' waris).'
        : 'Istri mendapat 1/4 karena almarhum (suami) tidak memiliki keturunan.';

    case 'anakLk':
      return 'Anak laki-laki menjadi ashabah (mendapat sisa harta), dengan bagian 2× anak perempuan.';

    case 'anakPr':
      if (ctx.hasSon) return 'Anak perempuan menjadi ashabah bersama anak laki-laki (2:1).';
      if ((ctx.nDaughter ?? 0) === 1) return 'Anak perempuan tunggal mendapat 1/2 harta.';
      return 'Dua atau lebih anak perempuan (tanpa anak laki) mendapat 2/3 harta bersama.';

    case 'cucuLkDariAnakLk':
      return 'Cucu laki-laki (dari anak laki) menjadi ashabah menggantikan anak laki-laki yang tidak ada.';

    case 'cucuPrDariAnakLk':
      if (ctx.hasSon) return 'Cucu perempuan terhalang oleh anak laki-laki.';
      if (ctx.isMaalGhair) return 'Cucu perempuan menjadi ashabah bersama cucu laki-laki (2:1).';
      if (ctx.hasCucuPrWithOneDaughter) return 'Cucu perempuan mendapat 1/6 sebagai pelengkap 2/3 (bersama 1 anak perempuan), karena tidak ada cucu laki-laki.';
      if ((ctx.nGranddaughter ?? 0) === 1) return 'Cucu perempuan tunggal mendapat 1/2 (tidak ada anak, tidak ada cucu laki).';
      return 'Dua atau lebih cucu perempuan mendapat 2/3 bersama (tidak ada anak, tidak ada cucu laki).';

    case 'ayah':
      if (ctx.ayahMode === 'furudh_only') return 'Ayah mendapat 1/6 karena almarhum memiliki keturunan laki-laki (anak/cucu laki).';
      if (ctx.ayahMode === 'furudh_plus_ashabah') return 'Ayah mendapat 1/6 ditambah sisa harta, karena almarhum hanya memiliki keturunan perempuan (tanpa anak/cucu laki).';
      return 'Ayah menjadi ashabah (mendapat sisa harta) karena almarhum tidak memiliki keturunan.';

    case 'ibu':
      if (ctx.isUmariyatain) return 'Ibu mendapat 1/3 dari sisa (setelah bagian pasangan) — kasus Umariyatain/Gharrawain: ahli waris hanya pasangan, ayah, dan ibu.';
      if (ctx.hasDescendant) return 'Ibu mendapat 1/6 karena almarhum memiliki keturunan (fara\' waris).';
      if (ctx.siblingCountAll >= 2) return 'Ibu mendapat 1/6 karena almarhum memiliki 2 atau lebih saudara (walau saudara terblokir).';
      return 'Ibu mendapat 1/3 karena almarhum tidak memiliki keturunan dan tidak ada 2+ saudara.';

    case 'kakek':
      if (ctx.isMuqasamah) return 'Kakek mendapat bagian terbaik dari muqasamah (bagi rata dengan saudara kandung), 1/3 sisa, atau 1/6 harta — sesuai madzhab Syafi\'i/jumhur.';
      if (ctx.kakekMode === 'furudh_only') return 'Kakek mendapat 1/6 (menggantikan ayah yang tidak ada), karena almarhum memiliki keturunan laki-laki.';
      if (ctx.kakekMode === 'furudh_plus_ashabah') return 'Kakek mendapat 1/6 ditambah sisa (menggantikan ayah yang tidak ada), karena almarhum hanya memiliki keturunan perempuan.';
      return 'Kakek menjadi ashabah (menggantikan ayah yang tidak ada), karena almarhum tidak memiliki keturunan.';

    case 'nenekDariIbu':
    case 'nenekDariAyah':
      return 'Nenek mendapat 1/6 (dibagi rata jika ada dua nenek dari jalur berbeda).';

    case 'saudaraSeibu':
      return ctx.siblingCountAll === 1
        ? 'Saudara/saudari seibu tunggal mendapat 1/6 (L dan P mendapat sama).'
        : 'Dua atau lebih saudara/saudari seibu mendapat 1/3 bersama (L dan P mendapat sama).';

    case 'saudaraLkKandung':
      return 'Saudara laki-laki kandung menjadi ashabah (mendapat sisa harta).';

    case 'saudariPrKandung':
      if (ctx.isMaalGhair) return 'Saudari kandung menjadi ashabah ma\'al ghair (mendapat sisa bersama anak/cucu perempuan pewaris).';
      return 'Saudari kandung mendapat bagian tetap (1/2 atau 2/3), karena tidak ada saudara kandung laki-laki atau ashabah ma\'al ghair.';

    case 'saudaraLkSeayah':
      return 'Saudara laki-laki seayah menjadi ashabah (mendapat sisa), karena tidak ada saudara kandung yang menghalangi.';

    case 'saudariPrSeayah':
      if (ctx.isMaalGhair) return 'Saudari seayah menjadi ashabah ma\'al ghair (mendapat sisa bersama anak/cucu perempuan pewaris).';
      return 'Saudari seayah mendapat bagian (1/2, 2/3, atau 1/6 pelengkap), karena tidak ada saudara/saudari kandung yang menghalangi.';

    default:
      return 'Mendapat bagian sesuai ketentuan faraidh.';
  }
}
