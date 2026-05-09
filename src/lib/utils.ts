import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extracts only the city portion from a full location string.
 * Hides street/address details for visitor privacy.
 * Examples:
 *  "Av. Mcal López 1234, Asunción, Central" -> "Asunción"
 *  "Asunción, Central" -> "Asunción"
 *  "Asunción" -> "Asunción"
 */
export function getCityFromLocation(location?: string | null): string {
  if (!location) return "";
  const parts = location.split(",").map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  // Heuristic: if first part looks like a street (contains digits or common
  // address keywords), skip it and use the next segment as the city.
  const first = parts[0];
  const looksLikeStreet =
    /\d/.test(first) ||
    /\b(av|avda|avenida|calle|rua|r\.|ruta|km|n[ºo°]|esq|esquina)\b/i.test(first);
  return looksLikeStreet && parts[1] ? parts[1] : first;
}
