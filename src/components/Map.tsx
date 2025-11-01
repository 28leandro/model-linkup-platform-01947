import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Listing } from '@/store/listingsStore';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface MapProps {
  listings: Listing[];
  onMarkerClick?: (listing: Listing) => void;
  center?: [number, number];
  zoom?: number;
}

const Map = ({ listings, onMarkerClick, center = [-46.6333, -23.5505], zoom = 4 }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [tokenSubmitted, setTokenSubmitted] = useState(false);
  const markers = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current || !tokenSubmitted || !mapboxToken) return;

    try {
      // Initialize map
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: center,
        zoom: zoom,
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );

      // Clear existing markers
      markers.current.forEach(marker => marker.remove());
      markers.current = [];

      // Add markers for each listing
      listings.forEach((listing) => {
        if (listing.latitude && listing.longitude && map.current) {
          // Create custom marker element
          const el = document.createElement('div');
          el.className = 'custom-marker';
          el.style.width = '30px';
          el.style.height = '30px';
          el.style.borderRadius = '50%';
          el.style.cursor = 'pointer';
          
          // Different colors for different types
          if (listing.type === 'vehicles') {
            el.style.backgroundColor = '#3b82f6';
          } else if (listing.type === 'real-estate') {
            el.style.backgroundColor = '#10b981';
          } else {
            el.style.backgroundColor = '#f59e0b';
          }
          
          el.style.border = '2px solid white';
          el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

          const marker = new mapboxgl.Marker(el)
            .setLngLat([listing.longitude, listing.latitude])
            .setPopup(
              new mapboxgl.Popup({ offset: 25 })
                .setHTML(`
                  <div style="padding: 8px;">
                    <h3 style="font-weight: bold; margin-bottom: 4px;">${listing.title}</h3>
                    <p style="font-size: 14px; color: #666;">${listing.location}</p>
                    ${listing.price ? `<p style="font-weight: bold; color: #10b981; margin-top: 4px;">R$ ${listing.price.toLocaleString('pt-BR')}</p>` : ''}
                  </div>
                `)
            )
            .addTo(map.current);

          // Add click event
          el.addEventListener('click', () => {
            if (onMarkerClick) {
              onMarkerClick(listing);
            }
          });

          markers.current.push(marker);
        }
      });

      // Cleanup
      return () => {
        markers.current.forEach(marker => marker.remove());
        map.current?.remove();
      };
    } catch (error) {
      toast({
        title: "Erro ao carregar mapa",
        description: "Verifique se o token do Mapbox está correto",
        variant: "destructive",
      });
    }
  }, [listings, onMarkerClick, center, zoom, tokenSubmitted, mapboxToken]);

  if (!tokenSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Configurar Mapbox</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Para visualizar os anúncios no mapa, você precisa de um token público do Mapbox.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="mapbox-token">Token Público do Mapbox</Label>
              <Input
                id="mapbox-token"
                type="text"
                placeholder="pk.eyJ1..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Obtenha seu token em{' '}
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
            <Button 
              onClick={() => {
                if (mapboxToken.trim()) {
                  setTokenSubmitted(true);
                } else {
                  toast({
                    title: "Token necessário",
                    description: "Por favor, insira o token do Mapbox",
                    variant: "destructive",
                  });
                }
              }}
              className="w-full"
            >
              Carregar Mapa
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#3b82f6]"></div>
            <span>Veículos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#10b981]"></div>
            <span>Imóveis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-[#f59e0b]"></div>
            <span>Serviços</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;
