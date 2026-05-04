export const formatPrice = (value: number | null | undefined, currency?: string) => {
  const n = Math.round(Number(value || 0));
  if (currency === 'USD') {
    // USD: comma as thousands separator, 2 decimals (e.g. US$ 1,500.00)
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
    return `US$ ${formatted}`;
  }
  // PYG / Guaraní: dot as thousands separator, no decimals (e.g. Gs. 1.500.000)
  const formatted = new Intl.NumberFormat('es-PY', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    useGrouping: true,
  }).format(n).replace(/[\u00A0\s]/g, '.');
  // Ensure dots (some runtimes return narrow no-break space for es-PY)
  const safe = /\d[.,]\d/.test(formatted) ? formatted : n.toLocaleString('de-DE');
  return `Gs. ${safe}`;
};