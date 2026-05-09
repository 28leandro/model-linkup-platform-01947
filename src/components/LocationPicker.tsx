import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';

type LocationErrorCode = 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'NOT_SUPPORTED';

class LocationError extends Error {
  code: LocationErrorCode;

  constructor(code: LocationErrorCode, message?: string) {
    super(message || code);
    this.code = code;
  }
}

interface LocationPickerProps {
  onLocationSelect: (location: { address: string; latitude: number; longitude: number }) => void;
  initialAddress?: string;
}

interface NominatimSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  place_id: number;
}

const LocationPicker = ({ onLocationSelect, initialAddress = '' }: LocationPickerProps) => {
  const [address, setAddress] = useState(initialAddress);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<NominatimSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState<number>(-1);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<number | null>(null);
  const suppressNextSearchRef = useRef(false);
  const { t } = useLanguage();

  // Typeahead: query Nominatim with debounce when user types
  useEffect(() => {
    if (suppressNextSearchRef.current) {
      suppressNextSearchRef.current = false;
      return;
    }
    const query = address.trim();
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (query.length < 3) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }
    debounceRef.current = window.setTimeout(() => {
      fetchSuggestions(query);
    }, 350);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [address]);

  const fetchSuggestions = async (query: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query
      )}&format=json&addressdetails=1&limit=6&countrycodes=py,br,ar&accept-language=pt`;
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error('search failed');
      const data: NominatimSuggestion[] = await response.json();
      setSuggestions(data);
      setShowSuggestions(true);
      setHighlightIdx(-1);
    } catch (err) {
      if ((err as any)?.name !== 'AbortError') {
        setSuggestions([]);
      }
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = (s: NominatimSuggestion) => {
    suppressNextSearchRef.current = true;
    setAddress(s.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
    onLocationSelect({
      address: s.display_name,
      latitude: parseFloat(s.lat),
      longitude: parseFloat(s.lon),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && highlightIdx >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[highlightIdx]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const resolveAddress = async (latitude: number, longitude: number) => {
    const controller = new AbortController();
    const fetchTimeout = window.setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=pt`,
        { signal: controller.signal }
      );

      if (!response.ok) throw new Error('Geocoding failed');

      const data = await response.json();
      return data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } finally {
      window.clearTimeout(fetchTimeout);
    }
  };

  const getBrowserPosition = (options: PositionOptions) =>
    new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });

  const getBrowserWatchPosition = (options: PositionOptions) =>
    new Promise<GeolocationPosition>((resolve, reject) => {
      let watchId: number | null = null;
      const timeoutId = window.setTimeout(() => {
        if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        reject(new LocationError('TIMEOUT'));
      }, options.timeout || 20000);

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          window.clearTimeout(timeoutId);
          if (watchId !== null) navigator.geolocation.clearWatch(watchId);
          resolve(position);
        },
        (error) => {
          window.clearTimeout(timeoutId);
          if (watchId !== null) navigator.geolocation.clearWatch(watchId);
          reject(error);
        },
        options
      );
    });

  const getCurrentCoordinates = async () => {
    if (Capacitor.isNativePlatform()) {
      const permissions = await Geolocation.checkPermissions().catch(() => null);
      let permissionStatus = permissions;

      if (!permissionStatus || ['prompt', 'prompt-with-rationale'].includes(permissionStatus.location)) {
        permissionStatus = await Geolocation.requestPermissions({ permissions: ['location', 'coarseLocation'] });
      }

      if (permissionStatus.location === 'denied') {
        throw new LocationError('PERMISSION_DENIED');
      }

      try {
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000,
        });
        return position.coords;
      } catch (error) {
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: false,
          timeout: 20000,
          maximumAge: 120000,
        });
        return position.coords;
      }
    }

    if (!navigator.geolocation || !window.isSecureContext) {
      throw new LocationError('NOT_SUPPORTED');
    }

    try {
      const position = await getBrowserPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
      return position.coords;
    } catch (error) {
      const geoError = error as GeolocationPositionError;
      if (geoError.code === geoError.PERMISSION_DENIED) throw new LocationError('PERMISSION_DENIED');

      try {
        const position = await getBrowserPosition({
          enableHighAccuracy: false,
          timeout: 18000,
          maximumAge: 120000,
        });
        return position.coords;
      } catch {
        const position = await getBrowserWatchPosition({
          enableHighAccuracy: false,
          timeout: 22000,
          maximumAge: 300000,
        });
        return position.coords;
      }
    }
  };

  const handleGetCurrentLocation = async () => {
    if (
      !Capacitor.isNativePlatform() &&
      typeof window !== 'undefined' &&
      window.location.protocol !== 'https:' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      const msg = t('location.httpsRequired');
      setLocationError(msg);
      toast({ title: t('location.error'), description: msg, variant: 'destructive' });
      return;
    }

    if (!Capacitor.isNativePlatform() && (!navigator.geolocation || !window.isSecureContext)) {
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

    try {
      const { latitude, longitude } = await getCurrentCoordinates();
      const formattedAddress = await resolveAddress(latitude, longitude).catch(
        () => `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
      );

      setAddress(formattedAddress);
      onLocationSelect({ address: formattedAddress, latitude, longitude });

      toast({
        title: t('location.obtained'),
        description: t('location.obtainedDesc'),
      });
    } catch (error) {
      const locationErrorCode = error instanceof LocationError ? error.code : undefined;
      const errorMessage = t('location.enableOrTypeManually');
      if (locationErrorCode === 'PERMISSION_DENIED') {
        setPermissionDenied(true);
      }

      setLocationError(errorMessage);
      toast({
        title: t('location.error'),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="location">{t('postAd.location')}</Label>
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Input
            id="location"
            type="text"
            value={address}
            onChange={(e) => {
              setAddress(e.target.value);
              onLocationSelect({ address: e.target.value, latitude: 0, longitude: 0 });
            }}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            onBlur={() => {
              // delay so click on suggestion still fires
              window.setTimeout(() => setShowSuggestions(false), 150);
            }}
            onKeyDown={handleKeyDown}
            placeholder={isGettingLocation ? t('location.gettingLocation') : t('postAd.locationPlaceholder')}
            required
            disabled={isGettingLocation}
            autoComplete="off"
            inputMode="search"
            enterKeyHint="search"
            className="h-11 sm:h-10 pr-9"
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
            aria-controls="location-suggestions"
          />
          {(isSearching || isGettingLocation) && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
          )}
          {showSuggestions && suggestions.length > 0 && (
            <ul
              id="location-suggestions"
              role="listbox"
              className="absolute z-50 mt-1 w-full max-h-72 overflow-auto rounded-md border bg-popover text-popover-foreground shadow-lg"
            >
              {suggestions.map((s, idx) => (
                <li
                  key={s.place_id}
                  role="option"
                  aria-selected={idx === highlightIdx}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectSuggestion(s);
                  }}
                  className={`cursor-pointer px-3 py-2 text-sm ${
                    idx === highlightIdx ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  {s.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>
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
