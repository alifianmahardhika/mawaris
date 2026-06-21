import { describe, it, expect } from 'vitest';
import { Fraction, gcd, lcm, sumFractions } from '../src/engine/fraction';

describe('Fraction', () => {
  it('reduces fraction', () => {
    const f = Fraction.of(6, 8);
    expect(f.n).toBe(3);
    expect(f.d).toBe(4);
  });

  it('handles negative denominator', () => {
    const f = Fraction.of(1, -2);
    expect(f.n).toBe(-1);
    expect(f.d).toBe(2);
  });

  it('toString', () => {
    expect(Fraction.of(1, 2).toString()).toBe('1/2');
    expect(Fraction.of(3, 1).toString()).toBe('3');
    expect(Fraction.zero.toString()).toBe('0');
  });

  it('add', () => {
    const r = Fraction.of(1, 4).add(Fraction.of(1, 8));
    expect(r.toString()).toBe('3/8');
  });

  it('sub', () => {
    const r = Fraction.of(1, 2).sub(Fraction.of(1, 8));
    expect(r.toString()).toBe('3/8');
  });

  it('mul', () => {
    const r = Fraction.of(1, 3).mul(Fraction.of(3, 4));
    expect(r.toString()).toBe('1/4');
  });

  it('scale', () => {
    expect(Fraction.of(1, 8).scale(7).toString()).toBe('7/8');
  });

  it('divBy', () => {
    expect(Fraction.of(1, 2).divBy(3).toString()).toBe('1/6');
  });

  it('cmp', () => {
    expect(Fraction.of(1, 3).cmp(Fraction.of(1, 4))).toBe(1);
    expect(Fraction.of(1, 3).cmp(Fraction.of(2, 6))).toBe(0);
    expect(Fraction.of(1, 4).cmp(Fraction.of(1, 3))).toBe(-1);
  });

  it('toNumber', () => {
    expect(Fraction.of(1, 4).toNumber()).toBeCloseTo(0.25);
  });
});

describe('gcd and lcm', () => {
  it('gcd(8, 12) = 4', () => expect(gcd(8, 12)).toBe(4));
  it('lcm(4, 6) = 12', () => expect(lcm(4, 6)).toBe(12));
  it('lcm(6, 8) = 24', () => expect(lcm(6, 8)).toBe(24));
});

describe('sumFractions', () => {
  it('sums correctly', () => {
    const total = sumFractions([Fraction.of(1, 2), Fraction.of(1, 4), Fraction.of(1, 8)]);
    expect(total.toString()).toBe('7/8');
  });

  it('empty array = 0', () => {
    expect(sumFractions([]).toString()).toBe('0');
  });
});
