import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useListingsStore } from "@/store/listingsStore";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/integrations/supabase/client";
import { LoginDialog } from "@/components/LoginDialog";
import Header from "@/components/Header";
import Map from "@/components/Map";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Navigation } from "lucide-react";
import VehicleInfo from "@/components/VehicleInfo";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatPrice } from "@/lib/formatPrice";
import { getPublicCity } from "@/lib/utils";

// Haversine distance in km
const haversineKm = (a: [number, number], b: [number, number]) => {
  const R = 6371;
  const dLat = ((b[0] - a[0]) * Math.PI) / 180;
  const dLon = ((b[1] - a[1]) * Math.PI) / 180;
  const lat1 = (a[0] * Math.PI) / 180;
  const lat2 = (b[0] * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

const userIcon = L.divIcon({
  className: "custom-leaflet-marker",
  html: `<div style="width:22px;height:22px;border-radius:50%;background:#2563eb;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35);"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const listingIcon = L.divIcon({
  className: "custom-leaflet-marker",
  html: `<div style="width:30px;height:30px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 4px 8px rgba(0,0,0,0.35);"></div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

interface FocusedMapProps {
  listing: any;
  userPos: [number, number] | null;
}

const FocusedMap = ({ listing, userPos }: FocusedMapProps) => {
  const elRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.Layer[]>([]);
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: number; durationMin: number } | null>(null);

  const listingPos: [number, number] | null =
    listing?.latitude && listing?.longitude
      ? [listing.latitude, listing.longitude]
      : null;

  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    mapRef.current = L.map(elRef.current, {
      center: listingPos ?? [-23.4425, -58.4438],
      zoom: 13,
      scrollWheelZoom: true,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapRef.current);
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      layersRef.current = [];
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    layersRef.current.forEach((l) => l.remove());
    layersRef.current = [];

    if (listingPos) {
      const m = L.marker(listingPos, { icon: listingIcon })
        .bindPopup(listing.title)
        .addTo(map);
      layersRef.current.push(m);
    }
    if (userPos) {
      const m = L.marker(userPos, { icon: userIcon })
        .bindPopup("Tu ubicación")
        .addTo(map);
      layersRef.current.push(m);
    }
    if (userPos && listingPos) {
      // Provisional straight dashed line while real route loads
      const provisional = L.polyline([userPos, listingPos], {
        color: "#1e3a8a",
        weight: 3,
        opacity: 0.5,
        dashArray: "6 6",
      }).addTo(map);
      layersRef.current.push(provisional);
      map.fitBounds(L.latLngBounds([userPos, listingPos]), {
        padding: [60, 60],
      });

      // Fetch real road itinerary from OSRM public demo server
      const controller = new AbortController();
      const url = `https://router.project-osrm.org/route/v1/driving/${userPos[1]},${userPos[0]};${listingPos[1]},${listingPos[0]}?overview=full&geometries=geojson`;
      fetch(url, { signal: controller.signal })
        .then((r) => r.json())
        .then((data) => {
          const route = data?.routes?.[0];
          if (!route?.geometry?.coordinates) return;
          const latlngs = route.geometry.coordinates.map(
            ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
          );
          provisional.remove();
          const real = L.polyline(latlngs, {
            color: "#1e3a8a",
            weight: 5,
            opacity: 0.9,
            lineCap: "round",
            lineJoin: "round",
          }).addTo(map);
          layersRef.current.push(real);
          map.fitBounds(real.getBounds(), { padding: [60, 60] });
          setRouteInfo({
            distanceKm: route.distance / 1000,
            durationMin: route.duration / 60,
          });
        })
        .catch(() => {
          /* ignore — provisional line remains */
        });
      return () => controller.abort();
    } else if (listingPos) {
      map.setView(listingPos, 14);
    }
  }, [listing, listingPos?.[0], listingPos?.[1], userPos?.[0], userPos?.[1]]);

  return (
    <div className="relative w-full h-full">
      <div
        ref={elRef}
        className="w-full h-full rounded-lg overflow-hidden shadow-lg"
      />
      {routeInfo && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg px-3 py-2 flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-[#1e3a8a]" />
            <span className="font-semibold">
              {routeInfo.distanceKm < 1
                ? `${Math.round(routeInfo.distanceKm * 1000)} m`
                : `${routeInfo.distanceKm.toFixed(1)} km`}
            </span>
          </div>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">
            {routeInfo.durationMin < 60
              ? `${Math.round(routeInfo.durationMin)} min`
              : `${Math.floor(routeInfo.durationMin / 60)} h ${Math.round(routeInfo.durationMin % 60)} min`}
          </span>
        </div>
      )}
    </div>
  );
};

const MapView = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const focusId = searchParams.get("focus");
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const listings = useListingsStore((state) => state.listings);
  const navigate = useNavigate();
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [focusedListing, setFocusedListing] = useState<any | null>(null);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  const listingsWithCoords = listings.filter(
    (listing) => listing.latitude && listing.longitude
  );

  const handleMarkerClick = (listing: any) => {
    setSelectedListing(listing.id);
  };

  const selectedListingData = listings.find(l => l.id === selectedListing);

  // Fetch the focused listing from backend (source of truth)
  useEffect(() => {
    if (!focusId) {
      setFocusedListing(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("listings_public")
        .select("*")
        .eq("id", focusId)
        .maybeSingle();
      if (!cancelled) setFocusedListing(data || null);
    })();
    return () => {
      cancelled = true;
    };
  }, [focusId]);

  // Request user geolocation when in focus mode
  useEffect(() => {
    if (!focusId) return;
    if (!navigator.geolocation) {
      setGeoError("Geolocalización no disponible");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
      () => setGeoError("No se pudo obtener tu ubicación"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [focusId]);

  const distanceKm = useMemo(() => {
    if (!userPos || !focusedListing?.latitude || !focusedListing?.longitude)
      return null;
    return haversineKm(userPos, [
      focusedListing.latitude,
      focusedListing.longitude,
    ]);
  }, [userPos, focusedListing]);

  // FOCUS MODE: single listing + user + distance
  if (focusId) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header onLoginClick={() => setLoginDialogOpen(true)} />
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 flex-1">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link
              to={`/listing/${focusId}`}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("common.backToHome")}
            </Link>
          </Button>

          <div className="mb-4 flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">
                {focusedListing?.title || t("map.title")}
              </h1>
              {focusedListing && (
                <p className="text-muted-foreground text-sm">
                  {getPublicCity(focusedListing)}
                </p>
              )}
            </div>
            {distanceKm !== null && (
              <div className="bg-primary/10 border border-primary/30 rounded-lg px-3 py-2 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">
                  {distanceKm < 1
                    ? `${Math.round(distanceKm * 1000)} m`
                    : `${distanceKm.toFixed(1)} km`}
                </span>
                <span className="text-xs text-muted-foreground">de ti</span>
              </div>
            )}
          </div>

          {geoError && (
            <p className="text-xs text-muted-foreground mb-2">{geoError}</p>
          )}

          <div className="h-[55vh] sm:h-[65vh] lg:h-[72vh] rounded-lg overflow-hidden">
            {focusedListing ? (
              <FocusedMap listing={focusedListing} userPos={userPos} />
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                Cargando…
              </div>
            )}
          </div>
        </div>
        <LoginDialog
          open={loginDialogOpen}
          onOpenChange={setLoginDialogOpen}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header onLoginClick={() => setLoginDialogOpen(true)} />
      
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 flex-1">
        <Button asChild variant="ghost" size="sm" className="mb-4">
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t('common.backToHome')}
          </Link>
        </Button>
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{t('map.title')}</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {t('map.subtitle')}
          </p>
        </div>

        <div className="rounded-lg overflow-hidden h-[55vh] sm:h-[65vh] lg:h-[72vh]">
          <Map
            listings={listingsWithCoords}
            onMarkerClick={handleMarkerClick}
            center={[-58.4438, -23.4425]}
            zoom={6}
          />
        </div>
      </div>

      <LoginDialog 
        open={loginDialogOpen} 
        onOpenChange={setLoginDialogOpen}
      />
    </div>
  );
};

export default MapView;
