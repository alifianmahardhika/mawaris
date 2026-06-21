import { useReducer } from 'react';
import type { HeirKind } from '../engine/types';

/** Sub-state untuk satu pihak (suami atau istri) — keluarga spesifik mereka */
export interface SideState {
  ayah: number;
  ibu: number;
  kakek: number;
  nenekDariIbu: number;
  nenekDariAyah: number;
  saudaraLkKandung: number;
  saudariPrKandung: number;
  saudaraLkSeayah: number;
  saudariPrSeayah: number;
  saudaraSeibu: number;
}

const emptySide = (): SideState => ({
  ayah: 0, ibu: 0, kakek: 0,
  nenekDariIbu: 0, nenekDariAyah: 0,
  saudaraLkKandung: 0, saudariPrKandung: 0,
  saudaraLkSeayah: 0, saudariPrSeayah: 0,
  saudaraSeibu: 0,
});

export interface FormState {
  hartaSuami: number;
  hartaIstri: number;
  anakLk: number;
  anakPr: number;
  cucuLkDariAnakLk: number;
  cucuPrDariAnakLk: number;
  husbandSide: SideState; // keluarga suami (berlaku saat suami wafat)
  wifeSide: SideState;    // keluarga istri (berlaku saat istri wafat)
}

const initialState: FormState = {
  hartaSuami: 0,
  hartaIstri: 0,
  anakLk: 0,
  anakPr: 0,
  cucuLkDariAnakLk: 0,
  cucuPrDariAnakLk: 0,
  husbandSide: emptySide(),
  wifeSide: emptySide(),
};

// ── Actions ──────────────────────────────────────────────────────────────────

type SharedChildKey = 'anakLk' | 'anakPr' | 'cucuLkDariAnakLk' | 'cucuPrDariAnakLk';
type SideKey = keyof SideState;

type Action =
  | { type: 'SET_HARTA_SUAMI'; value: number }
  | { type: 'SET_HARTA_ISTRI'; value: number }
  | { type: 'SET_SHARED_CHILD'; key: SharedChildKey; value: number }
  | { type: 'SET_HUSBAND_SIDE'; key: SideKey; value: number }
  | { type: 'SET_WIFE_SIDE'; key: SideKey; value: number }
  | { type: 'RESET' };

function reducer(state: FormState, action: Action): FormState {
  switch (action.type) {
    case 'SET_HARTA_SUAMI':
      return { ...state, hartaSuami: action.value };
    case 'SET_HARTA_ISTRI':
      return { ...state, hartaIstri: action.value };
    case 'SET_SHARED_CHILD':
      return { ...state, [action.key]: action.value };
    case 'SET_HUSBAND_SIDE':
      return { ...state, husbandSide: { ...state.husbandSide, [action.key]: action.value } };
    case 'SET_WIFE_SIDE':
      return { ...state, wifeSide: { ...state.wifeSide, [action.key]: action.value } };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function useFormState() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setHartaSuami = (v: number) => dispatch({ type: 'SET_HARTA_SUAMI', value: v });
  const setHartaIstri = (v: number) => dispatch({ type: 'SET_HARTA_ISTRI', value: v });
  const setSharedChild = (key: SharedChildKey, v: number) =>
    dispatch({ type: 'SET_SHARED_CHILD', key, value: v });
  const setHusbandSide = (key: SideKey, v: number) =>
    dispatch({ type: 'SET_HUSBAND_SIDE', key, value: v });
  const setWifeSide = (key: SideKey, v: number) =>
    dispatch({ type: 'SET_WIFE_SIDE', key, value: v });
  const reset = () => dispatch({ type: 'RESET' });

  return {
    state, setHartaSuami, setHartaIstri, setSharedChild,
    setHusbandSide, setWifeSide, reset,
  };
}

// ── Helper: konversi FormState → HeirInput[] untuk satu skenario ─────────────

import type { HeirInput } from '../engine/types';

export function buildHeirInputs(
  state: FormState,
  deceased: 'suami' | 'istri',
): HeirInput[] {
  const side = deceased === 'suami' ? state.husbandSide : state.wifeSide;
  const spouse: HeirKind = deceased === 'suami' ? 'istri' : 'suami';

  const inputs: HeirInput[] = [
    { kind: spouse, count: 1 }, // selalu ada 1 pasangan hidup
    { kind: 'anakLk', count: state.anakLk },
    { kind: 'anakPr', count: state.anakPr },
    { kind: 'cucuLkDariAnakLk', count: state.cucuLkDariAnakLk },
    { kind: 'cucuPrDariAnakLk', count: state.cucuPrDariAnakLk },
    { kind: 'ayah', count: side.ayah },
    { kind: 'ibu', count: side.ibu },
    { kind: 'kakek', count: side.kakek },
    { kind: 'nenekDariIbu', count: side.nenekDariIbu },
    { kind: 'nenekDariAyah', count: side.nenekDariAyah },
    { kind: 'saudaraLkKandung', count: side.saudaraLkKandung },
    { kind: 'saudariPrKandung', count: side.saudariPrKandung },
    { kind: 'saudaraLkSeayah', count: side.saudaraLkSeayah },
    { kind: 'saudariPrSeayah', count: side.saudariPrSeayah },
    { kind: 'saudaraSeibu', count: side.saudaraSeibu },
  ];

  // Filter yang count 0 — kecuali spouse (selalu ada)
  return inputs.filter(h => h.count > 0 || h.kind === spouse);
}
