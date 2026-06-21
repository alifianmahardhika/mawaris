import { useState } from 'react';
import type { HeirResult } from '../engine/types';
import { formatFraction, formatPercent } from '../lib/formatFraction';
import { formatIDR } from '../lib/formatCurrency';

interface Props {
  heir: HeirResult;
}

export function HeirRow({ heir }: Props) {
  const [showReason, setShowReason] = useState(false);
  const isMahjub = heir.status === 'mahjub';

  const statusBadge = () => {
    switch (heir.status) {
      case 'furudh':          return <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Furudh</span>;
      case 'ashabah':         return <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Ashabah</span>;
      case 'furudh+ashabah':  return <span className="text-xs bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded">Furudh+Sisa</span>;
      case 'radd':            return <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Radd</span>;
      case 'mahjub':          return <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Mahjub</span>;
    }
  };

  return (
    <div className={`border rounded-lg overflow-hidden ${isMahjub ? 'opacity-50 bg-gray-50' : 'bg-white'}`}>
      <div className="px-3 py-2 flex items-center justify-between gap-2">
        {/* Kiri: nama + badge */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-medium text-sm ${isMahjub ? 'text-gray-400' : 'text-gray-800'}`}>
              {heir.label}
              {heir.count > 1 && (
                <span className="text-gray-400 font-normal ml-1">×{heir.count}</span>
              )}
            </span>
            {statusBadge()}
          </div>
        </div>

        {/* Kanan: bagian + jumlah */}
        <div className="text-right shrink-0">
          {isMahjub ? (
            <span className="text-xs text-gray-400 italic">Terhalang</span>
          ) : (
            <>
              <div className="font-bold text-emerald-700 text-sm">
                {formatFraction(heir.share)}
                <span className="text-gray-400 text-xs font-normal ml-1">
                  ({formatPercent(heir.share)})
                </span>
              </div>
              <div className="text-xs text-gray-600">{formatIDR(heir.amount)}</div>
              {heir.count > 1 && (
                <div className="text-xs text-gray-400">
                  {formatIDR(heir.amountPerHead)}/orang
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Alasan (collapsible) */}
      <div className="border-t border-gray-100">
        <button
          onClick={() => setShowReason(!showReason)}
          className="w-full text-left px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 flex items-center gap-1 transition-colors"
        >
          <span className={`transition-transform ${showReason ? 'rotate-90' : ''}`}>▶</span>
          <span>Dasar hukum</span>
        </button>
        {showReason && (
          <div className="px-3 py-2 text-xs text-gray-600 bg-gray-50 border-t border-gray-100 leading-relaxed">
            {heir.reason}
          </div>
        )}
      </div>
    </div>
  );
}
