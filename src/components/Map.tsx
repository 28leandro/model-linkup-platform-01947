import { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Listing } from '@/store/listingsStore';
import { getPublicCity } from '@/lib/utils';

// Default Paraguay
const DEFAULT_CENTER: [number, number] = [-23.4425, -58.4438];

interface MapProps {
  listings: Listing[];
  onMarkerClick?: (listing: Listing) => void;
  center?: [number, number];
  zoom?: number;
}

const colorFor = (type?: string) => {
  if (type === 'vehicles') return '#3b82f6';
  if (type === 'real-estate') return '#10b981';
  return '#f59e0b';
};

const makeIcon = (color: string) =>
  L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="width:24px;height:24px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

const createPopupContent = (listing: Listing) => {
  const symbol = (listing as any).currency === 'USD' ? 'US$' : 'Gs.';
  const content = document.createElement('div');
  content.style.padding = '4px';

  const title = document.createElement('strong');
  title.textContent = listing.title;
  content.appendChild(title);

  const location = document.createElement('div');
  location.style.fontSize = '12px';
  location.style.color = 'hsl(var(--muted-foreground))';
  // Never expose exact address in map popups — city/department only.
  const publicCity = getPublicCity(listing as any);
  location.textContent = publicCity || '';
  content.appendChild(location);

  if (listing.price) {
    const price = document.createElement('div');
    price.style.fontWeight = 'bold';
    price.style.color = 'hsl(var(--primary))';
    price.style.marginTop = '4px';
    price.textContent = `${symbol} ${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(listing.price)}`;
    content.appendChild(price);
  }

  return content;
};

const Map = ({ listings, onMarkerClick, center, zoom = 6 }: MapProps) => {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const points = useMemo(
    () =>
      listings
        .filter((l) => l.latitude && l.longitude)
        .map((l) => [l.latitude as number, l.longitude as number] as [number, number]),
    [listings]
  );

  // Geolocation: try user, fallback to default
  const initialCenter: [number, number] = center ?? DEFAULT_CENTER;

  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) return;

    mapRef.current = L.map(mapElementRef.current, {
      center: initialCenter,
      zoom,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (center || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      () => {
        // We don't auto-pan; FitBounds handles markers. User location is best-effort.
      },
      () => {
        // Silent fallback to default Asunción
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
    );
  }, [center]);

  useEffect(() => {
    if (!mapRef.current) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = listings.flatMap((listing) => {
      if (!listing.latitude || !listing.longitude || !mapRef.current) return [];

      const marker = L.marker([listing.latitude, listing.longitude], {
        icon: makeIcon(colorFor(listing.type)),
      })
        .bindPopup(createPopupContent(listing))
        .on('click', () => onMarkerClick?.(listing))
        .addTo(mapRef.current);

      return [marker];
    });

    if (points.length === 1) {
      mapRef.current.setView(points[0], 13);
    } else if (points.length > 1) {
      mapRef.current.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
    } else {
      mapRef.current.setView(initialCenter, zoom);
    }
  }, [initialCenter, listings, onMarkerClick, points, zoom]);

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
      <div ref={mapElementRef} className="h-full w-full" />
    </div>
  );
};

export default Map;
