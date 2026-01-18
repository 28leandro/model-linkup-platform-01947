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
    // Check if geolocation API is available
    if (!navigator.geolocation) {
      toast({
        title: t('location.notSupported'),
        description: t('location.notSupportedDesc'),
        variant: "destructive",
      });
      return;
    }

    // Check if running on HTTPS or localhost (required for geolocation)
    const isSecure = window.isSecureContext || 
                     window.location.protocol === 'https:' || 
                     window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1';
    
    if (!isSecure) {
      toast({
        title: t('location.notSupported'),
        description: t('location.notSupportedDesc'),
        variant: "destructive",
      });
      return;
    }

    setIsGettingLocation(true);
    
    // Configuration for different device types
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const options: PositionOptions = {
      enableHighAccuracy: isMobile, // High accuracy on mobile for GPS
      timeout: 15000, // Longer timeout for slower connections
      maximumAge: 60000 // Cache location for 1 minute
    };

    // Timeout fallback in case geolocation hangs
    const timeoutId = setTimeout(() => {
      setIsGettingLocation(false);
      toast({
        title: t('location.error'),
        description: t('location.errorDesc'),
        variant: "destructive",
      });
    }, 20000);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        clearTimeout(timeoutId);
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding using Nominatim (OpenStreetMap)
          const controller = new AbortController();
          const fetchTimeout = setTimeout(() => controller.abort(), 8000);
          
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=pt`,
            {
              headers: {
                'User-Agent': 'LinkUpPlatform/1.0'
              },
              signal: controller.signal
            }
          );
          clearTimeout(fetchTimeout);
          
          if (!response.ok) throw new Error('Geocoding failed');
          
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
          // Fallback to coordinates if geocoding fails
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
        clearTimeout(timeoutId);
        setIsGettingLocation(false);
        
        // Provide specific error messages based on error code
        let errorMessage = t('location.errorDesc');
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = t('location.permissionDenied');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = t('location.unavailable');
        } else if (error.code === error.TIMEOUT) {
          errorMessage = t('location.timeout');
        }
        
        toast({
          title: t('location.error'),
          description: errorMessage,
          variant: "destructive",
        });
      },
      options
    );
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
          <MapPin className="w-4 h-4 mr-2" />
          <span className="truncate">
            {isGettingLocation ? t('postAd.gettingLocation') : t('postAd.getCurrentLocation')}
          </span>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {t('postAd.locationHelper')}
      </p>
    </div>
  );
};

export default LocationPicker;
