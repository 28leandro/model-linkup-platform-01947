export const formatPrice = (value: number | null | undefined, currency?: string) => {
  const n = Number(value || 0);
  const formatted = new Intl.NumberFormat('de-DE', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(n);
  const symbol = currency === 'USD' ? 'US$' : 'Gs.';
  return `${symbol} ${formatted}`;
};