/**
 * Satu kolom hasil: input ahli waris pihak terkait + ringkasan + daftar baris.
 */
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
  const accent = isSuami ? 'blue' : 'rose';
  const title = isSuami ? 'Jika Suami Wafat' : 'Jika Istri Wafat';
  const icon = isSuami ? '👨' : '👩';

  const headerBg = isSuami
    ? 'bg-blue-600 text-white'
    : 'bg-rose-600 text-white';

  const borderColor = isSuami ? 'border-blue-200' : 'border-rose-200';

  const activeHeirs = result ? result.heirs.filter(h => h.status !== 'mahjub') : [];
  const mahjubHeirs = result ? result.heirs.filter(h => h.status === 'mahjub') : [];

  return (
    <div className={`border ${borderColor} rounded-xl overflow-hidden flex flex-col`}>
      {/* Header */}
      <div className={`${headerBg} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <div>
            <div className="font-semibold text-sm">{title}</div>
            <div className="text-xs opacity-80">
              {estate > 0
                ? `Harta: Rp ${estate.toLocaleString('id-ID')}`
                : 'Masukkan harta di atas'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-0 divide-y divide-gray-100">
        {/* Input ahli waris pihak ini */}
        <div className="p-4">
          <button
            type="button"
            onClick={() => setShowInputs(!showInputs)}
            className={`text-xs font-semibold uppercase tracking-wide text-${accent}-600 flex items-center gap-1 mb-2`}
          >
            <span className={`transition-transform ${showInputs ? 'rotate-90' : ''}`}>▶</span>
            Ahli Waris {isSuami ? 'Suami' : 'Istri'}
          </button>
          {showInputs && (
            <HeirColumnInputs
              side={deceased}
              state={sideState}
              onChange={onSideChange}
            />
          )}
        </div>

        {/* Hasil perhitungan */}
        <div className="p-4">
          {estate <= 0 ? (
            <div className="text-center text-gray-400 text-sm py-6">
              Masukkan nominal harta di atas untuk melihat perhitungan
            </div>
          ) : result === null ? (
            <div className="text-center text-gray-400 text-sm py-6">
              Menghitung…
            </div>
          ) : (
            <>
              <ScenarioSummary result={result} />
              <div className="space-y-2">
                {activeHeirs.length === 0 && mahjubHeirs.length === 0 && (
                  <div className="text-sm text-gray-400 text-center py-4">
                    Tidak ada ahli waris yang dimasukkan.
                  </div>
                )}
                {activeHeirs.map(heir => (
                  <HeirRow key={heir.kind} heir={heir} />
                ))}
                {mahjubHeirs.length > 0 && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none">
                      {mahjubHeirs.length} ahli waris terhalang (mahjub)
                    </summary>
                    <div className="mt-1 space-y-1">
                      {mahjubHeirs.map(heir => (
                        <HeirRow key={heir.kind} heir={heir} />
                      ))}
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
