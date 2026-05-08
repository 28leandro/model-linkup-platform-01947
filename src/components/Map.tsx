import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Listing } from '@/store/listingsStore';

// Default Asunción, Paraguay
const DEFAULT_CENTER: [number, number] = [-25.2637, -57.5759];

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

const FitBounds = ({ points }: { points: [number, number][] }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 13);
    } else {
      map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
    }
  }, [points, map]);
  return null;
};

const Map = ({ listings, onMarkerClick, center, zoom = 6 }: MapProps) => {
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
    if (center || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      () => {
        // We don't auto-pan; FitBounds handles markers. User location is best-effort.
      },
      () => {
        // Silent fallback to default Asunción
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }, [center]);

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={initialCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        {listings.map((listing) => {
          if (!listing.latitude || !listing.longitude) return null;
          const symbol = (listing as any).currency === 'USD' ? 'US$' : 'Gs.';
          return (
            <Marker
              key={listing.id}
              position={[listing.latitude, listing.longitude]}
              icon={makeIcon(colorFor(listing.type))}
              eventHandlers={{
                click: () => onMarkerClick?.(listing),
              }}
            >
              <Popup>
                <div style={{ padding: 4 }}>
                  <strong>{listing.title}</strong>
                  <div style={{ fontSize: 12, color: '#666' }}>{listing.location || ''}</div>
                  {listing.price ? (
                    <div style={{ fontWeight: 'bold', color: '#10b981', marginTop: 4 }}>
                      {symbol} {new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(listing.price)}
                    </div>
                  ) : null}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      <div className="absolute top-4 left-4 z-[1000] bg-white p-3 rounded-lg shadow-md">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ background: '#3b82f6' }} />
            <span>Veículos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ background: '#10b981' }} />
            <span>Imóveis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ background: '#f59e0b' }} />
            <span>Serviços</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
