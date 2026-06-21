import { useState } from 'react';
import type { ScenarioResult } from '../engine/types';
import type { SideState } from '../state/formState';
import { HeirColumnInputs } from './HeirColumnInputs';
import { ScenarioSummary } from './ScenarioSummary';
import { HeirRow } from './HeirRow';

interface Props {
  deceased: 'suami' | 'istri';
  result: ScenarioResult | null;
  sideState: SideState;
  onSideChange: (key: keyof SideState, value: number) => void;
  estate: number;
}

export function ResultColumn({ deceased, result, sideState, onSideChange, estate }: Props) {
  const [showInputs, setShowInputs] = useState(true);
  const isSuami = deceased === 'suami';
  const title = isSuami ? 'Jika Suami Wafat' : 'Jika Istri Wafat';
  const icon = isSuami ? '👨' : '👩';
  const headerBg = isSuami ? 'bg-blue-600 dark:bg-blue-700' : 'bg-rose-600 dark:bg-rose-700';
  const borderColor = isSuami ? 'border-blue-200 dark:border-blue-800' : 'border-rose-200 dark:border-rose-800';
  const accentText = isSuami ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400';

  const activeHeirs = result ? result.heirs.filter(h => h.status !== 'mahjub') : [];
  const mahjubHeirs = result ? result.heirs.filter(h => h.status === 'mahjub') : [];

  return (
    <div className={`border ${borderColor} rounded-xl overflow-hidden flex flex-col bg-white dark:bg-gray-800`}>
      {/* Header */}
      <div className={`${headerBg} px-4 py-3 flex items-center gap-3`}>
        <span className="text-xl">{icon}</span>
        <div>
          <div className="font-semibold text-sm text-white">{title}</div>
          <div className="text-xs text-white/70">
            {estate > 0 ? `Harta: Rp ${estate.toLocaleString('id-ID')}` : 'Masukkan harta di atas'}
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {/* Input ahli waris */}
        <div className="p-4">
          <button
            type="button"
            onClick={() => setShowInputs(!showInputs)}
            className={`text-xs font-semibold uppercase tracking-wide ${accentText} flex items-center gap-1 mb-2`}
          >
            <span className={`transition-transform ${showInputs ? 'rotate-90' : ''}`}>▶</span>
            Ahli Waris {isSuami ? 'Suami' : 'Istri'}
          </button>
          {showInputs && (
            <HeirColumnInputs side={deceased} state={sideState} onChange={onSideChange} />
          )}
        </div>

        {/* Hasil */}
        <div className="p-4">
          {estate <= 0 ? (
            <div className="text-center text-gray-400 dark:text-gray-500 text-sm py-6">
              Masukkan nominal harta di atas untuk melihat perhitungan
            </div>
          ) : result === null ? (
            <div className="text-center text-gray-400 dark:text-gray-500 text-sm py-6">Menghitung…</div>
          ) : (
            <>
              <ScenarioSummary result={result} />
              <div className="space-y-2">
                {activeHeirs.length === 0 && mahjubHeirs.length === 0 && (
                  <div className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
                    Tidak ada ahli waris yang dimasukkan.
                  </div>
                )}
                {activeHeirs.map(heir => <HeirRow key={heir.kind} heir={heir} />)}
                {mahjubHeirs.length > 0 && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 select-none">
                      {mahjubHeirs.length} ahli waris terhalang (mahjub)
                    </summary>
                    <div className="mt-1 space-y-1">
                      {mahjubHeirs.map(heir => <HeirRow key={heir.kind} heir={heir} />)}
                    </div>
                  </details>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
