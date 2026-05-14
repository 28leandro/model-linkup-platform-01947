/** Approximate coordinates (lat, lon) for major Paraguayan cities. */
export const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  "Asunción": { lat: -25.2637, lon: -57.5759 },
  "Ciudad del Este": { lat: -25.5097, lon: -54.6111 },
  "Encarnación": { lat: -27.3309, lon: -55.8663 },
  "San Lorenzo": { lat: -25.3407, lon: -57.5089 },
  "Luque": { lat: -25.2698, lon: -57.4872 },
  "Capiatá": { lat: -25.3551, lon: -57.4456 },
  "Lambaré": { lat: -25.3416, lon: -57.6131 },
  "Fernando de la Mora": { lat: -25.3206, lon: -57.5394 },
  "Limpio": { lat: -25.1683, lon: -57.4936 },
  "Ñemby": { lat: -25.3956, lon: -57.5378 },
  "Mariano Roque Alonso": { lat: -25.2056, lon: -57.5328 },
  "Itauguá": { lat: -25.3925, lon: -57.3556 },
  "Villa Elisa": { lat: -25.3636, lon: -57.5947 },
  "San Antonio": { lat: -25.4017, lon: -57.6056 },
  "Pedro Juan Caballero": { lat: -22.5453, lon: -55.7339 },
  "Coronel Oviedo": { lat: -25.4467, lon: -56.4406 },
  "Villarrica": { lat: -25.7806, lon: -56.4461 },
  "Concepción": { lat: -23.4064, lon: -57.4344 },
  "Caaguazú": { lat: -25.4658, lon: -56.0172 },
  "Caacupé": { lat: -25.3858, lon: -57.1408 },
  "Paraguarí": { lat: -25.6217, lon: -57.1456 },
  "Pilar": { lat: -26.8753, lon: -58.2839 },
  "Hernandarias": { lat: -25.3961, lon: -54.6378 },
  "Presidente Franco": { lat: -25.5594, lon: -54.6117 },
  "Minga Guazú": { lat: -25.4806, lon: -54.8253 },
  "Salto del Guairá": { lat: -24.0533, lon: -54.3158 },
  "San Juan Bautista": { lat: -26.6714, lon: -57.1442 },
  "San Pedro": { lat: -24.0789, lon: -57.0856 },
  "Filadelfia": { lat: -22.3478, lon: -60.0319 },
  "Loma Plata": { lat: -22.3833, lon: -59.85 },
};

export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}