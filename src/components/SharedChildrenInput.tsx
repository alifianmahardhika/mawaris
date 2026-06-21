/**
 * Input anak dan cucu yang dibagikan ke kedua skenario.
 */
import type { FormState } from '../state/formState';

type ChildKey = 'anakLk' | 'anakPr' | 'cucuLkDariAnakLk' | 'cucuPrDariAnakLk';

interface Props {
  state: FormState;
  onChange: (key: ChildKey, value: number) => void;
}

const FIELDS: { key: ChildKey; label: string; note?: string }[] = [
  { key: 'anakLk',            label: 'Anak Laki-laki' },
  { key: 'anakPr',            label: 'Anak Perempuan' },
  { key: 'cucuLkDariAnakLk',  label: 'Cucu Laki-laki', note: 'dari anak laki' },
  { key: 'cucuPrDariAnakLk',  label: 'Cucu Perempuan', note: 'dari anak laki' },
];

export function SharedChildrenInput({ state, onChange }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <span className="text-base">👨‍👩‍👧‍👦</span>
        Anak &amp; Cucu (berlaku untuk kedua skenario)
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {FIELDS.map(({ key, label, note }) => {
          const val = state[key];
          return (
            <div key={key} className="text-center">
              <div className="text-xs text-gray-600 mb-1 leading-tight">
                {label}
                {note && <div className="text-gray-400">{note}</div>}
              </div>
              <div className="flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => onChange(key, Math.max(0, val - 1))}
                  disabled={val === 0}
                  className="w-7 h-7 rounded border text-gray-500 hover:bg-gray-100 disabled:opacity-30 text-sm"
                >
                  −
                </button>
                <span className="w-8 text-center font-bold text-lg tabular-nums">{val}</span>
                <button
                  type="button"
                  onClick={() => onChange(key, Math.min(20, val + 1))}
                  disabled={val >= 20}
                  className="w-7 h-7 rounded border text-gray-500 hover:bg-gray-100 disabled:opacity-30 text-sm"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
