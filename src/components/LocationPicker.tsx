import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface LocationPickerProps {
  onLocationSelect: (location: { address: string; latitude: number; longitude: number }) => void;
  initialAddress?: string;
}

const LocationPicker = ({ onLocationSelect, initialAddress = '' }: LocationPickerProps) => {
  const [address, setAddress] = useState(initialAddress);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    // Auto-detect location on mount if no initial address
    if (!initialAddress && navigator.geolocation) {
      handleGetCurrentLocation();
    }
  }, []); // Only run once on mount

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocalização não suportada",
        description: "Seu dispositivo não suporta geolocalização",
        variant: "destructive",
      });
      return;
    }

    // Check if running on HTTPS or localhost (required for geolocation on most browsers)
    const isSecureContext = window.isSecureContext || window.location.hostname === 'localhost';
    if (!isSecureContext) {
      toast({
        title: "Conexão insegura",
        description: "A geolocalização requer uma conexão HTTPS segura",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);
    
    // Use higher accuracy for mobile devices
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding usando Nominatim (OpenStreetMap)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
            {
              headers: {
                'User-Agent': 'LinkUpPlatform/1.0'
              }
            }
          );
          const data = await response.json();
          
          const formattedAddress = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setAddress(formattedAddress);
          onLocationSelect({
            address: formattedAddress,
            latitude,
            longitude,
          });
          
          toast({
            title: "Localização obtida",
            description: "Sua localização foi detectada com sucesso",
          });
        } catch (error) {
          // Even if reverse geocoding fails, use coordinates
          const fallbackAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setAddress(fallbackAddress);
          onLocationSelect({
            address: fallbackAddress,
            latitude,
            longitude,
          });
          
          toast({
            title: "Localização obtida",
            description: "Usando coordenadas como endereço",
          });
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setIsGettingLocation(false);
        let errorMessage = "Não foi possível acessar sua localização.";
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Você negou o acesso à localização. Permita nas configurações do navegador.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Localização indisponível no momento. Tente novamente.";
            break;
          case error.TIMEOUT:
            errorMessage = "Tempo esgotado ao buscar localização. Tente novamente.";
            break;
        }
        
        toast({
          title: "Erro ao obter localização",
          description: errorMessage,
          variant: "destructive",
        });
      },
      options
    );
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="location">Localização</Label>
      <div className="flex gap-2">
        <Input
          id="location"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Ex: São Paulo, SP"
          required
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleGetCurrentLocation}
          disabled={isGettingLocation}
          className="flex-shrink-0"
        >
          <MapPin className="w-4 h-4 mr-2" />
          {isGettingLocation ? 'Obtendo...' : 'Usar Localização Atual'}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Digite o endereço ou use sua localização atual
      </p>
    </div>
  );
};

export default LocationPicker;
