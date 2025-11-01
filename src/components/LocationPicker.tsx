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

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocalização não suportada",
        description: "Seu navegador não suporta geolocalização",
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding usando Nominatim (OpenStreetMap)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
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
          toast({
            title: "Erro ao obter endereço",
            description: "Não foi possível obter o endereço da localização",
            variant: "destructive",
          });
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setIsGettingLocation(false);
        toast({
          title: "Erro ao obter localização",
          description: "Não foi possível acessar sua localização. Verifique as permissões do navegador.",
          variant: "destructive",
        });
      }
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
