import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, LocateFixed, X, Crosshair, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  searchQuery?: string;
  onSearchQueryChange?: (q: string) => void;
  onSearch?: () => void;
}

const RADIUS_OPTIONS = [0, 5, 10, 20, 50, 100];

const LocationFilter = ({ value, onChange, searchQuery, onSearchQueryChange, onSearch }: Props) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState(value.city ?? "");
  const [open, setOpen] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const showSearch = typeof onSearch === "function";

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
    <>
    {/* Mobile compact: icon buttons */}
    <div className="flex md:hidden items-center gap-2 w-full">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-full shrink-0"
            aria-label={t("location.placeholder")}
          >
            <MapPin className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[260px] p-2 z-50 bg-popover">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("location.placeholder")}
            className="h-10"
            autoFocus
          />
          <div className="mt-2 max-h-60 overflow-auto">
            {suggestions.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => pickCity(c)}
                className="w-full text-left px-2 py-2 text-sm rounded hover:bg-muted flex items-center gap-2"
              >
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                {c}
              </button>
            ))}
          </div>
          {value.city && (
            <button
              type="button"
              onClick={clear}
              className="mt-1 w-full text-left px-2 py-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-2"
            >
              <X className="h-3.5 w-3.5" />
              {t("location.clear")}
            </button>
          )}
        </PopoverContent>
      </Popover>

      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={detect}
        disabled={detecting}
        className="h-10 w-10 rounded-full shrink-0"
        aria-label={t("location.detect")}
      >
        <Crosshair className="h-4 w-4" />
      </Button>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-full px-4 text-xs font-semibold shrink-0"
          >
            {value.radiusKm ? `${value.radiusKm} KM` : "KM"}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-40 p-1 z-50 bg-popover">
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onChange({ ...value, radiusKm: r })}
              className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-muted ${
                (value.radiusKm ?? 0) === r ? "bg-muted font-medium" : ""
              }`}
            >
              {r === 0 ? t("location.anyRadius") : `+${r} km`}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      {value.city && (
        <span className="text-xs text-muted-foreground truncate flex-1">
          {value.city}
        </span>
      )}
    </div>

    {/* Desktop full version */}
    <div className="hidden md:flex w-full bg-card/80 backdrop-blur border border-border/60 rounded-full p-1.5 shadow-sm gap-1.5 items-center">
      {showSearch && (
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery ?? ""}
            onChange={(e) => onSearchQueryChange?.(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch?.()}
            placeholder={t("search.placeholder")}
            className="pl-10 h-11 border-0 bg-transparent rounded-full focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
      )}

      {showSearch && <div className="h-7 w-px bg-border/70 shrink-0" />}

      <div ref={wrapRef} className="relative flex-1 min-w-0">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={t("location.placeholder")}
          className="pl-10 pr-9 h-11 border-0 bg-transparent rounded-full focus-visible:ring-0 focus-visible:ring-offset-0"
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

      <div className="h-7 w-px bg-border/70 shrink-0" />

      <Button
        type="button"
        variant="ghost"
        onClick={detect}
        disabled={detecting}
        className="h-11 gap-2 shrink-0 rounded-full px-4 text-sm font-medium hover:bg-muted"
      >
        <LocateFixed className="h-4 w-4" />
        <span className="hidden lg:inline">{detecting ? t("location.detecting") : t("location.detect")}</span>
      </Button>

      <div className="h-7 w-px bg-border/70 shrink-0" />

      <Select
        value={String(value.radiusKm ?? 0)}
        onValueChange={(v) => onChange({ ...value, radiusKm: Number(v) })}
      >
        <SelectTrigger className="h-11 w-[110px] shrink-0 border-0 bg-transparent rounded-full focus:ring-0 focus:ring-offset-0">
          <SelectValue placeholder="KM" />
        </SelectTrigger>
        <SelectContent position="popper" className="z-50 bg-background border">
          {RADIUS_OPTIONS.map((r) => (
            <SelectItem key={r} value={String(r)}>
              {r === 0 ? "KM" : `+${r} km`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showSearch && (
        <Button
          type="button"
          onClick={() => onSearch?.()}
          className="h-11 px-5 rounded-full gap-2 shrink-0 shadow-sm"
        >
          <Search className="h-4 w-4" />
          {t("search.button")}
        </Button>
      )}
    </div>
    </>
  );
};

export default LocationFilter;