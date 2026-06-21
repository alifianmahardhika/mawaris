# Kalkulator Warisan Islam — Faraidh / Mawaris

Aplikasi web kalkulator pembagian harta warisan Islam (faraidh/mawaris) untuk pasangan suami-istri. Menampilkan dua skenario sekaligus: pembagian harta suami jika suami wafat, dan pembagian harta istri jika istri wafat.

**Stack**: Vite + React + TypeScript + Tailwind CSS | **Deploy**: Netlify  
**Referensi fiqih**: *Fiqih Mawaris* — Ahmad Sarwat, Lc., MA. | **Madzhab**: Syafi'i / Jumhur

---

## Fitur

- Input harta suami & istri secara terpisah
- Anak/cucu sebagai input bersama (berlaku untuk kedua skenario)
- Ahli waris keluarga masing-masing pihak (ayah, ibu, kakek, nenek, saudara) diinput per kolom
- Pembagian otomatis sesuai aturan faraidh: furudh → ashabah → 'aul/radd
- Tampilan 2 kolom di desktop, 1 kolom di mobile
- Tiap baris menampilkan: fraksi, persentase, nominal IDR, dan alasan (dasar hukum)
- Baris ahli waris yang terhalang (mahjub) ditampilkan terpisah dengan keterangan
- Banner khusus saat terjadi 'aul atau radd

---

## Cara Menjalankan

```bash
bun install
bun run dev       # dev server
bun run build     # production build
bun run test      # 46 unit test engine
```

---

## Metode Perhitungan

Engine faraidh berjalan dalam **8 langkah berurutan** (pipeline deterministik). Semua operasi dilakukan dalam bilangan rasional eksak (pecahan integer) untuk menghindari error pembulatan floating point.

### Langkah 0 — Predikat Dasar

Sebelum apapun, turunkan predikat dari daftar ahli waris yang hadir:

