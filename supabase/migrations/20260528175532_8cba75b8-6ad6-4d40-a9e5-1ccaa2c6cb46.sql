CREATE OR REPLACE FUNCTION public.validate_listing()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  current_year int := EXTRACT(YEAR FROM now())::int;
BEGIN
  -- Title: min 5 chars, max 200
  IF NEW.title IS NULL OR length(trim(NEW.title)) < 5 THEN
    RAISE EXCEPTION 'Title must be at least 5 characters';
  END IF;
  IF length(NEW.title) > 200 THEN
    RAISE EXCEPTION 'Title must be at most 200 characters';
  END IF;

  -- Description max length
  IF NEW.description IS NOT NULL AND length(NEW.description) > 5000 THEN
    RAISE EXCEPTION 'Description must be at most 5000 characters';
  END IF;

  -- Non-negative numerics
  IF NEW.price IS NOT NULL AND NEW.price < 0 THEN
    RAISE EXCEPTION 'Price cannot be negative';
  END IF;
  IF NEW.area IS NOT NULL AND NEW.area < 0 THEN
    RAISE EXCEPTION 'Area cannot be negative';
  END IF;

  -- Year range
  IF NEW.year IS NOT NULL AND (NEW.year < 1900 OR NEW.year > current_year + 1) THEN
    RAISE EXCEPTION 'Year must be between 1900 and %', current_year + 1;
  END IF;

  -- Currency whitelist
  IF NEW.currency IS NOT NULL AND NEW.currency NOT IN ('PYG','USD') THEN
    RAISE EXCEPTION 'Currency must be PYG or USD';
  END IF;

  -- Latitude / longitude bounds
  IF NEW.latitude IS NOT NULL AND (NEW.latitude < -90 OR NEW.latitude > 90) THEN
    RAISE EXCEPTION 'Latitude out of range';
  END IF;
  IF NEW.longitude IS NOT NULL AND (NEW.longitude < -180 OR NEW.longitude > 180) THEN
    RAISE EXCEPTION 'Longitude out of range';
  END IF;

  -- Phone length sanity
  IF NEW.phone IS NOT NULL AND length(NEW.phone) > 30 THEN
    RAISE EXCEPTION 'Phone too long';
  END IF;

  -- Images cap (12 max)
  IF NEW.images IS NOT NULL AND array_length(NEW.images, 1) > 12 THEN
    RAISE EXCEPTION 'Maximum 12 images allowed';
  END IF;

  -- Numeric attributes inside JSONB (km, bedrooms, bathrooms) must be non-negative
  IF NEW.attributes ? 'km' AND (NEW.attributes->>'km')::numeric < 0 THEN
    RAISE EXCEPTION 'KM cannot be negative';
  END IF;
  IF NEW.attributes ? 'bedrooms' AND (NEW.attributes->>'bedrooms')::numeric < 0 THEN
    RAISE EXCEPTION 'Bedrooms cannot be negative';
  END IF;
  IF NEW.attributes ? 'bathrooms' AND (NEW.attributes->>'bathrooms')::numeric < 0 THEN
    RAISE EXCEPTION 'Bathrooms cannot be negative';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_listing_trigger ON public.listings;
CREATE TRIGGER validate_listing_trigger
BEFORE INSERT OR UPDATE ON public.listings
FOR EACH ROW EXECUTE FUNCTION public.validate_listing();