import { useState } from 'react';
import { useFormState } from './state/formState';
import { useFaraidh } from './hooks/useFaraidh';
import { useDarkMode } from './hooks/useDarkMode';
import { EstateInputs } from './components/EstateInputs';
import { SharedChildrenInput } from './components/SharedChildrenInput';
import { ResultColumn } from './components/ResultColumn';
import { CalculationFlowPage } from './pages/CalculationFlowPage';
import { GlossaryPage } from './pages/GlossaryPage';

type Page = 'calculator' | 'flow' | 'glossary';

export default function App() {
  const [page, setPage] = useState<Page>('calculator');
  const { dark, toggle: toggleDark } = useDarkMode();

  const {
    state, setHartaSuami, setHartaIstri,
    setSharedChild, setHusbandSide, setWifeSide, reset,
  } = useFormState();

  const { suamiWafat, istriWafat } = useFaraidh(state);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-200">

      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4">
          {/* Row 1: Brand + Controls */}
          <div className="flex items-center justify-between py-2.5 gap-2">
            {/* Brand */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl shrink-0">⚖️</span>
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight truncate">
                  Kalkulator Warisan Islam
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Faraidh / Mawaris — Madzhab Syafi'i</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {page === 'calculator' && (
                <button
                  type="button"
                  onClick={reset}
                  className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-700 rounded px-2 py-1 transition-colors"
                >
                  Reset
                </button>
              )}
              <button
                type="button"
                onClick={toggleDark}
                aria-label={dark ? 'Mode terang' : 'Mode malam'}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-base"
              >
                {dark ? '☀️' : '🌙'}
              </button>
            </div>
          </div>

          {/* Row 2: Nav tabs — full width */}
          <nav className="flex border-t border-gray-100 dark:border-gray-800">
            {([
              { id: 'calculator', icon: '🧮', label: 'Kalkulator' },
              { id: 'flow',       icon: '📐', label: 'Metode' },
              { id: 'glossary',   icon: '📖', label: 'Istilah' },
            ] as const).map(({ id, icon, label }) => (
              <button
                key={id}
                onClick={() => setPage(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium border-b-2 transition-colors ${
                  page === id
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Page content */}
      <main>
        {page === 'calculator' ? (
          <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
            {/* Panduan */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 text-sm text-emerald-800 dark:text-emerald-300">
              <strong>Cara pakai:</strong> Isi nominal harta suami &amp; istri, atur jumlah
              anak/cucu (berlaku untuk keduanya), dan ahli waris keluarga masing-masing di tiap kolom.
              Perhitungan otomatis tampil sesuai hukum faraidh.{' '}
              <button
                onClick={() => setPage('flow')}
                className="underline hover:no-underline font-medium"
              >
                Pelajari metode →
              </button>{' '}
              <button
                onClick={() => setPage('glossary')}
                className="underline hover:no-underline font-medium"
              >
                Lihat glosarium →
              </button>
            </div>

            <EstateInputs
              hartaSuami={state.hartaSuami}
              hartaIstri={state.hartaIstri}
              onChangeSuami={setHartaSuami}
              onChangeIstri={setHartaIstri}
            />

            <SharedChildrenInput state={state} onChange={setSharedChild} />

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

            <footer className="text-center text-xs text-gray-400 dark:text-gray-500 py-4 border-t border-gray-100 dark:border-gray-800">
              <p>
                Berdasarkan <em>Fiqih Mawaris</em> — Ahmad Sarwat, Lc., MA. | Madzhab Syafi'i (Jumhur)
              </p>
              <p className="mt-1">
                Hasil perhitungan bersifat indikatif. Konsultasikan dengan ulama/ahli waris
                untuk kepastian hukum.
              </p>
            </footer>
          </div>
        ) : page === 'flow' ? (
          <CalculationFlowPage />
        ) : (
          <GlossaryPage />
        )}
      </main>
    </div>
  );
}
