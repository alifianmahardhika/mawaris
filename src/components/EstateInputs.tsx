/**
 * Input harta suami dan istri (nominal IDR).
 */
import { useState } from 'react';
import { parseIDR } from '../lib/formatCurrency';

interface Props {
  hartaSuami: number;
  hartaIstri: number;
  onChangeSuami: (v: number) => void;
  onChangeIstri: (v: number) => void;
}

function CurrencyInput({
  value, onChange, label, id, accentClass,
}: {
  value: number; onChange: (v: number) => void;
  label: string; id: string; accentClass: string;
}) {
  const [raw, setRaw] = useState(value > 0 ? value.toLocaleString('id-ID') : '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Izinkan hanya digit dan titik (pemisah ribuan Indonesia)
    const clean = input.replace(/[^\d]/g, '');
    const num = clean ? parseInt(clean, 10) : 0;
    setRaw(num > 0 ? num.toLocaleString('id-ID') : '');
    onChange(num);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  return (
    <div className="flex-1">
      <label htmlFor={id} className={`block text-sm font-medium mb-1 ${accentClass}`}>
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">
          Rp
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={raw}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder="0"
          className={`
            w-full pl-10 pr-3 py-2.5 border rounded-lg text-sm font-medium
            focus:outline-none focus:ring-2 transition-colors
            ${accentClass === 'text-blue-700'
              ? 'focus:ring-blue-300 border-blue-200 bg-blue-50'
              : 'focus:ring-rose-300 border-rose-200 bg-rose-50'}
          `}
        />
      </div>
    </div>
  );
}

export function EstateInputs({ hartaSuami, hartaIstri, onChangeSuami, onChangeIstri }: Props) {
  void parseIDR; // imported untuk dipakai di CurrencyInput

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <span className="text-base">💰</span>
        Harta Peninggalan
      </h2>
      <div className="flex flex-col sm:flex-row gap-3">
        <CurrencyInput
          id="harta-suami"
          label="Harta Suami"
          value={hartaSuami}
          onChange={onChangeSuami}
          accentClass="text-blue-700"
        />
        <CurrencyInput
          id="harta-istri"
          label="Harta Istri"
          value={hartaIstri}
          onChange={onChangeIstri}
          accentClass="text-rose-700"
        />
      </div>
    </div>
  );
}
