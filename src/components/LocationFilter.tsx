import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, LocateFixed, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { PARAGUAY_CITIES } from "@/lib/cities";
import { CITY_COORDS } from "@/lib/cityCoords";

export interface LocationFilterValue {
  city?: string;
  lat?: number;
  lon?: number;
  radiusKm: number;
}

interface Props {
  value: LocationFilterValue;
  onChange: (v: LocationFilterValue) => void;
}

const RADIUS_OPTIONS = [0, 5, 10, 20, 50, 100];

const LocationFilter = ({ value, onChange }: Props) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState(value.city ?? "");
  const [open, setOpen] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => setQuery(value.city ?? ""), [value.city]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PARAGUAY_CITIES.slice(0, 8);
    return PARAGUAY_CITIES.filter((c) => c.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  const pickCity = (city: string) => {
    const coords = CITY_COORDS[city];
    onChange({
      city,
      lat: coords?.lat,
      lon: coords?.lon,
      radiusKm: value.radiusKm || 20,
    });
    setQuery(city);
    setOpen(false);
  };

  const detect = () => {
    if (!navigator.geolocation) return;
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let city = t("location.myLocation");
        try {
          const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=es`
          );
          const data = await r.json();
          city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.state ||
            city;
        } catch {
          /* ignore */
        }
        onChange({ city, lat: latitude, lon: longitude, radiusKm: value.radiusKm || 20 });
        setQuery(city);
        setDetecting(false);
      },
      () => setDetecting(false),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  };

  const clear = () => {
    onChange({ city: undefined, lat: undefined, lon: undefined, radiusKm: 0 });
    setQuery("");
  };

  return (
    <div className="w-full bg-card border rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center">
      <div ref={wrapRef} className="relative flex-1">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={t("location.placeholder")}
          className="pl-9 pr-9 h-11"
        />
        {query && (
          <button
            type="button"
            onClick={clear}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
            aria-label={t("location.clear")}
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {open && suggestions.length > 0 && (
          <div className="absolute z-40 mt-1 w-full bg-popover border rounded-md shadow-lg max-h-64 overflow-auto">
            {suggestions.map((c) => (
              <button
                key={c}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pickCity(c)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2"
              >
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={detect}
        disabled={detecting}
        className="h-11 gap-2 shrink-0"
      >
        <LocateFixed className="h-4 w-4" />
        {detecting ? t("location.detecting") : t("location.detect")}
      </Button>

      <Select
        value={String(value.radiusKm ?? 0)}
        onValueChange={(v) => onChange({ ...value, radiusKm: Number(v) })}
      >
        <SelectTrigger className="h-11 w-full sm:w-[140px] shrink-0">
          <SelectValue placeholder={t("location.radius")} />
        </SelectTrigger>
        <SelectContent position="popper" className="z-50 bg-background border">
          {RADIUS_OPTIONS.map((r) => (
            <SelectItem key={r} value={String(r)}>
              {r === 0 ? t("location.anyRadius") : `+${r} km`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LocationFilter;