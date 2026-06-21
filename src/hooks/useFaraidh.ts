import { useMemo } from 'react';
import { calculate } from '../engine/calculate';
import type { ScenarioResult } from '../engine/types';
import { buildHeirInputs } from '../state/formState';
import type { FormState } from '../state/formState';

export interface FaradhResults {
  suamiWafat: ScenarioResult | null;
  istriWafat: ScenarioResult | null;
}

export function useFaraidh(state: FormState): FaradhResults {
  const suamiWafat = useMemo(() => {
    if (state.hartaSuami <= 0) return null;
    try {
      return calculate(
        { estate: state.hartaSuami, heirs: buildHeirInputs(state, 'suami') },
        'suami',
      );
    } catch {
      return null;
    }
  }, [state]);

  const istriWafat = useMemo(() => {
    if (state.hartaIstri <= 0) return null;
    try {
      return calculate(
        { estate: state.hartaIstri, heirs: buildHeirInputs(state, 'istri') },
        'istri',
      );
    } catch {
      return null;
    }
  }, [state]);

  return { suamiWafat, istriWafat };
}
