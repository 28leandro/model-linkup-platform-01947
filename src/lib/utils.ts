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

/**
 * Resolves the public city for a listing. Prefers an explicit `city`
 * attribute set by the seller; otherwise falls back to a heuristic on the
 * full location string.
 */
export function getPublicCity(listing: any): string {
  const explicit = listing?.attributes?.city;
  if (typeof explicit === "string" && explicit.trim()) return explicit.trim();
  return getCityFromLocation(listing?.location);
}
