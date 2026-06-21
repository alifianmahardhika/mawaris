import { useState, useMemo } from 'react';

/* ── Types ─────────────────────────────────────────────────────────────── */

interface Term {
  id: string;
  arabic?: string;
  term: string;
  category: Category;
  definition: string;
  example?: string;
  related?: string[]; // id of related terms
}

type Category =
  | 'umum'
  | 'ahliWaris'
  | 'bagian'
  | 'hijab'
  | 'perhitungan'
  | 'kasusKhusus';

const CATEGORY_META: Record<Category, { label: string; color: string; icon: string }> = {
  umum:         { label: 'Istilah Umum',          color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200',     icon: '📖' },
  ahliWaris:    { label: 'Ahli Waris',             color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',  icon: '👥' },
  bagian:       { label: 'Bagian & Hak Waris',     color: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300', icon: '🔢' },
  hijab:        { label: 'Hijab & Penghalang',     color: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',     icon: '🚫' },
  perhitungan:  { label: 'Metode Perhitungan',     color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300', icon: '🧮' },
  kasusKhusus:  { label: 'Kasus & Nama Khusus',   color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300', icon: '⭐' },
};

/* ── Data ───────────────────────────────────────────────────────────────── */

const TERMS: Term[] = [
  // ── UMUM ────────────────────────────────────────────────────────────────
  {
    id: 'mawaris',
    arabic: 'مواريث',
    term: 'Mawaris / Mawarits',
    category: 'umum',
    definition: 'Jamak dari "miras" (ميراث). Ilmu yang membahas harta peninggalan seseorang yang wafat dan tata cara pembagiannya kepada ahli waris sesuai hukum Islam. Sinonim dengan kata "faraidh".',
    related: ['faraidh', 'tirkah'],
  },
  {
    id: 'faraidh',
    arabic: 'فرائض',
    term: 'Faraidh / Fara\'id',
    category: 'umum',
    definition: 'Jamak dari "faridah" (فريضة), artinya "yang diwajibkan" atau "yang ditentukan". Merujuk pada ilmu pembagian warisan Islam yang mengatur bagian-bagian tetap yang telah Allah tetapkan dalam Al-Qur\'an (QS. An-Nisa: 11–12 dan 176).',
    related: ['mawaris', 'furudh'],
  },
  {
    id: 'muwarris',
    arabic: 'مورّث',
    term: 'Muwarris / Pewaris',
    category: 'umum',
    definition: 'Orang yang meninggal dunia dan meninggalkan harta serta ahli waris. Seluruh perhitungan faraidh bertolak dari posisi dan keadaan muwarris: apakah ia punya anak, istri/suami, orang tua, dan seterusnya.',
    example: 'Dalam kalkulator ini, "Jika Suami Wafat" berarti suami sebagai muwarris.',
  },
  {
    id: 'warits',
    arabic: 'وارث',
    term: 'Warits / Ahli Waris',
    category: 'umum',
    definition: 'Orang yang berhak menerima harta peninggalan muwarris. Syarat menjadi ahli waris: (1) masih hidup saat muwarris wafat, (2) ada hubungan yang sah (nasab, pernikahan, atau wala\'), (3) tidak terhalang (mahjub hirman).',
    related: ['mahjub'],
  },
  {
    id: 'tirkah',
    arabic: 'تركة',
    term: 'Tirkah / Harta Peninggalan',
    category: 'umum',
    definition: 'Seluruh harta yang ditinggalkan muwarris setelah dikurangi: biaya pengurusan jenazah, pelunasan utang, dan pelaksanaan wasiat (maksimal 1/3 harta untuk non-ahli waris). Sisa itulah yang dibagi kepada ahli waris.',
    example: 'Harta bruto Rp 300 jt − utang Rp 50 jt − wasiat Rp 10 jt = tirkah Rp 240 jt yang dibagi.',
  },
  {
    id: 'wasiat',
    arabic: 'وصية',
    term: 'Wasiat',
    category: 'umum',
    definition: 'Pemberian harta seseorang kepada pihak lain yang berlaku setelah ia wafat. Wasiat kepada bukan ahli waris dibatasi maksimal 1/3 harta. Wasiat kepada ahli waris tidak sah kecuali disetujui seluruh ahli waris lainnya.',
  },
  {
    id: 'nasab',
    arabic: 'نسب',
    term: 'Nasab / Hubungan Darah',
    category: 'umum',
    definition: 'Ikatan kekerabatan berdasarkan garis keturunan. Salah satu dari tiga sebab kewarisan: nasab (darah), mushaharah (pernikahan), dan wala\' (hubungan perwalian karena memerdekakan budak).',
  },
  {
    id: 'wala',
    arabic: 'ولاء',
    term: 'Wala\'',
    category: 'umum',
    definition: 'Sebab kewarisan karena seseorang memerdekakan budak. Pada masa kini tidak relevan karena perbudakan telah dihapuskan, namun tetap disebutkan dalam literatur fiqh klasik.',
  },
  {
    id: 'baitulmal',
    arabic: 'بيت المال',
    term: 'Baitulmal',
    category: 'umum',
    definition: 'Kas negara / perbendaharaan umum Islam. Jika seseorang wafat tanpa meninggalkan ahli waris sama sekali (dan tiada pula dzawil arham), harta peninggalannya diserahkan ke baitulmal untuk kemaslahatan umat.',
    related: ['radd', 'dzawilArham'],
  },

  // ── AHLI WARIS ──────────────────────────────────────────────────────────
  {
    id: 'ashabulfurudh',
    arabic: 'أصحاب الفروض',
    term: 'Ashabul Furudh / Dzawil Furudh',
    category: 'ahliWaris',
    definition: 'Golongan ahli waris yang bagiannya telah ditetapkan secara eksplisit dalam Al-Qur\'an, As-Sunnah, dan ijma\'. Mereka mendapat bagian pertama sebelum ashabah. Ada 12 orang: suami, istri, ayah, ibu, kakek, nenek, anak perempuan, cucu perempuan dari anak laki, saudari kandung, saudari seayah, saudara seibu, dan saudari seibu.',
    related: ['ashabah', 'furudh'],
  },
  {
    id: 'ashabah',
    arabic: 'عصبة',
    term: 'Ashabah / \'Asabah',
    category: 'ahliWaris',
    definition: 'Ahli waris yang mendapat sisa harta setelah ashabul furudh mengambil bagian masing-masing. Jika tidak ada ashabul furudh, ashabah mengambil seluruh harta. Ada tiga jenis: (1) ashabah bin-nafsi, (2) ashabah bil-ghair, (3) ashabah ma\'al-ghair.',
    related: ['ashabahBinnafsi', 'ashabahBilghair', 'ashabahMaalghair'],
  },
  {
    id: 'ashabahBinnafsi',
    arabic: 'عصبة بالنفس',
    term: 'Ashabah bin-Nafsi',
    category: 'ahliWaris',
    definition: 'Ashabah "dengan sendirinya" — menjadi ashabah tanpa bergantung pada ahli waris lain. Semua dari jalur laki-laki: anak laki, cucu laki (via anak laki), ayah, kakek, saudara laki kandung, saudara laki seayah, paman kandung, paman seayah, dan anak paman.',
    example: 'Anak laki-laki selalu menjadi ashabah bin-nafsi terlepas dari siapa ahli waris lainnya.',
    related: ['ashabah'],
  },
  {
    id: 'ashabahBilghair',
    arabic: 'عصبة بالغير',
    term: 'Ashabah bil-Ghair',
    category: 'ahliWaris',
    definition: 'Ashabah "karena orang lain" — perempuan yang menjadi ashabah karena ada saudara laki-lakinya. Contoh: anak perempuan menjadi ashabah ketika ada anak laki (keduanya berbagi sisa dengan rasio 2:1). Berlaku juga untuk cucu perempuan (dengan cucu laki) dan saudari kandung (dengan saudara laki kandung).',
    example: 'Anak pr sendirian mendapat 1/2. Tapi jika ada anak laki, keduanya ashabah 2:1.',
    related: ['ashabah'],
  },
  {
    id: 'ashabahMaalghair',
    arabic: 'عصبة مع الغير',
    term: 'Ashabah ma\'al-Ghair',
    category: 'ahliWaris',
    definition: 'Ashabah "bersama orang lain" — saudari kandung atau saudari seayah yang menjadi ashabah ketika hadir bersama anak perempuan atau cucu perempuan pewaris. Saudari mengambil sisa harta setelah anak/cucu perempuan mengambil furudh tetapnya.',
    example: '1 anak pr (1/2 furudh) + 1 saudari kandung → saudari dapat 1/2 sisa sebagai ashabah ma\'al-ghair.',
    related: ['ashabah'],
  },
  {
    id: 'dzawilArham',
    arabic: 'ذوو الأرحام',
    term: 'Dzawil Arham / Dzawul Arham',
    category: 'ahliWaris',
    definition: 'Kerabat yang masih memiliki ikatan rahim dengan pewaris tetapi tidak termasuk ashabul furudh maupun ashabah nasabiyah. Contoh: cucu dari anak perempuan, bibi (saudari ibu), paman dari ibu, keponakan dari saudari, dan lain-lain. Mendapat warisan hanya jika tidak ada ashabul furudh dan ashabah sama sekali.',
    related: ['baitulmal'],
  },
  {
    id: 'faraWaris',
    arabic: 'فرع وارث',
    term: 'Fara\' Waris / Keturunan Pewaris',
    category: 'ahliWaris',
    definition: 'Keturunan langsung pewaris yang menjadi ahli waris: anak laki, anak perempuan, cucu laki dari anak laki, cucu perempuan dari anak laki, dan seterusnya ke bawah. Keberadaan fara\' waris mempengaruhi bagian suami/istri dan ibu secara signifikan.',
    example: 'Jika ada fara\' waris: suami turun dari 1/2 ke 1/4; istri turun dari 1/4 ke 1/8; ibu turun dari 1/3 ke 1/6.',
    related: ['ashabulfurudh'],
  },
  {
    id: 'hajib',
    arabic: 'حاجب',
    term: 'Hajib',
    category: 'ahliWaris',
    definition: 'Ahli waris yang kehadirannya menghalangi ahli waris lain dari mendapat warisan (hirman) atau mengurangi bagian ahli waris lain (nuqshan). Kata dasarnya sama dengan "hijab" (penghalang).',
    related: ['hijabHirman', 'hijabNuqshan'],
  },
  {
    id: 'mahrum',
    arabic: 'محروم',
    term: 'Mahrum',
    category: 'ahliWaris',
    definition: 'Ahli waris yang tidak mendapat warisan karena sebab yang berkaitan dengan dirinya sendiri (bukan karena terdesak ahli waris lain): membunuh pewaris dengan sengaja, murtad, atau berbeda agama dengan pewaris.',
  },

  // ── BAGIAN & HAK WARIS ──────────────────────────────────────────────────
  {
    id: 'furudh',
    arabic: 'فروض',
    term: 'Furudh / Al-Furudh Al-Muqaddarah',
    category: 'bagian',
    definition: 'Bagian-bagian tertentu yang telah ditetapkan syariat untuk ashabul furudh. Ada 6 furudh yang disebutkan dalam Al-Qur\'an: 1/2, 1/4, 1/8, 2/3, 1/3, dan 1/6.',
    example: '1/2 → suami (tanpa keturunan istri), anak pr tunggal, saudari kandung tunggal\n1/4 → suami (ada keturunan), istri (tanpa keturunan suami)\n1/8 → istri (ada keturunan suami)\n2/3 → 2+ anak perempuan, 2+ saudari kandung\n1/3 → ibu, 2+ saudara seibu\n1/6 → ayah (ada keturunan laki), ibu (ada keturunan/saudara), nenek, saudara seibu tunggal',
    related: ['ashabulfurudh'],
  },
  {
    id: 'siham',
    arabic: 'سهام',
    term: 'Siham',
    category: 'bagian',
    definition: 'Jamak dari "sahm" (سهم) artinya anak panah atau bagian. Dalam istilah faraidh, siham adalah bilangan bulat yang menunjukkan porsi tiap ahli waris dari asal masalah. Berguna untuk verifikasi: jumlah semua siham harus sama dengan asal masalah.',
    example: 'Asal masalah 24; istri mendapat bagian 1/8 → sihamnya = 1 × (24÷8) = 3 sahm.',
    related: ['asalMasalah'],
  },

  // ── HIJAB ───────────────────────────────────────────────────────────────
  {
    id: 'hijab',
    arabic: 'حجاب',
    term: 'Hijab',
    category: 'hijab',
    definition: 'Penghalang yang mencegah seseorang mendapat warisan atau mengurangi bagiannya. Ada dua jenis: hijab hirman (blokir total) dan hijab nuqshan (pengurangan bagian). Kata ini berbeda makna dengan hijab pakaian wanita.',
    related: ['hijabHirman', 'hijabNuqshan'],
  },
  {
    id: 'hijabHirman',
    arabic: 'حجاب حرمان',
    term: 'Hijab Hirman / Mahjub',
    category: 'hijab',
    definition: 'Blokir total — ahli waris sama sekali tidak mendapat bagian karena terhalangi oleh ahli waris lain yang lebih dekat hubungannya dengan pewaris. Ahli waris yang terblokir disebut "mahjub".',
    example: 'Kakek mahjub oleh ayah. Cucu laki mahjub oleh anak laki. Saudara kandung mahjub oleh anak laki atau ayah.',
    related: ['hijab', 'mahjub'],
  },
  {
    id: 'mahjub',
    arabic: 'محجوب',
    term: 'Mahjub',
    category: 'hijab',
    definition: 'Ahli waris yang terblokir total (hijab hirman) — tidak mendapat warisan apapun di skenario tertentu. Statusnya berbeda dari mahrum: mahjub terblokir karena ada ahli waris lain yang lebih prioritas, bukan karena kesalahannya sendiri.',
    related: ['hijabHirman', 'mahrum'],
  },
  {
    id: 'hijabNuqshan',
    arabic: 'حجاب نقصان',
    term: 'Hijab Nuqshan',
    category: 'hijab',
    definition: 'Pengurangan bagian (bukan blokir total) — kehadiran ahli waris tertentu menyebabkan bagian ahli waris lain berkurang. Contoh klasik: kehadiran saudara (walau diblokir ayah) tetap menurunkan bagian ibu dari 1/3 ke 1/6.',
    example: 'Ibu: 1/3 jika tak ada keturunan dan tak ada ≥2 saudara. Jika ada ≥2 saudara (walau terblokir ayah), ibu turun ke 1/6.',
    related: ['hijab'],
  },

  // ── PERHITUNGAN ─────────────────────────────────────────────────────────
  {
    id: 'asalMasalah',
    arabic: 'أصل المسألة',
    term: 'Asal Masalah',
    category: 'perhitungan',
    definition: 'Bilangan bulat terkecil yang bisa dibagi oleh semua penyebut bagian para ahli waris — KPK (Kelipatan Persekutuan Kecil) dari semua penyebut furudh. Digunakan untuk mengonversi semua bagian pecahan ke bilangan bulat (siham) agar pembagian mudah diverifikasi.',
    example: 'Ahli waris: istri (1/8), ibu (1/6), ayah (1/6), anak laki (sisa). KPK(8,6,6) = 24 → asal masalah = 24.',
    related: ['siham', 'aul', 'tasihMasalah'],
  },
  {
    id: 'tatkhrijMasalah',
    arabic: 'تخريج المسألة',
    term: 'Takhrij al-Masa\'il / At-Ta\'shil',
    category: 'perhitungan',
    definition: 'Proses menentukan asal masalah dengan mencari KPK dari penyebut-penyebut bagian para ahli waris. Langkah-langkahnya: kumpulkan semua penyebut furudh, hitung KPK, lalu kalikan setiap bagian dengan KPK untuk mendapat siham (bagian bulat).',
    related: ['asalMasalah'],
  },
  {
    id: 'tasihMasalah',
    arabic: 'تصحيح المسألة',
    term: 'Tashih al-Masa\'il',
    category: 'perhitungan',
    definition: 'Koreksi asal masalah ketika siham satu ahli waris tidak bisa dibagi habis di antara orang-orang dalam kelompoknya. Asal masalah dikalikan bilangan yang diperlukan agar pembagian menjadi bulat.',
    example: 'Asal masalah 6; anak laki mendapat sisa 3 sahm untuk dibagi 2 orang → tidak habis. Asal masalah dikoreksi menjadi 12.',
    related: ['asalMasalah'],
  },
  {
    id: 'aul',
    arabic: 'عول',
    term: '\'Aul / \'Aul al-Masa\'il',
    category: 'perhitungan',
    definition: 'Kondisi di mana total bagian ashabul furudh melebihi 1 (100% harta). Solusinya adalah menaikkan asal masalah ke angka yang sama dengan jumlah semua pembilang, sehingga semua bagian berkurang secara proporsional. Pertama kali diterapkan oleh Umar bin Khattab r.a.',
    example: 'Suami (1/2) + 2 saudari kandung (2/3) = 7/6 > 1. Asal masalah naik dari 6 → 7. Suami: 3/7, saudari: 4/7.',
    related: ['radd', 'asalMasalah'],
  },
  {
    id: 'radd',
    arabic: 'ردّ',
    term: 'Radd',
    category: 'perhitungan',
    definition: 'Pengembalian sisa harta kepada ahli waris furudh ketika total bagian mereka kurang dari 1 dan tidak ada ashabah. Sisa dikembalikan secara proporsional kepada pemegang furudh selain suami/istri (pasangan tidak mendapat radd dalam aturan jumhur). Kebalikan dari \'aul.',
    example: 'Ibu (1/6) + anak pr (1/2). Total = 2/3. Sisa 1/3 dikembalikan → ibu menjadi 1/4, anak pr menjadi 3/4.',
    related: ['aul'],
  },
  {
    id: 'muqasamah',
    arabic: 'مقاسمة',
    term: 'Muqasamah',
    category: 'perhitungan',
    definition: 'Cara pembagian saat kakek hadir bersama saudara kandung/seayah (tanpa ayah) dalam madzhab Syafi\'i/jumhur. Kakek dianggap sebagai salah satu saudara laki dan mengambil bagian yang paling menguntungkan dari: (a) muqasamah — bagi rata sebagai saudara, (b) 1/3 sisa, atau (c) 1/6 total harta. Ini berbeda dengan Hanafi di mana kakek memblokir saudara.',
    example: 'Kakek + 2 saudara laki: muqasamah = 1/3 (karena 1 dari 3 orang); 1/3 sisa = 1/3; 1/6 harta = 1/6. Kakek pilih 1/3 (terbesar).',
    related: ['asalMasalah'],
  },

  // ── KASUS KHUSUS ────────────────────────────────────────────────────────
  {
    id: 'umariyatain',
    arabic: 'العُمَرِيَّتَان',
    term: 'Umariyatain / Gharrawain',
    category: 'kasusKhusus',
    definition: 'Dua kasus khusus yang pertama kali diputuskan oleh Umar bin Khattab r.a. dan disepakati para sahabat. Berlaku saat ahli waris tepat terdiri dari {pasangan, ayah, ibu} tanpa keturunan. Dalam kasus ini, ibu mendapat 1/3 dari SISA setelah pasangan — bukan 1/3 total harta. Tujuannya agar ayah tidak mendapat lebih sedikit dari ibu.',
    example: 'Suami+Ayah+Ibu: suami 1/2, sisa 1/2 → ibu 1/6 (=1/3×1/2), ayah 1/3.\nIstri+Ayah+Ibu: istri 1/4, sisa 3/4 → ibu 1/4 (=1/3×3/4), ayah 1/2.',
    related: ['radd'],
  },
  {
    id: 'mimbariyah',
    arabic: 'المنبرية',
    term: 'Mimbariyah',
    category: 'kasusKhusus',
    definition: 'Kasus \'aul terkenal yang jawabannya diberikan Ali bin Abi Thalib r.a. dari atas mimbar: istri + ayah + ibu + 2 anak perempuan. Total furudh = 1/8+1/6+1/6+2/3 = 27/24 → \'aul dari 24 ke 27. Dinamai "mimbariyah" karena dijawab di atas mimbar shalat Jumat.',
    example: 'Ayah bertanya dari jama\'ah salat Jumat. Ali langsung menjawab dari mimbar: "Menjadi 4/27 bagianmu (ayah)" — bukan 1/6.',
    related: ['aul'],
  },
  {
    id: 'akdariyah',
    arabic: 'الأكدرية',
    term: 'Akdariyah',
    category: 'kasusKhusus',
    definition: 'Kasus istimewa: suami + ibu + kakek + saudari kandung. Menurut jumhur, bagian kakek dan saudari kandung digabung lalu dibagi 2:1 (L:P) di antara mereka — berbeda dari cara biasa. Dinamai dari nama seorang wanita atau desa dalam riwayatnya.',
    related: ['muqasamah'],
  },
  {
    id: 'kalalah',
    arabic: 'كَلَالَة',
    term: 'Kalalah',
    category: 'kasusKhusus',
    definition: 'Kondisi pewaris yang wafat tanpa meninggalkan anak (ke bawah) maupun ayah (ke atas) — hanya meninggalkan saudara. Disebutkan dalam QS. An-Nisa: 12 dan 176 sebagai kondisi khusus yang mengatur bagian saudara. Salah satu ayat terakhir yang turun tentang warisan.',
    related: ['ashabulfurudh'],
  },
  {
    id: 'musytarikah',
    arabic: 'المشتركة',
    term: 'Musytarikah / Himariyah',
    category: 'kasusKhusus',
    definition: 'Kasus di mana saudara-saudari seibu berserikat (musytarak) bersama saudara laki kandung dalam bagian 1/3. Madzhab Umar, Utsman, Ibnu Mas\'ud, dan Syafi\'i menyerikatkan mereka; madzhab Ali dan Ibnu Abbas tidak. Disebut juga "himariyah" dari kata keledai (karena seseorang berkata "seumpama ayah kami keledai").',
  },
  {
    id: 'gharraa',
    arabic: 'الغرَّاء',
    term: 'Al-Gharra\'',
    category: 'kasusKhusus',
    definition: 'Nama lain untuk kasus Umariyatain (lihat entri tersebut), khususnya menekankan keindahan/kecemerlangan keputusan hukum Umar bin Khattab dalam menyelesaikan kasus yang berpotensi mengurangi hak ayah.',
    related: ['umariyatain'],
  },
];

/* ── Component helpers ──────────────────────────────────────────────────── */

function CategoryBadge({ cat }: { cat: Category }) {
  const { label, color, icon } = CATEGORY_META[cat];
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>
      {icon} {label}
    </span>
  );
}

function TermCard({ term, allTerms, onRelated, forceOpen }: {
  term: Term;
  allTerms: Term[];
  onRelated: (id: string) => void;
  forceOpen?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const isOpen = open || !!forceOpen;
  const relatedTerms = term.related?.map(id => allTerms.find(t => t.id === id)).filter(Boolean) ?? [];

  return (
    <div className={`bg-white dark:bg-gray-800 border rounded-xl overflow-hidden transition-colors ${
      forceOpen ? 'border-emerald-300 dark:border-emerald-700' : 'border-gray-200 dark:border-gray-700'
    }`}>
      {/* Header — selalu tampil */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-800 dark:text-gray-100">{term.term}</span>
              {term.arabic && (
                <span className="text-gray-400 dark:text-gray-500 text-sm font-normal" dir="rtl">{term.arabic}</span>
              )}
            </div>
            {/* Definisi singkat (1 kalimat) selalu tampil */}
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
              {term.definition.split('.')[0]}.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <CategoryBadge cat={term.category} />
            <span className={`text-gray-400 dark:text-gray-500 text-xs transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
          </div>
        </div>
      </button>

      {/* Detail — tampil saat terbuka */}
      {isOpen && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-4 py-3 space-y-3">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{term.definition}</p>

          {term.example && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2">
              <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">Contoh</div>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed whitespace-pre-line">{term.example}</p>
            </div>
          )}

          {relatedTerms.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Lihat juga</div>
              <div className="flex flex-wrap gap-1.5">
                {relatedTerms.map(rel => rel && (
                  <button
                    key={rel.id}
                    type="button"
                    onClick={() => onRelated(rel.id)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded px-2 py-0.5 transition-colors"
                  >
                    {rel.term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────────── */

export function GlossaryPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return TERMS.filter(t => {
      const matchCat = activeCategory === 'all' || t.category === activeCategory;
      const matchQ = !q ||
        t.term.toLowerCase().includes(q) ||
        t.definition.toLowerCase().includes(q) ||
        (t.arabic?.toLowerCase().includes(q) ?? false) ||
        (t.example?.toLowerCase().includes(q) ?? false);
      return matchCat && matchQ;
    });
  }, [search, activeCategory]);

  // Ketika klik "Lihat juga": buka kartu itu, scroll ke sana, clear filter
  function handleRelated(id: string) {
    setSearch('');
    setActiveCategory('all');
    setOpenId(id);
    setTimeout(() => {
      document.getElementById(`term-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  const categories: (Category | 'all')[] = ['all', 'umum', 'ahliWaris', 'bagian', 'hijab', 'perhitungan', 'kasusKhusus'];

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">Glosarium Faraidh & Mawaris</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {TERMS.length} istilah — klik kartu untuk membuka definisi lengkap dan contoh
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">🔍</span>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari istilah, definisi, atau kata kunci…"
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-700 transition-colors"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => {
          const isAll = cat === 'all';
          const meta = isAll ? null : CATEGORY_META[cat];
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors border ${
                isActive
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              {isAll ? '📚 Semua' : `${meta!.icon} ${meta!.label}`}
            </button>
          );
        })}
      </div>

      {/* Count */}
      <div className="text-xs text-gray-400 dark:text-gray-500">
        Menampilkan <strong className="text-gray-600 dark:text-gray-300">{filtered.length}</strong> istilah
        {search && <> untuk "<em>{search}</em>"</>}
      </div>

      {/* Terms */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 dark:text-gray-500">
          <div className="text-3xl mb-2">🔍</div>
          <div className="text-sm">Tidak ada istilah yang cocok.</div>
          <button
            type="button"
            onClick={() => { setSearch(''); setActiveCategory('all'); }}
            className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 underline"
          >
            Reset filter
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(term => (
            <div key={term.id} id={`term-${term.id}`}>
              <TermCard
                term={term}
                allTerms={TERMS}
                onRelated={handleRelated}
                forceOpen={openId === term.id}
              />
            </div>
          ))}
        </div>
      )}

      <div className="text-center text-xs text-gray-400 dark:text-gray-500 py-4 border-t border-gray-100 dark:border-gray-800">
        Referensi: <em>Fiqih Mawaris</em> — Ahmad Sarwat, Lc., MA. | Al-Qur'an QS. An-Nisa: 11–12, 176
      </div>
    </div>
  );
}
