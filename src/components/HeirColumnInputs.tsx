import type { SideState } from '../state/formState';

interface Props {
  side: 'suami' | 'istri';
  state: SideState;
  onChange: (key: keyof SideState, value: number) => void;
}

interface FieldDef {
  key: keyof SideState;
  label: string;
  max?: number;
}

const FIELDS: FieldDef[] = [
  { key: 'ayah',              label: 'Ayah',                        max: 1  },
  { key: 'ibu',               label: 'Ibu',                         max: 1  },
  { key: 'kakek',             label: 'Kakek (dari Ayah)',           max: 1  },
  { key: 'nenekDariIbu',      label: 'Nenek (dari Ibu)',            max: 1  },
  { key: 'nenekDariAyah',     label: 'Nenek (dari Ayah)',           max: 1  },
  { key: 'saudaraLkKandung',  label: 'Saudara Laki-laki Kandung',  max: 20 },
  { key: 'saudariPrKandung',  label: 'Saudari Perempuan Kandung',  max: 20 },
  { key: 'saudaraLkSeayah',   label: 'Saudara Laki-laki Seayah',  max: 20 },
  { key: 'saudariPrSeayah',   label: 'Saudari Perempuan Seayah',  max: 20 },
  { key: 'saudaraSeibu',      label: 'Saudara/Saudari Seibu',      max: 20 },
];

export function HeirColumnInputs({ side, state, onChange }: Props) {
  const title = side === 'suami' ? 'Keluarga Suami' : 'Keluarga Istri';
  const accent = side === 'suami' ? 'text-blue-700 dark:text-blue-400' : 'text-rose-700 dark:text-rose-400';

  return (
    <div>
      <h3 className={`text-xs font-semibold uppercase tracking-wide ${accent} mb-2`}>
        {title}
      </h3>
      <div className="space-y-1.5">
        {FIELDS.map(({ key, label, max }) => {
          const val = state[key];
          return (
            <div key={key} className="flex items-center justify-between gap-2">
              <label className="text-sm text-gray-600 dark:text-gray-300 flex-1">{label}</label>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onChange(key, Math.max(0, val - 1))}
                  disabled={val === 0}
                  className="w-6 h-6 rounded border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 text-xs flex items-center justify-center transition-colors"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-medium tabular-nums text-gray-800 dark:text-gray-100">{val}</span>
                <button
                  type="button"
                  onClick={() => onChange(key, Math.min(max ?? 99, val + 1))}
                  disabled={val >= (max ?? 99)}
                  className="w-6 h-6 rounded border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 text-xs flex items-center justify-center transition-colors"
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
