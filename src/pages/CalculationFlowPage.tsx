/**
 * Halaman: Alur & Metode Perhitungan Faraidh
 * Menampilkan pipeline 8 langkah secara visual dengan contoh.
 */

/* ---------- helpers ---------- */

function Step({ n, title, color, children }: {
  n: number; title: string; color: string; children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      {/* Nomor & garis */}
      <div className="flex flex-col items-center shrink-0">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm shrink-0 ${color}`}>
          {n}
        </div>
        <div className="w-0.5 bg-gray-200 dark:bg-gray-700 flex-1 mt-1" />
      </div>
      {/* Konten */}
      <div className="pb-8 flex-1 min-w-0">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 text-base">{title}</h3>
        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">{children}</div>
      </div>
    </div>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            {headers.map((h, i) => (
              <th key={i} className="text-left px-2 py-1.5 font-semibold text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="even:bg-gray-50 dark:even:bg-gray-800/50">
              {row.map((cell, ci) => (
                <td key={ci} className="px-2 py-1.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="block bg-gray-900 dark:bg-gray-950 text-green-400 dark:text-green-300 text-xs rounded-lg px-4 py-3 font-mono leading-relaxed overflow-x-auto">
      {children}
    </code>
  );
}

function Callout({ icon, color, title, children }: {
  icon: string; color: string; title: string; children: React.ReactNode;
}) {
  return (
    <div className={`flex gap-2 p-3 rounded-lg border text-xs leading-relaxed ${color}`}>
      <span className="text-base shrink-0">{icon}</span>
      <div><strong>{title}</strong> {children}</div>
    </div>
  );
}

function ExampleBox({ title, heirs, result, note }: {
  title: string;
  heirs: { label: string; share: string; amount?: string }[];
  result?: { adjustment?: string; asalMasalah?: number };
  note?: string;
}) {
  return (
    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 text-xs">
      <div className="font-semibold text-emerald-800 dark:text-emerald-300 mb-2">{title}</div>
      {result?.adjustment && (
        <div className={`mb-2 px-2 py-1 rounded text-xs font-medium ${
          result.adjustment === 'aul'
            ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300'
            : 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
        }`}>
          {result.adjustment === 'aul' ? `⚠️ ʿAul — asal masalah: ${result.asalMasalah}` : 'ℹ️ Radd'}
        </div>
      )}
      <div className="space-y-1">
        {heirs.map((h, i) => (
          <div key={i} className="flex justify-between items-center">
            <span className="text-gray-600 dark:text-gray-300">{h.label}</span>
            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
              {h.share}
              {h.amount && <span className="font-normal text-gray-500 dark:text-gray-400 ml-1">({h.amount})</span>}
            </span>
          </div>
        ))}
      </div>
      {note && <div className="mt-2 text-gray-500 dark:text-gray-400 italic">{note}</div>}
    </div>
  );
}

/* ---------- page ---------- */

export function CalculationFlowPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">

      {/* Intro */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">Alur & Metode Perhitungan</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Berdasarkan <em>Fiqih Mawaris</em> — Ahmad Sarwat, Lc., MA. | Madzhab Syafi'i / Jumhur
        </p>
      </div>

      {/* Diagram ringkas */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Pipeline 8 Langkah</h3>
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            ['1','Predikat','bg-gray-500'],
            ['2','Hijab','bg-red-500'],
            ['3','Furudh','bg-blue-500'],
            ['4','Ashabah','bg-green-500'],
            ['5','ʿAul','bg-orange-500'],
            ['6','Radd','bg-purple-500'],
            ['7','Asal Masalah','bg-teal-500'],
            ['8','Nominal IDR','bg-emerald-600'],
          ].map(([n, label, bg], i, arr) => (
            <div key={n} className="flex items-center gap-1">
              <span className={`${bg} text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-xs shrink-0`}>{n}</span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">{label}</span>
              {i < arr.length - 1 && <span className="text-gray-300 dark:text-gray-600 ml-1">→</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div>
        <Step n={1} title="Predikat Dasar" color="bg-gray-500">
          <p>Sebelum menghitung, turunkan predikat dari daftar ahli waris yang hadir (count &gt; 0):</p>
          <Table
            headers={['Predikat', 'Definisi']}
            rows={[
              ['hasSon', 'Ada anak laki-laki'],
              ['hasGrandsonViaSon', 'Ada cucu laki dari anak laki'],
              ['hasMaleDescendant', 'hasSon ATAU hasGrandsonViaSon'],
              ['hasDescendant', 'Ada keturunan apa pun (anak/cucu L atau P) — fara\' waris'],
              ['siblingCountAll', 'Jumlah jenis saudara yang hadir, walau terblokir — penentu bagian ibu'],
            ]}
          />
          <Callout icon="💡" color="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300" title="Mengapa siblingCountAll dihitung sebelum hijab?">
            Jumhur menetapkan keberadaan saudara (meski diblokir ayah) tetap menurunkan bagian ibu dari 1/3 ke 1/6 — ini disebut <em>hajb nuqshan</em>.
          </Callout>
        </Step>

        <Step n={2} title="Resolusi Hijab (Blokir Total — Hirman)" color="bg-red-500">
          <p>Ahli waris yang terblokir tidak mendapat bagian apapun (<em>mahjub</em>), tetapi tetap ditampilkan di hasil akhir beserta keterangan siapa yang memblokir mereka.</p>
          <Table
            headers={['Pemblokir', 'Yang Diblokir']}
            rows={[
              ['Anak laki-laki', 'Cucu L & P dari anak laki, semua saudara (kandung/seayah/seibu)'],
              ['Ayah', 'Kakek, nenek dari ayah, semua saudara'],
              ['Ibu', 'Nenek dari ibu, nenek dari ayah'],
              ['Keturunan apa pun', 'Saudara/saudari seibu'],
              ['Saudara laki kandung', 'Saudara laki seayah, saudari seayah'],
            ]}
          />
          <Callout icon="⚠️" color="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300" title="Pengecualian cucu perempuan:">
            Tidak diblok di langkah ini — bisa dapat 1/6 pelengkap atau jadi ashabah bersama cucu laki, diputus di langkah Furudh.
          </Callout>
        </Step>

        <Step n={3} title="Furudh — Bagian Tetap Ashabul Furudh" color="bg-blue-500">
          <p>Pasangan diselesaikan pertama karena dibutuhkan untuk kasus Umariyatain dan dasar radd.</p>

          <div className="font-medium text-gray-700 dark:text-gray-200 mt-3 mb-1">Pasangan</div>
          <Table
            headers={['Ahli Waris', 'Ada Keturunan', 'Tidak Ada Keturunan']}
            rows={[
              ['Suami', '1/4', '1/2'],
              ['Istri', '1/8', '1/4'],
            ]}
          />

          <div className="font-medium text-gray-700 dark:text-gray-200 mt-3 mb-1">Ibu — Hook Umariyatain</div>
          <Callout icon="🌟" color="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300" title="Umariyatain (Gharrawain):">
            Berlaku jika ahli waris aktif tepat &#123;pasangan, ayah, ibu&#125; tanpa keturunan. Ibu mendapat <strong>1/3 dari sisa</strong> setelah pasangan — bukan 1/3 dari total.
          </Callout>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            <ExampleBox
              title="Suami + Ayah + Ibu"
              heirs={[
                { label: 'Suami', share: '1/2' },
                { label: 'Ibu (1/3 dari sisa 1/2)', share: '1/6' },
                { label: 'Ayah (sisa)', share: '1/3' },
              ]}
            />
            <ExampleBox
              title="Istri + Ayah + Ibu"
              heirs={[
                { label: 'Istri', share: '1/4' },
                { label: 'Ibu (1/3 dari sisa 3/4)', share: '1/4' },
                { label: 'Ayah (sisa)', share: '1/2' },
              ]}
            />
          </div>

          <div className="font-medium text-gray-700 dark:text-gray-200 mt-3 mb-1">Ibu — Selain Umariyatain</div>
          <Table
            headers={['Kondisi', 'Bagian Ibu']}
            rows={[
              ['Ada keturunan (fara\' waris)', '1/6'],
              ['Tidak ada keturunan, ada ≥2 saudara', '1/6'],
              ['Tidak ada keturunan, tidak ada ≥2 saudara', '1/3'],
            ]}
          />

          <div className="font-medium text-gray-700 dark:text-gray-200 mt-3 mb-1">Ayah & Kakek</div>
          <Table
            headers={['Kondisi', 'Bagian Ayah/Kakek']}
            rows={[
              ['Ada keturunan laki (anak/cucu laki)', '1/6 (furudh saja)'],
              ['Ada keturunan perempuan saja', '1/6 + sisa (furudh + ashabah)'],
              ['Tidak ada keturunan', 'Ashabah murni (langkah 4)'],
            ]}
          />

          <div className="font-medium text-gray-700 dark:text-gray-200 mt-3 mb-1">Anak Perempuan & Cucu Perempuan</div>
          <Table
            headers={['Kondisi', 'Anak Perempuan', 'Cucu Perempuan (bila tak ada anak laki)']}
            rows={[
              ['Ada anak/cucu laki', 'Ashabah 2:1', 'Ashabah 2:1 bersama cucu laki'],
              ['Tunggal, tidak ada laki', '1/2', '1/2'],
              ['2+, tidak ada laki', '2/3', '2/3'],
              ['Ada tepat 1 anak perempuan', '—', '1/6 pelengkap ke 2/3'],
              ['Ada 2+ anak perempuan, no cucu laki', '—', 'Mahjub'],
            ]}
          />
        </Step>

        <Step n={4} title="Ashabah — Distribusi Sisa" color="bg-green-500">
          <p>Sisa = 1 − Σfurudh. Diberikan ke tier terdekat (satu tier mengambil semua):</p>
          <Table
            headers={['Tier', 'Ahli Waris', 'Rasio']}
            rows={[
              ['1', 'Anak laki-laki + anak perempuan', '2:1 (L:P)'],
              ['2', 'Cucu laki + cucu perempuan via anak laki', '2:1'],
              ['3', 'Ayah (atau 1/6+sisa jika furudh+ashabah)', '—'],
              ['4', 'Kakek (bisa muqasamah) + saudara kandung', '2:1 atau muqasamah'],
              ['5', 'Saudara laki seayah + saudari seayah / ma\'al ghair', '2:1'],
            ]}
          />

          <div className="font-medium text-gray-700 dark:text-gray-200 mt-3 mb-1">Muqasamah Kakek (Madzhab Syafi'i)</div>
          <p>Ketika kakek hadir bersama saudara kandung (tanpa ayah), kakek <strong>berbagi</strong> — tidak memblokir. Kakek ambil yang <strong>terbesar</strong> dari 3 opsi:</p>
          <Code>
            {`Opsi A: muqasamah — bagi rata seolah kakek = 1 saudara laki (unit 2)\n`}
            {`Opsi B: 1/3 dari sisa setelah furudh\n`}
            {`Opsi C: 1/6 dari total harta\n\n`}
            {`Kakek = max(A, B, C)\n`}
            {`Saudara = sisa − bagian kakek (dibagi 2:1 L:P)`}
          </Code>
          <ExampleBox
            title="Kakek + 2 Saudara Laki Kandung (sisa = 1)"
            heirs={[
              { label: 'Kakek (A=1/3, B=1/3, C=1/6 → max=1/3)', share: '1/3' },
              { label: '2 Saudara Laki (sisa 2/3 dibagi rata)', share: '2/3' },
            ]}
            note="Opsi A = sisa × 2/(2+2×2) = 1/3; Opsi B = 1/3; Opsi C = 1/6 → kakek ambil 1/3"
          />

          <div className="font-medium text-gray-700 dark:text-gray-200 mt-3 mb-1">Ashabah Ma'al Ghair</div>
          <p>Saudari kandung (atau seayah) berubah menjadi ashabah ketika hadir bersama <strong>anak/cucu perempuan pewaris</strong> — mengambil sisa setelah furudh.</p>
          <ExampleBox
            title="1 Anak Perempuan + 1 Saudari Kandung"
            heirs={[
              { label: 'Anak Perempuan', share: '1/2 (furudh)' },
              { label: 'Saudari Kandung (ma\'al ghair)', share: '1/2 (sisa)' },
            ]}
          />
        </Step>

        <Step n={5} title="ʿAul — Jika Total Furudh Melebihi Harta" color="bg-orange-500">
          <p>Jika Σfurudh &gt; 1, harta tidak cukup untuk semua bagian tetap. Solusi: naikkan asal masalah sehingga semua bagian dikurangi proporsional.</p>
          <Code>
            {`bagian_baru[i] = bagian_lama[i] × (1 / Σfurudh)\n\n`}
            {`Ekuivalen: jadikan semua pembilang sebagai bagian baru,\n`}
            {`dan jumlah pembilang sebagai asal masalah baru.`}
          </Code>
          <Table
            headers={['Asal Masalah Lama', 'Asal Masalah Baru', 'Kondisi Umum']}
            rows={[
              ['6', '7, 8, 9, 10', 'Ada 1/2, 1/3, 1/6 + variasi'],
              ['12', '13, 15, 17', 'Ada 1/4, 1/6, 1/3 + variasi'],
              ['24', '27', 'Kasus Mimbariyah'],
            ]}
          />
          <ExampleBox
            title="ʿAul: Suami + 2 Saudari Kandung"
            result={{ adjustment: 'aul', asalMasalah: 7 }}
            heirs={[
              { label: 'Suami (1/2 → 3/7)', share: '3/7' },
              { label: '2 Saudari Kandung (2/3 → 4/7)', share: '4/7' },
            ]}
            note="1/2 + 2/3 = 7/6 > 1 → asal masalah naik 6→7"
          />
          <ExampleBox
            title="ʿAul: Mimbariyah — Istri + Ayah + Ibu + 2 Anak Perempuan"
            result={{ adjustment: 'aul', asalMasalah: 27 }}
            heirs={[
              { label: 'Istri (1/8 → 3/27)', share: '3/27' },
              { label: 'Ibu (1/6 → 4/27)', share: '4/27' },
              { label: 'Ayah (1/6 → 4/27)', share: '4/27' },
              { label: '2 Anak Perempuan (2/3 → 16/27)', share: '16/27' },
            ]}
            note="3+4+4+16=27. Disebut Mimbariyah karena Ali bin Abi Thalib menjawabnya dari mimbar."
          />
        </Step>

        <Step n={6} title="Radd — Mengembalikan Sisa ke Ahli Waris" color="bg-purple-500">
          <p>Jika Σfurudh &lt; 1 dan <strong>tidak ada ashabah</strong>, sisa dikembalikan secara proporsional.</p>

          <div className="font-medium text-gray-700 dark:text-gray-200 mt-2 mb-1">Aturan Umum</div>
          <p>Sisa dikembalikan ke pemegang furudh <strong>selain pasangan</strong>, proporsional dengan bagian masing-masing. Pasangan tetap menerima bagian tetapnya.</p>
          <Code>
            {`sisa = 1 − Σfurudh\n`}
            {`tambahan[i] = sisa × (bagian[i] / Σfurudh_non_pasangan)\n`}
            {`(pasangan tidak ikut menerima radd)`}
          </Code>

          <div className="font-medium text-gray-700 dark:text-gray-200 mt-3 mb-1">Pengecualian: Pasangan Tunggal</div>
          <Callout icon="🔑" color="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300" title="Sesuai referensi (Ahmad Sarwat, pasal 2.5):">
            Jika pasangan adalah <strong>satu-satunya ahli waris</strong>, sisa dikembalikan ke pasangan — ia mengambil seluruh harta.
          </Callout>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
            <ExampleBox
              title="Radd: Ibu + 1 Anak Perempuan (tanpa pasangan)"
              result={{ adjustment: 'radd' }}
              heirs={[
                { label: 'Ibu (1/6 → radd → 1/4)', share: '1/4' },
                { label: 'Anak Perempuan (1/2 → radd → 3/4)', share: '3/4' },
              ]}
              note="Sisa 1/3 dibagi proporsional: ibu dapat 1/3÷(1/6+1/2)×1/6 = 1/4"
            />
            <ExampleBox
              title="Radd: Istri + Ibu + 1 Saudara Seibu"
              result={{ adjustment: 'radd' }}
              heirs={[
                { label: 'Istri (1/4, tidak ikut radd)', share: '1/4' },
                { label: 'Ibu (1/3 → radd → 1/2)', share: '1/2' },
                { label: 'Saudara Seibu (1/6 → radd → 1/4)', share: '1/4' },
              ]}
              note="Sisa 5/12 dibagi antara ibu & seibu (2:1)"
            />
          </div>
        </Step>

        <Step n={7} title="Ashlul-Masalah — Asal Masalah & Siham" color="bg-teal-500">
          <p>Konversi semua bagian ke bilangan bulat (siham) untuk kemudahan verifikasi:</p>
          <Code>
            {`asal_masalah = LCM(penyebut₁, penyebut₂, ..., penyebutₙ)\n`}
            {`siham[i] = pembilang[i] × (asal_masalah / penyebut[i])\n\n`}
            {`Verifikasi: Σsiham = asal_masalah`}
          </Code>
          <ExampleBox
            title="Contoh: Istri (1/8) + Ibu (1/6) + Ayah (1/6) + Anak Laki (13/24)"
            heirs={[
              { label: 'LCM(8,6,6,24) = 24 → asal masalah', share: '24' },
              { label: 'Istri: 1×(24/8)', share: '3 siham' },
              { label: 'Ibu: 1×(24/6)', share: '4 siham' },
              { label: 'Ayah: 1×(24/6)', share: '4 siham' },
              { label: 'Anak Laki: 13×(24/24)', share: '13 siham' },
            ]}
            note="3+4+4+13 = 24 ✓"
          />
        </Step>

        <Step n={8} title="Nominal IDR & Rekonsiliasi" color="bg-emerald-600">
          <p>Konversi siham ke rupiah dan pastikan total persis sama dengan total harta:</p>
          <Code>
            {`nominal[i] = round(harta × share[i])\n\n`}
            {`# Rekonsiliasi pembulatan:\n`}
            {`drift = harta − Σnominal\n`}
            {`# Bebankan drift ke bagian terbesar (biasanya ashabah)\n`}
            {`nominal[terbesar] += drift`}
          </Code>
          <Callout icon="✅" color="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300" title="Jaminan:">
            Total semua nominal selalu persis sama dengan total harta yang dimasukkan — tidak ada selisih pembulatan yang hilang.
          </Callout>
        </Step>
      </div>

      {/* Hijab detail */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-3">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">Ringkasan Aturan Hijab</h3>
        <Table
          headers={['Ahli Waris', 'Bagian', 'Diblokir Oleh']}
          rows={[
            ['Suami', '1/2 atau 1/4', '—'],
            ['Istri', '1/4 atau 1/8', '—'],
            ['Anak Laki-laki', 'Ashabah', '—'],
            ['Anak Perempuan', '1/2, 2/3, atau ashabah', '—'],
            ['Cucu Laki (via anak laki)', 'Ashabah', 'Anak laki-laki'],
            ['Cucu Perempuan (via anak laki)', '1/2, 2/3, 1/6, atau ashabah', 'Anak laki-laki (atau 2+ anak pr tanpa cucu lk)'],
            ['Ayah', '1/6, 1/6+sisa, atau ashabah', '—'],
            ['Ibu', '1/6 atau 1/3 (atau 1/3 sisa)', '—'],
            ['Kakek', 'Seperti ayah + muqasamah', 'Ayah'],
            ['Nenek dari Ibu', '1/6', 'Ibu'],
            ['Nenek dari Ayah', '1/6', 'Ibu, atau Ayah'],
            ['Saudara/i Kandung', '1/2, 2/3, ashabah, atau ma\'al ghair', 'Anak laki, Ayah'],
            ['Saudara/i Seayah', 'Seperti kandung + 1/6 pelengkap', 'Anak laki, Ayah, Saudara laki kandung'],
            ['Saudara/i Seibu', '1/6 atau 1/3', 'Keturunan apa pun, Ayah, Kakek'],
          ]}
        />
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 dark:text-gray-500 py-2">
        Hasil perhitungan bersifat indikatif. Konsultasikan dengan ulama untuk kepastian hukum.
      </div>
    </div>
  );
}
