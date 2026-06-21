/**
 * Immutable rational number (fraction) helper.
 * Stores n/d always in reduced form, d > 0.
 */

export function gcd(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a || 1;
}

export function lcm(a: number, b: number): number {
  return (a / gcd(a, b)) * b;
}

export class Fraction {
  readonly n: number;
  readonly d: number;

  private constructor(n: number, d: number) {
    if (d === 0) throw new Error('Denominator cannot be zero');
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(Math.abs(n), d);
    this.n = n / g;
    this.d = d / g;
  }

  static of(n: number, d = 1): Fraction {
    return new Fraction(n, d);
  }

  static readonly zero = new Fraction(0, 1);
  static readonly one  = new Fraction(1, 1);

  isZero(): boolean { return this.n === 0; }
  isPositive(): boolean { return this.n > 0; }

  add(o: Fraction): Fraction {
    return new Fraction(this.n * o.d + o.n * this.d, this.d * o.d);
  }

  sub(o: Fraction): Fraction {
    return new Fraction(this.n * o.d - o.n * this.d, this.d * o.d);
  }

  mul(o: Fraction): Fraction {
    return new Fraction(this.n * o.n, this.d * o.d);
  }

  scale(k: number): Fraction {
    return new Fraction(this.n * k, this.d);
  }

  divBy(k: number): Fraction {
    return new Fraction(this.n, this.d * k);
  }

  /** Compare: -1 < 0 = 1 > */
  cmp(o: Fraction): -1 | 0 | 1 {
    const diff = this.n * o.d - o.n * this.d;
    return diff < 0 ? -1 : diff > 0 ? 1 : 0;
  }

  gt(o: Fraction): boolean { return this.cmp(o) > 0; }
  gte(o: Fraction): boolean { return this.cmp(o) >= 0; }
  lt(o: Fraction): boolean { return this.cmp(o) < 0; }
  eq(o: Fraction): boolean { return this.cmp(o) === 0; }

  toNumber(): number { return this.n / this.d; }

  toString(): string {
    if (this.d === 1) return `${this.n}`;
    return `${this.n}/${this.d}`;
  }

  toPercent(decimals = 1): string {
    return `${(this.toNumber() * 100).toFixed(decimals)}%`;
  }
}

export function sumFractions(fracs: Fraction[]): Fraction {
  return fracs.reduce((acc, f) => acc.add(f), Fraction.zero);
}
