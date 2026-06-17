import { useState } from 'react';
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

export interface LocationDetails {
  address: string;
  latitude: number;
  longitude: number;
  street?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
}

interface LocationPickerProps {
  onLocationSelect: (location: LocationDetails) => void;
  initialAddress?: string;
}

const LocationPicker = ({ onLocationSelect, initialAddress = '' }: LocationPickerProps) => {
  const [address, setAddress] = useState(initialAddress);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { t } = useLanguage();

  const resolveAddress = async (latitude: number, longitude: number) => {
    const controller = new AbortController();
    const fetchTimeout = window.setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&accept-language=pt`,
        { signal: controller.signal }
      );

      if (!response.ok) throw new Error('Geocoding failed');

      const data = await response.json();
      const a = data.address || {};
      // Compose a clean structured address: Rua, Bairro, Cidade - CEP
      const street = [a.road || a.pedestrian || a.footway, a.house_number].filter(Boolean).join(', ');
      const neighborhood = a.suburb || a.neighbourhood || a.quarter || a.village;
      // Carefully separate city from neighborhood and state. Prefer fields that
      // explicitly represent a city/town/municipality and never fall back to
      // state-level fields here.
      const city =
        a.city || a.town || a.municipality || a.village || a.hamlet || a.county || '';
      const state = a.state || a.region || a.state_district || '';
      const postcode = a.postcode || '';
      const country = a.country || '';
      const parts = [street, neighborhood, city].filter(Boolean);
      let formatted = parts.join(' - ');
      if (postcode) formatted = formatted ? `${formatted}, CEP ${postcode}` : `CEP ${postcode}`;
      const finalFormatted =
        formatted || data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      return { formatted: finalFormatted, street, city, state, postcode, country };
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

    // Bug #3 — Android geolocation timeout (even with permission granted):
    //   On mobile networks, enableHighAccuracy=true + maximumAge=0 commonly
    //   times out while the GPS chip is still acquiring a fix. We:
    //     1. Try a SHORT high-accuracy attempt (8s) and allow a cached fix
    //        up to 60s old to satisfy the request instantly when possible.
    //     2. On any non-permission failure, fall back to low-accuracy
    //        (network/wifi positioning) which almost always succeeds.
    //     3. Last resort: watchPosition (some Android builds only emit a
    //        first fix via watchPosition, not getCurrentPosition).
    //   Every step is wrapped in try/catch with debug logging.
    try {
      const position = await getBrowserPosition({
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      });
      if (import.meta.env.DEV) console.debug('[geo] high-accuracy fix OK');
      return position.coords;
    } catch (error) {
      const geoError = error as GeolocationPositionError;
      if (geoError?.code === 1) throw new LocationError('PERMISSION_DENIED');
      if (import.meta.env.DEV) console.debug('[geo] high-accuracy failed, falling back:', geoError?.code);

      try {
        const position = await getBrowserPosition({
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 300000,
        });
        if (import.meta.env.DEV) console.debug('[geo] low-accuracy fix OK');
        return position.coords;
      } catch (err2) {
        const e2 = err2 as GeolocationPositionError;
        if (e2?.code === 1) throw new LocationError('PERMISSION_DENIED');
        if (import.meta.env.DEV) console.debug('[geo] low-accuracy failed, trying watchPosition:', e2?.code);
        const position = await getBrowserWatchPosition({
          enableHighAccuracy: false,
          timeout: 20000,
          maximumAge: 600000,
        });
        if (import.meta.env.DEV) console.debug('[geo] watchPosition fix OK');
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

    // Check Permissions API upfront (browsers that support it)
    if (
      !Capacitor.isNativePlatform() &&
      typeof navigator !== 'undefined' &&
      'permissions' in navigator
    ) {
      try {
        const status = await (navigator as Navigator).permissions.query({ name: 'geolocation' as PermissionName });
        if (status.state === 'denied') {
          setPermissionDenied(true);
          const msg = t('location.permissionDeniedHelp');
          setLocationError(msg);
          toast({ title: t('location.permissionDenied'), description: msg, variant: 'destructive' });
          return;
        }
      } catch {
        // Permissions API not available — proceed and let getCurrentPosition handle it
      }
    }

    setIsGettingLocation(true);
    setPermissionDenied(false);
    setLocationError(null);

    try {
      const { latitude, longitude } = await getCurrentCoordinates();
      const details = await resolveAddress(latitude, longitude).catch(() => null);

      const formattedAddress =
        details?.formatted || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

      setAddress(formattedAddress);
      onLocationSelect({
        address: formattedAddress,
        latitude,
        longitude,
        street: details?.street || undefined,
        city: details?.city || undefined,
        state: details?.state || undefined,
        postcode: details?.postcode || undefined,
        country: details?.country || undefined,
      });

      toast({
        title: t('location.obtained'),
        description: t('location.obtainedDesc'),
      });
    } catch (error) {
      let locationErrorCode: LocationErrorCode | undefined =
        error instanceof LocationError ? error.code : undefined;
      // Map raw GeolocationPositionError numeric codes
      if (!locationErrorCode && error && typeof error === 'object' && 'code' in error) {
        const code = (error as GeolocationPositionError).code;
        if (code === 1) locationErrorCode = 'PERMISSION_DENIED';
        else if (code === 2) locationErrorCode = 'POSITION_UNAVAILABLE';
        else if (code === 3) locationErrorCode = 'TIMEOUT';
      }
      let errorMessage = t('location.enableOrTypeManually');
      if (locationErrorCode === 'PERMISSION_DENIED') {
        setPermissionDenied(true);
        errorMessage = t('location.permissionDeniedHelp');
      } else if (locationErrorCode === 'TIMEOUT') {
        errorMessage = t('location.timeout');
      } else if (locationErrorCode === 'POSITION_UNAVAILABLE') {
        errorMessage = t('location.unavailable');
      } else if (locationErrorCode === 'NOT_SUPPORTED') {
        errorMessage = t('location.notSupportedDesc');
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
            placeholder={isGettingLocation ? t('location.gettingLocation') : ""}
            disabled={isGettingLocation}
            autoComplete="off"
            className="h-11 sm:h-10 pr-9"
          />
          {isGettingLocation && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
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
