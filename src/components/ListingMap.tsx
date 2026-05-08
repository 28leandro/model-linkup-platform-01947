import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// Default Asunción, Paraguay
const DEFAULT_CENTER: [number, number] = [-25.2637, -57.5759];

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

const Recenter = ({ position }: { position: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(position, map.getZoom());
  }, [position, map]);
  return null;
};

const ListingMap = ({ latitude, longitude, title, location }: ListingMapProps) => {
  const hasCoords = typeof latitude === 'number' && typeof longitude === 'number';
  const position: [number, number] = hasCoords
    ? [latitude as number, longitude as number]
    : DEFAULT_CENTER;

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Ubicación</h3>
      </div>
      {!hasCoords && (
        <p className="text-xs text-muted-foreground mb-2">
          Ubicación aproximada (Asunción, Paraguay)
        </p>
      )}
      <div className="relative w-full h-[300px] sm:h-[400px] rounded-lg overflow-hidden shadow-lg border">
        <MapContainer
          center={position}
          zoom={hasCoords ? 14 : 11}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Recenter position={position} />
          <Marker position={position} icon={icon}>
            <Popup>
              <div style={{ padding: '4px', maxWidth: '200px' }}>
                <strong>{title}</strong>
                {location && <div style={{ fontSize: 12, color: '#666' }}>{location}</div>}
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default ListingMap;
