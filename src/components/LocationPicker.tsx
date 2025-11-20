import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface LocationPickerProps {
  onLocationSelect: (location: { address: string; latitude: number; longitude: number }) => void;
  initialAddress?: string;
}

const LocationPicker = ({ onLocationSelect, initialAddress = '' }: LocationPickerProps) => {
  const [address, setAddress] = useState(initialAddress);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Auto-detect location on mount if no initial address
    if (!initialAddress && navigator.geolocation) {
      handleGetCurrentLocation();
    }
  }, []); // Only run once on mount

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: t('location.notSupported'),
        description: t('location.notSupportedDesc'),
        variant: "destructive",
      });
      return;
    }

    // Check if running on HTTPS or localhost (required for geolocation on most browsers)
    const isSecureContext = window.isSecureContext || window.location.hostname === 'localhost';
    if (!isSecureContext) {
      toast({
        title: t('location.notSupported'),
        description: t('location.notSupportedDesc'),
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
            title: t('location.obtained'),
            description: t('location.obtainedDesc'),
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
            title: t('location.obtained'),
            description: t('location.obtainedDesc'),
          });
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setIsGettingLocation(false);
        
        toast({
          title: t('location.error'),
          description: t('location.errorDesc'),
          variant: "destructive",
        });
      },
      options
    );
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="location">{t('postAd.location')}</Label>
      <div className="flex gap-2">
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
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleGetCurrentLocation}
          disabled={isGettingLocation}
          className="flex-shrink-0"
        >
          <MapPin className="w-4 h-4 mr-2" />
          {isGettingLocation ? t('postAd.gettingLocation') : t('postAd.getCurrentLocation')}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {t('postAd.locationHelper')}
      </p>
    </div>
  );
};

export default LocationPicker;
