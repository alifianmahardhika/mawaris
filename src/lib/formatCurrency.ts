const fmt = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export function formatIDR(amount: number): string {
  return fmt.format(amount);
}

export function parseIDR(raw: string): number {
  // Hapus semua non-digit
  const digits = raw.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

/** Format angka sebagai input IDR (tanpa simbol, pakai titik ribuan) */
export function formatInputIDR(amount: number): string {
  if (!amount) return '';
  return amount.toLocaleString('id-ID');
}
