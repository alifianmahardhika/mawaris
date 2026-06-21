import { useState } from 'react';

interface Props {
  hartaSuami: number;
  hartaIstri: number;
  onChangeSuami: (v: number) => void;
  onChangeIstri: (v: number) => void;
}

function CurrencyInput({
  value, onChange, label, id, variant,
}: {
  value: number; onChange: (v: number) => void;
  label: string; id: string; variant: 'blue' | 'rose';
}) {
  const [raw, setRaw] = useState(value > 0 ? value.toLocaleString('id-ID') : '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/[^\d]/g, '');
    const num = clean ? parseInt(clean, 10) : 0;
    setRaw(num > 0 ? num.toLocaleString('id-ID') : '');
    onChange(num);
  };

  const ringClass = variant === 'blue'
    ? 'focus:ring-blue-300 dark:focus:ring-blue-700 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20'
    : 'focus:ring-rose-300 dark:focus:ring-rose-700 border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20';

  const labelClass = variant === 'blue'
    ? 'text-blue-700 dark:text-blue-400'
    : 'text-rose-700 dark:text-rose-400';

  return (
    <div className="flex-1">
      <label htmlFor={id} className={`block text-sm font-medium mb-1 ${labelClass}`}>
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 text-sm select-none">
          Rp
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={raw}
          onChange={handleChange}
          onFocus={e => e.target.select()}
          placeholder="0"
          className={`w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm font-medium text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 transition-colors placeholder-gray-300 dark:placeholder-gray-600 ${ringClass}`}
        />
      </div>
    </div>
  );
}

export function EstateInputs({ hartaSuami, hartaIstri, onChangeSuami, onChangeIstri }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
      <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
        <span className="text-base">💰</span>
        Harta Peninggalan
      </h2>
      <div className="flex flex-col sm:flex-row gap-3">
        <CurrencyInput id="harta-suami" label="Harta Suami" value={hartaSuami} onChange={onChangeSuami} variant="blue" />
        <CurrencyInput id="harta-istri" label="Harta Istri"  value={hartaIstri} onChange={onChangeIstri} variant="rose" />
      </div>
    </div>
  );
}
