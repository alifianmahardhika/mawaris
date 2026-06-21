import type { ScenarioResult } from '../engine/types';
import { formatIDR } from '../lib/formatCurrency';

interface Props {
  result: ScenarioResult;
}

export function ScenarioSummary({ result }: Props) {
  const { adjustment, asalMasalahAsli, asalMasalah, warnings } = result;

  return (
    <div className="space-y-2 mb-3">
      {/* Asal masalah */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="font-medium">Asal masalah:</span>
        {adjustment === 'aul' ? (
          <span>
            <span className="line-through text-gray-400">{asalMasalahAsli}</span>
            <span className="ml-1 text-orange-600 font-semibold">{asalMasalah}</span>
            <span className="ml-1 text-orange-600">(naik karena ʿaul)</span>
          </span>
        ) : (
          <span className="font-semibold text-gray-700">{asalMasalah}</span>
        )}
      </div>

      {/* Total harta */}
      <div className="text-xs text-gray-500">
        <span className="font-medium">Total harta:</span>{' '}
        <span className="font-semibold text-gray-700">{formatIDR(result.estate)}</span>
      </div>

      {/* Banner penyesuaian */}
      {adjustment === 'aul' && (
        <div className="flex items-start gap-2 p-2 bg-orange-50 border border-orange-200 rounded-lg text-xs text-orange-700">
          <span className="text-base leading-none mt-0.5">⚠️</span>
          <div>
            <span className="font-semibold">ʿAul:</span> Total bagian furudh melebihi harta.
            Asal masalah dinaikkan dari <strong>{asalMasalahAsli}</strong> ke{' '}
            <strong>{asalMasalah}</strong>, sehingga semua bagian dikurangi secara proporsional.
          </div>
        </div>
      )}

      {adjustment === 'radd' && (
        <div className="flex items-start gap-2 p-2 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-700">
          <span className="text-base leading-none mt-0.5">ℹ️</span>
          <div>
            <span className="font-semibold">Radd:</span> Tidak ada ashabah dan total furudh
            kurang dari harta. Sisa dikembalikan ke ahli waris yang berhak secara proporsional.
          </div>
        </div>
      )}

      {/* Peringatan */}
      {warnings.map((w, i) => (
        <div key={i} className="flex items-start gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
          <span className="text-base leading-none mt-0.5">⚠️</span>
          <span>{w}</span>
        </div>
      ))}
    </div>
  );
}
