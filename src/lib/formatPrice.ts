export const formatPrice = (value: number | null | undefined, currency?: string) => {
  const n = Math.round(Number(value || 0));
  if (currency === 'USD') {
    // USD: comma as thousands separator, 2 decimals (e.g. US$ 1,500.00)
    const num = Number(value || 0);
    const fixed = num.toFixed(2); // "1500.00"
    const [intPart, decPart] = fixed.split('.');
    const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `US$ ${withCommas}.${decPart}`;
  }
  // PYG / Guaraní: dot as thousands separator, no decimals (e.g. Gs. 80.000.000)
  const withDots = String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `Gs. ${withDots}`;
};