| Predikat | Definisi |
|---|---|
| `hasSon` | ada anak laki-laki (count > 0) |
| `hasGrandsonViaSon` | ada cucu laki dari anak laki |
| `hasMaleDescendant` | `hasSon OR hasGrandsonViaSon` |
| `hasDescendant` | ada keturunan apa pun (fara' waris): anak/cucu L atau P |
| `hasFather` | ada ayah |
| `hasGrandfather` | ada kakek |
| `siblingCountAll` | jumlah *jenis* saudara yang hadir (walau terblokir) — penentu ibu 1/3↔1/6 |

> **Catatan**: `siblingCountAll` dihitung sebelum hijab karena jumhur menetapkan bahwa keberadaan saudara (meski terblokir ayah) tetap menurunkan bagian ibu dari 1/3 ke 1/6 (*hajb nuqshan*).

---

### Langkah 1 — Resolusi Hijab (Blokir)

Hirman (blokir total) diselesaikan secara berurutan. Ahli waris yang terblokir tetap ditampilkan di UI dengan status `mahjub`.

| Pemblokir | Yang Diblokir |
|---|---|
| Anak laki-laki | Cucu L & P dari anak laki, semua saudara |
| Ayah | Kakek, nenek dari ayah, semua saudara |
| Ibu | Nenek dari ibu, nenek dari ayah |
| Keturunan apa pun | Saudara seibu |
| Saudara laki kandung | Saudara laki & saudari seayah |

> **Cucu perempuan** *tidak* diblokir di langkah ini — bisa mendapat 1/6 pelengkap atau jadi ashabah bersama cucu laki, diputus di langkah 2.

---

### Langkah 2 — Penetapan Furudh (Bagian Tetap)

Ashabul furudh menerima bagian terlebih dahulu, dengan urutan resolusi sebagai berikut:

#### Pasangan (diselesaikan pertama)

| Kondisi | Suami | Istri |
|---|---|---|
| Almarhum/ah tidak punya keturunan | **1/2** | **1/4** |
| Almarhum/ah punya keturunan | **1/4** | **1/8** |

#### Ibu

Ibu punya tiga kemungkinan bagian, dengan hook **Umariyatain** yang diperiksa lebih dahulu:

1. **Umariyatain** (Gharrawain): berlaku ketika ahli waris yang aktif *tepat* `{pasangan, ayah, ibu}` tanpa keturunan:
   - Ibu mendapat **1/3 dari sisa** setelah bagian pasangan diambil
   - Contoh: suami (1/2) + ayah + ibu → sisa = 1/2 → ibu = 1/6, ayah = 1/3
   - Contoh: istri (1/4) + ayah + ibu → sisa = 3/4 → ibu = 1/4, ayah = 1/2

2. Selain Umariyatain:
   - **1/6** jika ada keturunan (fara' waris) ATAU ada ≥2 saudara
   - **1/3** jika tidak ada keturunan dan tidak ada ≥2 saudara

#### Ayah

| Kondisi | Bagian |
|---|---|
| Ada keturunan laki (anak/cucu laki) | **1/6** (furudh saja) |
| Ada keturunan perempuan saja | **1/6 + sisa** (furudh + ashabah) |
| Tidak ada keturunan | Ashabah murni (langkah 3) |

#### Kakek (menggantikan ayah jika ayah tidak ada)

Aturan identik dengan ayah di atas, kecuali ada muqasamah dengan saudara (lihat langkah 3).

#### Nenek

- Mendapat **1/6** total, dibagi rata jika ada dua nenek (dari ibu + dari ayah)
- Nenek dari ibu diblokir oleh ibu
- Nenek dari ayah diblokir oleh ibu dan ayah

#### Anak Perempuan

| Kondisi | Bagian |
|---|---|
| Ada anak laki-laki | Ashabah bersama anak laki (2:1) — langkah 3 |
| Anak perempuan tunggal, tidak ada anak laki | **1/2** |
| 2+ anak perempuan, tidak ada anak laki | **2/3** bersama |

#### Cucu Perempuan (dari anak laki, bila tidak ada anak laki)

| Kondisi | Bagian |
|---|---|
| Ada cucu laki | Ashabah bersama cucu laki (2:1) — langkah 3 |
| Tidak ada anak, tidak ada cucu laki — tunggal | **1/2** |
| Tidak ada anak, tidak ada cucu laki — 2+ | **2/3** |
| Ada *tepat 1* anak perempuan | **1/6** (pelengkap ke 2/3) |
| Ada 2+ anak perempuan, tidak ada cucu laki | **Mahjub** |

#### Saudara/Saudari Seibu

| Kondisi | Bagian |
|---|---|
| Tunggal | **1/6** |
| 2 atau lebih | **1/3** bersama (laki = perempuan) |

#### Saudari Kandung

| Kondisi | Bagian |
|---|---|
| Ada saudara laki kandung | Ashabah 2:1 — langkah 3 |
| Ada anak/cucu perempuan | **Ashabah ma'al ghair** (sisa) — langkah 3 |
| Tunggal, tanpa kondisi di atas | **1/2** |
| 2+, tanpa kondisi di atas | **2/3** bersama |

#### Saudari Seayah

- Aturan seperti saudari kandung
- Tambahan: diblokir oleh saudara laki kandung
- Diblokir oleh saudari kandung yang sudah mengambil 2/3
- Jika saudari kandung mengambil 1/2: saudari seayah mendapat **1/6** pelengkap

---

### Langkah 3 — Distribusi Ashabah (Sisa)

Sisa harta = `1 − Σfurudh`. Ashabah diberikan berdasarkan prioritas tier (lebih dekat = lebih prioritas, satu tier mengambil semua):

| Tier | Ashabah |
|---|---|
| 1 | Anak laki-laki + anak perempuan (2:1) |
| 2 | Cucu laki + cucu perempuan via anak laki (2:1) |
| 3 | Ayah (atau 1/6+sisa jika furudh+ashabah) |
| 4 | Kakek — bisa muqasamah dengan saudara kandung |
| 4 | Saudara laki kandung + saudari kandung (2:1) / saudari ma'al ghair |
| 5 | Saudara laki seayah + saudari seayah (2:1) / saudari seayah ma'al ghair |

#### Muqasamah Kakek (Madzhab Syafi'i / Jumhur)

Ketika kakek hadir bersama saudara kandung (tanpa ayah), kakek **berbagi** dengan saudara — tidak memblokir mereka. Kakek mengambil yang **terbaik** dari tiga opsi:

1. **Muqasamah**: bagi rata seolah kakek adalah satu saudara laki (unit 2)
2. **1/3 sisa** setelah furudh
3. **1/6 harta** keseluruhan

Sisanya diberikan kepada saudara kandung (dibagi 2:1 laki:perempuan).

> Ini berbeda dengan madzhab Hanafi di mana kakek memblokir saudara seperti ayah.

---

### Langkah 4 — 'Aul (Jika Σfurudh > 1)

Jika total bagian furudh melebihi 1 (harta tidak cukup), asal masalah dinaikkan sehingga semua bagian dikurangi secara proporsional:

```
bagian_baru[i] = bagian_lama[i] × (1 / Σfurudh)
```

Contoh transisi asal masalah klasik:

| Sebelum | Sesudah | Kondisi |
|---|---|---|
| 6 | 7, 8, 9, atau 10 | ada suami/istri + saudari/ibu |
| 12 | 13, 15, atau 17 | kombinasi 1/4 + 1/6 + ... |
| 24 | 27 | Mimbariyah: istri+ayah+ibu+2 anak perempuan |

**Kasus Mimbariyah**: istri (1/8) + ibu (1/6) + ayah (1/6) + 2 anak perempuan (2/3)  
= 3/24 + 4/24 + 4/24 + 16/24 = 27/24 → asal masalah naik dari 24 ke 27

---

### Langkah 5 — Radd (Jika Σfurudh < 1 dan Tidak Ada Ashabah)

Jika ada sisa setelah semua furudh dibagikan dan tidak ada ahli waris ashabah:

**Aturan umum**: sisa dikembalikan ke pemegang furudh *selain pasangan*, proporsional dengan bagian masing-masing.

```
tambahan[i] = sisa × (bagian[i] / Σfurudh_non_pasangan)
```

**Pengecualian — pasangan tunggal**: jika pasangan adalah satu-satunya ahli waris, sisa dikembalikan ke pasangan sehingga pasangan mengambil seluruh harta. (Sesuai ref. bagian 2.5: tambahan hak waris bagi suami atau istri.)

---

### Langkah 6 — Ashlul-Masalah (Asal Masalah)

Menghitung **LCM** dari semua penyebut bagian final untuk mendapatkan bilangan bulat siham:

```
asalMasalah = LCM(d₁, d₂, ..., dₙ)
siham[i] = n[i] × (asalMasalah / d[i])
```

Verifikasi: `Σsiham = asalMasalah`.

---

### Langkah 7 — Konversi ke Nominal IDR

```
nominal[i] = round(harta × share[i])
```

Selisih pembulatan (`harta − Σnominal`) dibebankan ke bagian terbesar (biasanya ashabah) agar total nominal persis sama dengan total harta.

---

### Langkah 8 — Kalimat Alasan

Setiap ahli waris mendapat kalimat penjelasan dalam Bahasa Indonesia berdasarkan cabang aturan yang dilalui (lihat `src/engine/reasons.ts`).

---

## Kasus-Kasus Khusus

### Umariyatain / Gharrawain

Dua kasus spesial yang ditetapkan Umar bin Khattab (dan dikonfirmasi sahabat lain):

| Ahli Waris | Suami Wafat (Istri) | Istri Wafat (Suami) |
|---|---|---|
| Pasangan | 1/4 | 1/2 |
| Ibu | **1/4** (= 1/3 dari 3/4) | **1/6** (= 1/3 dari 1/2) |
| Ayah | 1/2 (sisa) | 1/3 (sisa) |

Tanpa kasus ini, ibu yang tidak ada keturunan/saudara berhak 1/3 dari *total* harta, yang bisa mengakibatkan ayah mendapat lebih sedikit dari ibu padahal posisi ayah lebih kuat.

### Ashabah Ma'al Ghair (Saudari Kandung bersama Anak/Cucu Perempuan)

Saudari kandung yang normalnya mendapat furudh tetap (1/2 atau 2/3) berubah menjadi **ashabah** (mengambil sisa) ketika hadir bersama anak perempuan atau cucu perempuan pewaris. Saudari seayah mengikuti aturan yang sama.

### Pelengkap 1/6 Cucu Perempuan

Ketika ada *tepat satu* anak perempuan (mengambil 1/2) dan ada cucu perempuan (dari anak laki), cucu perempuan mendapat **1/6** untuk melengkapi total menjadi 2/3 — bagian maksimal keturunan perempuan.

---

## Cakupan Ahli Waris

| Jenis | Kode |
|---|---|
| Suami | `suami` |
| Istri | `istri` |
| Anak laki-laki | `anakLk` |
| Anak perempuan | `anakPr` |
| Cucu laki-laki (dari anak laki) | `cucuLkDariAnakLk` |
| Cucu perempuan (dari anak laki) | `cucuPrDariAnakLk` |
| Ayah | `ayah` |
| Ibu | `ibu` |
| Kakek (ayahnya ayah) | `kakek` |
| Nenek dari ibu | `nenekDariIbu` |
| Nenek dari ayah | `nenekDariAyah` |
| Saudara laki-laki kandung | `saudaraLkKandung` |
| Saudari perempuan kandung | `saudariPrKandung` |
| Saudara laki-laki seayah | `saudaraLkSeayah` |
| Saudari perempuan seayah | `saudariPrSeayah` |
| Saudara/saudari seibu | `saudaraSeibu` |

**Di luar cakupan v1**: dzawil arham (cucu dari anak perempuan, paman dari ibu, dll).

---

## Struktur Proyek

```
src/
  engine/
    fraction.ts        # Rational number helper (tanpa dependency)
    types.ts           # HeirKind, HeirInput, EstateCase, ScenarioResult, dll.
    heirs.ts           # Katalog label & urutan tampil ahli waris
    hijab.ts           # Resolusi blokir (hirman)
    furudh.ts          # Bagian tetap + Umariyatain + cucu-1/6 + ma'al ghair
    ashabah.ts         # Distribusi sisa + muqasamah kakek
    aulRadd.ts         # 'Aul + Radd
    ashlulMasalah.ts   # LCM → siham integer
    calculate.ts       # Orchestrator pipeline 8 langkah
    reasons.ts         # Kalimat alasan Bahasa Indonesia
  components/          # React components
  hooks/               # useFaraidh
  state/               # formState + buildHeirInputs
  lib/                 # formatCurrency, formatFraction
test/
  fraction.test.ts     # 15 unit test helper fraksi
  engine.test.ts       # 31 test kasus faraidh (fixture-based)
  fixtures.ts          # ~25 kasus bernama: dasar, 'aul, radd, Umariyatain, dll.
```

---

## Disclaimer

Hasil perhitungan bersifat indikatif dan edukatif. Untuk kepastian hukum, konsultasikan dengan ulama atau ahli hukum waris Islam yang berkompeten.
