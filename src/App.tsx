import { useFormState } from './state/formState';
import { useFaraidh } from './hooks/useFaraidh';
import { EstateInputs } from './components/EstateInputs';
import { SharedChildrenInput } from './components/SharedChildrenInput';
import { ResultColumn } from './components/ResultColumn';

export default function App() {
  const {
    state, setHartaSuami, setHartaIstri,
    setSharedChild, setHusbandSide, setWifeSide, reset,
  } = useFormState();

  const { suamiWafat, istriWafat } = useFaraidh(state);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚖️</span>
            <div>
              <h1 className="text-base font-bold text-gray-800 leading-tight">
                Kalkulator Warisan Islam
              </h1>
              <p className="text-xs text-gray-500">Faraidh / Mawaris — Madzhab Syafi'i</p>
            </div>
          </div>
          <button
            type="button"
            onClick={reset}
            className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded px-2 py-1 transition-colors"
          >
            Reset
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        {/* Panduan singkat */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800">
          <strong>Cara pakai:</strong> Isi nominal harta suami &amp; istri, lalu atur jumlah
          anak/cucu (berlaku untuk keduanya) dan ahli waris keluarga masing-masing di tiap kolom.
          Perhitungan otomatis tampil sesuai hukum faraidh.
        </div>

        {/* Harta */}
        <EstateInputs
          hartaSuami={state.hartaSuami}
          hartaIstri={state.hartaIstri}
          onChangeSuami={setHartaSuami}
          onChangeIstri={setHartaIstri}
        />

        {/* Anak & cucu bersama */}
        <SharedChildrenInput
          state={state}
          onChange={setSharedChild}
        />

        {/* Dua kolom hasil */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <ResultColumn
            deceased="suami"
            result={suamiWafat}
            sideState={state.husbandSide}
            onSideChange={setHusbandSide}
            estate={state.hartaSuami}
          />
          <ResultColumn
            deceased="istri"
            result={istriWafat}
            sideState={state.wifeSide}
            onSideChange={setWifeSide}
            estate={state.hartaIstri}
          />
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-gray-400 py-4 border-t border-gray-100">
          <p>
            Berdasarkan <em>Fiqih Mawaris</em> — Ahmad Sarwat, Lc., MA. | Madzhab Syafi'i (Jumhur)
          </p>
          <p className="mt-1">
            Hasil perhitungan bersifat indikatif. Konsultasikan dengan ulama/ahli waris
            untuk kepastian hukum.
          </p>
        </footer>
      </main>
    </div>
  );
}
