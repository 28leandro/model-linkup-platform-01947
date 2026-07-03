import { CITY_COORDS, distanceKm } from "@/lib/cityCoords";
import { getPublicCity } from "@/lib/utils";

export interface LocationFilterLike {
  city?: string;
  lat?: number;
  lon?: number;
  radiusKm: number;
}

const normalizeCity = (value?: string | null) =>
  (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const KNOWN_CITY_ENTRIES = Object.entries(CITY_COORDS).map(([name, coords]) => ({
  name,
  normalized: normalizeCity(name),
  coords,
}));

const isValidCoordinate = (lat?: number, lon?: number) =>
  typeof lat === "number" &&
  typeof lon === "number" &&
  Number.isFinite(lat) &&
  Number.isFinite(lon) &&
  lat >= -28.5 &&
  lat <= -19 &&
  lon >= -63.8 &&
  lon <= -53.5;

const resolveKnownCity = (value?: string | null) => {
  const normalized = normalizeCity(value);
  if (!normalized) return undefined;
  return KNOWN_CITY_ENTRIES.find((entry) => entry.normalized === normalized)?.name;
};

const resolveKnownCityFromText = (value?: string | null) => {
  const normalized = normalizeCity(value);
  if (!normalized) return undefined;
  return KNOWN_CITY_ENTRIES.find((entry) =>
    normalized === entry.normalized || normalized.includes(entry.normalized)
  )?.name;
};

const getListingKnownCity = (listing: any) =>
  resolveKnownCity(getPublicCity(listing)) || resolveKnownCityFromText(listing?.location);

export const listingMatchesCity = (listing: any, selectedCity?: string) => {
  const selectedKnownCity = resolveKnownCity(selectedCity) || resolveKnownCityFromText(selectedCity);
  const listingKnownCity = getListingKnownCity(listing);

  if (selectedKnownCity && listingKnownCity) return selectedKnownCity === listingKnownCity;

  const selected = normalizeCity(selectedCity);
  const listingCity = normalizeCity(getPublicCity(listing));
  return Boolean(selected && listingCity && selected === listingCity);
};

export const listingMatchesLocationFilter = (listing: any, filter: LocationFilterLike) => {
  if (!filter.city && !filter.radiusKm) return true;

  const selectedKnownCity = resolveKnownCity(filter.city) || resolveKnownCityFromText(filter.city);
  const selectedCoords = selectedKnownCity ? CITY_COORDS[selectedKnownCity] : undefined;
  const center = isValidCoordinate(filter.lat, filter.lon)
    ? { lat: filter.lat!, lon: filter.lon! }
    : selectedCoords;

  if (filter.radiusKm > 0 && center) {
    const listingKnownCity = getListingKnownCity(listing);

    if (listingKnownCity) {
      const cityCoords = CITY_COORDS[listingKnownCity];
      return distanceKm(center.lat, center.lon, cityCoords.lat, cityCoords.lon) <= filter.radiusKm;
    }

    const lat = Number(listing?.latitude);
    const lon = Number(listing?.longitude);
    return isValidCoordinate(lat, lon) && distanceKm(center.lat, center.lon, lat, lon) <= filter.radiusKm;
  }

  return listingMatchesCity(listing, filter.city);
};