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

import { convertPrice, type DisplayCurrency, USD_TO_PYG } from "@/contexts/CurrencyContext";

/**
 * Format a stored price for display, converting between currencies if needed.
 * `sourceCurrency` is the currency the price was stored as.
 * `displayCurrency` is the currency the user wants to view.
 */
export const formatDisplayPrice = (
  value: number | null | undefined,
  sourceCurrency: string | undefined,
  displayCurrency: DisplayCurrency
) => {
  const converted = convertPrice(value, sourceCurrency, displayCurrency, USD_TO_PYG);
  return formatPrice(converted, displayCurrency);
};