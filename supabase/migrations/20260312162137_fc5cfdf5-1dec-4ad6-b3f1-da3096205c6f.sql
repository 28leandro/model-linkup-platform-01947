
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS year integer;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS fuel_type text;

-- Recreate the public view to include new columns
DROP VIEW IF EXISTS public.listings_public;
CREATE VIEW public.listings_public AS
  SELECT id, title, description, category, type, location, images, rating, latitude, longitude, phone, created_at, user_id, price, area, year, fuel_type
  FROM public.listings;
