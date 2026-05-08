import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface LocationPickerProps {
  onLocationSelect: (location: { address: string; latitude: number; longitude: number }) => void;
  initialAddress?: string;
}

const LocationPicker = ({ onLocationSelect, initialAddress = '' }: LocationPickerProps) => {
  const [address, setAddress] = useState(initialAddress);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { t } = useLanguage();

  // Try IP-based geolocation as a silent fallback on mount (no permission needed)
  useEffect(() => {
    if (!initialAddress) {
      getLocationByIP();
    }
  }, []);

  const getLocationByIP = async () => {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('https://ipapi.co/json/', {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      
      if (!response.ok) throw new Error('IP geolocation failed');
      
      const data = await response.json();
      if (data.latitude && data.longitude) {
        const cityAddress = [data.city, data.region, data.country_name]
          .filter(Boolean)
          .join(', ');
        
        if (cityAddress && !address) {
          setAddress(cityAddress);
          onLocationSelect({
            address: cityAddress,
            latitude: data.latitude,
            longitude: data.longitude,
          });
        }
      }
    } catch {
      // Silent fail - IP geolocation is just a convenience fallback
      console.log('IP geolocation unavailable, user can set location manually');
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: t('location.notSupported'),
        description: t('location.notSupportedDesc'),
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);
    setPermissionDenied(false);
    setLocationError(null);

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Always start with high accuracy (GPS) enabled, then fallback to low accuracy
    const tryGeolocation = (highAccuracy: boolean) => {
      const options: PositionOptions = {
        enableHighAccuracy: highAccuracy,
        timeout: highAccuracy ? 10000 : 15000,
        maximumAge: 60000,
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const controller = new AbortController();
            const fetchTimeout = setTimeout(() => controller.abort(), 8000);
            
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=pt`,
              {
                headers: { 'User-Agent': 'LinkUpPlatform/1.0' },
                signal: controller.signal,
              }
            );
            clearTimeout(fetchTimeout);
            
            if (!response.ok) throw new Error('Geocoding failed');
            
            const data = await response.json();
            const formattedAddress = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            
            setAddress(formattedAddress);
            onLocationSelect({ address: formattedAddress, latitude, longitude });
            
            toast({
              title: t('location.obtained'),
              description: t('location.obtainedDesc'),
            });
          } catch {
            const fallbackAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            setAddress(fallbackAddress);
            onLocationSelect({ address: fallbackAddress, latitude, longitude });
            
            toast({
              title: t('location.obtained'),
              description: t('location.obtainedDesc'),
            });
          } finally {
            setIsGettingLocation(false);
          }
        },
        (error) => {
          // If high accuracy failed, retry with low accuracy
          if (highAccuracy && error.code !== error.PERMISSION_DENIED) {
            console.log('High accuracy failed, trying low accuracy...', error.message);
            tryGeolocation(false);
            return;
          }
          
          setIsGettingLocation(false);
          
          let errorMessage = t('location.errorDesc');
          if (error.code === error.PERMISSION_DENIED) {
            errorMessage = t('location.permissionDenied');
            setPermissionDenied(true);
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMessage = t('location.unavailable');
          } else if (error.code === error.TIMEOUT) {
            errorMessage = t('location.timeout');
          }

          setLocationError(errorMessage);
          
          toast({
            title: t('location.error'),
            description: errorMessage,
            variant: "destructive",
          });
        },
        options
      );
    };

    // Always enable high accuracy on first attempt for best precision
    tryGeolocation(true);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="location">{t('postAd.location')}</Label>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          id="location"
          type="text"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            onLocationSelect({ address: e.target.value, latitude: 0, longitude: 0 });
          }}
          placeholder={t('postAd.locationPlaceholder')}
          required
          className="h-11 sm:h-10"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleGetCurrentLocation}
          disabled={isGettingLocation}
          className="flex-shrink-0 h-11 sm:h-10 w-full sm:w-auto"
        >
          {isGettingLocation ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <MapPin className="w-4 h-4 mr-2" />
          )}
          <span className="truncate">
            {isGettingLocation ? t('postAd.gettingLocation') : t('postAd.getCurrentLocation')}
          </span>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {t('postAd.locationHelper')}
      </p>

      {permissionDenied && (
        <Alert variant="destructive" className="mt-2">
          <AlertTriangle className="w-4 h-4" />
          <AlertTitle>{t('location.permissionDenied')}</AlertTitle>
          <AlertDescription className="text-xs">
            {t('location.permissionDeniedHelp') || 'Habilite o acesso à localização nas configurações do navegador (ícone de cadeado na barra de endereço) e tente novamente. Você também pode digitar o endereço manualmente.'}
          </AlertDescription>
        </Alert>
      )}

      {locationError && !permissionDenied && (
        <Alert variant="destructive" className="mt-2">
          <AlertTriangle className="w-4 h-4" />
          <AlertDescription className="text-xs">{locationError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default LocationPicker;
