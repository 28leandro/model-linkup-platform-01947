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
  // Never expose exact address. Drop any segment that looks like a street
  // (contains digits or address keywords). From the remaining segments,
  // return the city (second-to-last) if present, otherwise the department
  // (last segment). Never return a street-like segment.
  const looksLikeStreet = (s: string) =>
    /\d/.test(s) ||
    /\b(av|avda|avenida|calle|rua|r\.|ruta|km|n[ºo°]|esq|esquina|barrio|b[ºo°]|distrito|zona|manzana|mza|lote|piso|depto|dpto|casa|edificio|edif)\b/i.test(s);
  // Country names we treat as non-city (department fallback last).
  const isCountry = (s: string) => /^(paraguay|py|brasil|brazil|argentina|uruguay|bolivia|chile)$/i.test(s.trim());
  const clean = parts.filter((p) => !looksLikeStreet(p) && !isCountry(p));
  if (clean.length === 0) return "";
  if (clean.length === 1) return clean[0];
  // city is typically second-to-last, department is last
  return clean[clean.length - 2] || clean[clean.length - 1];
}

/**
 * Resolves the public city for a listing. Prefers an explicit `city`
 * attribute set by the seller; otherwise falls back to a heuristic on the
 * full location string.
 */
export function getPublicCity(listing: any): string {
  const explicit = listing?.attributes?.city;
  if (typeof explicit === "string" && explicit.trim()) return explicit.trim();
  const fromLoc = getCityFromLocation(listing?.location);
  if (fromLoc) return fromLoc;
  // Last resort: department attribute if seller provided it
  const dept = listing?.attributes?.department ?? listing?.attributes?.state;
  if (typeof dept === "string" && dept.trim()) return dept.trim();
  return "";
}
