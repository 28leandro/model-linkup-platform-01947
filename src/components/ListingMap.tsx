import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { MapPin } from 'lucide-react';

interface ListingMapProps {
  latitude: number;
  longitude: number;
  title: string;
  location?: string;
}

const ListingMap = ({ latitude, longitude, title, location }: ListingMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>(() => {
    return localStorage.getItem('mapbox_token') || '';
  });
  const [tokenSubmitted, setTokenSubmitted] = useState(() => {
    return !!localStorage.getItem('mapbox_token');
  });

  useEffect(() => {
    if (!mapContainer.current || !tokenSubmitted || !mapboxToken) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [longitude, latitude],
        zoom: 14,
      });

      map.current.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );

      // Create marker element
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.width = '40px';
      el.style.height = '40px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = '#ef4444';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';

      // Create popup content
      const popupContent = document.createElement('div');
      popupContent.style.padding = '8px';
      popupContent.style.maxWidth = '200px';

      const titleEl = document.createElement('h3');
      titleEl.textContent = title;
      titleEl.style.fontWeight = 'bold';
      titleEl.style.marginBottom = '4px';
      titleEl.style.fontSize = '14px';
      popupContent.appendChild(titleEl);

      if (location) {
        const locationEl = document.createElement('p');
        locationEl.textContent = location;
        locationEl.style.fontSize = '12px';
        locationEl.style.color = '#666';
        popupContent.appendChild(locationEl);
      }

      new mapboxgl.Marker(el)
        .setLngLat([longitude, latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setDOMContent(popupContent)
        )
        .addTo(map.current);

      return () => {
        map.current?.remove();
      };
    } catch (error) {
      toast({
        title: "Error al cargar el mapa",
        description: "Verifique que el token de Mapbox sea correcto",
        variant: "destructive",
      });
    }
  }, [latitude, longitude, title, location, tokenSubmitted, mapboxToken]);

  const handleSubmitToken = () => {
    if (mapboxToken.trim()) {
      localStorage.setItem('mapbox_token', mapboxToken.trim());
      setTokenSubmitted(true);
    } else {
      toast({
        title: "Token requerido",
        description: "Por favor, ingrese el token de Mapbox",
        variant: "destructive",
      });
    }
  };

  if (!tokenSubmitted) {
    return (
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Ubicación en el Mapa</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Para ver la ubicación del anuncio, ingrese su token público de Mapbox.
            </p>
            <div className="space-y-2">
              <Label htmlFor="mapbox-token">Token Público de Mapbox</Label>
              <Input
                id="mapbox-token"
                type="text"
                placeholder="pk.eyJ1..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Obtenga su token en{' '}
                <a 
                  href="https://account.mapbox.com/access-tokens/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  mapbox.com
                </a>
              </p>
            </div>
            <Button onClick={handleSubmitToken} className="w-full">
              Ver Mapa
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Ubicación</h3>
      </div>
      <div className="relative w-full h-[300px] sm:h-[400px] rounded-lg overflow-hidden shadow-lg border">
        <div ref={mapContainer} className="absolute inset-0" />
      </div>
    </div>
  );
};

export default ListingMap;
