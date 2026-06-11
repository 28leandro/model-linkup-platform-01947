import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';
import { useState } from 'react';

// Default Paraguay
const DEFAULT_CENTER: [number, number] = [-23.4425, -58.4438];

const icon = L.divIcon({
  className: 'custom-leaflet-marker',
  html: `<div style="width:32px;height:32px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 4px 8px rgba(0,0,0,0.3);"></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const userIcon = L.divIcon({
  className: 'custom-leaflet-marker',
  html: `<div style="width:22px;height:22px;border-radius:50%;background:#2563eb;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const haversineKm = (a: [number, number], b: [number, number]) => {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

interface ListingMapProps {
  latitude?: number | null;
  longitude?: number | null;
  title: string;
  location?: string;
}

const createPopupContent = (title: string, location?: string) => {
  const content = document.createElement('div');
  content.style.padding = '4px';
  content.style.maxWidth = '200px';

  const titleElement = document.createElement('strong');
  titleElement.textContent = title;
  content.appendChild(titleElement);

  if (location) {
    const locationElement = document.createElement('div');
    locationElement.style.fontSize = '12px';
    locationElement.style.color = 'hsl(var(--muted-foreground))';
    locationElement.textContent = location;
    content.appendChild(locationElement);
  }

  return content;
};

const ListingMap = ({ latitude, longitude, title, location }: ListingMapProps) => {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const lineRef = useRef<L.Polyline | null>(null);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const hasCoords = typeof latitude === 'number' && typeof longitude === 'number';
  const position: [number, number] = hasCoords
    ? [latitude as number, longitude as number]
    : DEFAULT_CENTER;

  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) return;

    mapRef.current = L.map(mapElementRef.current, {
      center: position,
      zoom: hasCoords ? 14 : 11,
      scrollWheelZoom: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    mapRef.current.setView(position, hasCoords ? 14 : 11);

    if (!markerRef.current) {
      markerRef.current = L.marker(position, { icon }).addTo(mapRef.current);
    } else {
      markerRef.current.setLatLng(position);
    }

    markerRef.current.bindPopup(createPopupContent(title, location));
  }, [hasCoords, location, position, title]);

  // Request user geolocation once
  useEffect(() => {
    if (!hasCoords) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => {},
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
    );
  }, [hasCoords]);

  // Draw user marker + dotted distance line
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !hasCoords) return;
    if (userMarkerRef.current) { userMarkerRef.current.remove(); userMarkerRef.current = null; }
    if (lineRef.current) { lineRef.current.remove(); lineRef.current = null; }
    if (!userPos) return;
    const raf = requestAnimationFrame(() => {
      try {
        map.invalidateSize();
        userMarkerRef.current = L.marker(userPos, { icon: userIcon })
          .bindPopup('Tu ubicación')
          .addTo(map);
        lineRef.current = L.polyline([userPos, position], {
          color: '#2563eb',
          weight: 3,
          dashArray: '6 6',
        }).addTo(map);
        map.fitBounds(L.latLngBounds([userPos, position]), { padding: [40, 40] });
      } catch {
        /* leaflet may not be ready; ignore */
      }
    });
    return () => cancelAnimationFrame(raf);
  }, [userPos, hasCoords, position]);

  const distanceKm = hasCoords && userPos ? haversineKm(userPos, position) : null;

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <MapPin className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Ubicación</h3>
        {distanceKm !== null && (
          <span className="ml-auto inline-flex items-center gap-1.5 bg-primary/10 border border-primary/30 rounded-full px-2.5 py-1 text-xs font-semibold text-primary">
            <Navigation className="w-3.5 h-3.5" />
            {distanceKm < 1
              ? `${Math.round(distanceKm * 1000)} m de ti`
              : `${distanceKm.toFixed(1)} km de ti`}
          </span>
        )}
      </div>
      {!hasCoords && (
        <p className="text-xs text-muted-foreground mb-2">
          Ubicación aproximada (Paraguay)
        </p>
      )}
      <div ref={mapElementRef} className="relative w-full h-[300px] sm:h-[400px] rounded-lg overflow-hidden shadow-lg border" />
    </div>
  );
};

export default ListingMap;
