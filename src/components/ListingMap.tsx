import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// Default Paraguay
const DEFAULT_CENTER: [number, number] = [-23.4425, -58.4438];

const icon = L.divIcon({
  className: 'custom-leaflet-marker',
  html: `<div style="width:32px;height:32px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 4px 8px rgba(0,0,0,0.3);"></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

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

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Ubicación</h3>
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
