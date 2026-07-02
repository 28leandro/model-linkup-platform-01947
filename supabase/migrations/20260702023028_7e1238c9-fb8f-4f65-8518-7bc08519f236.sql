-- Revoke column-level SELECT on listings.phone from anon/authenticated so
-- direct queries against public.listings cannot return seller phone numbers.
-- Re-grant SELECT on all other columns explicitly.
REVOKE SELECT ON public.listings FROM anon, authenticated;

GRANT SELECT (
  id, title, description, type, category, rating, location,
  latitude, longitude, images, created_at, user_id, price, area, year,
  fuel_type, currency, is_published, photos_unlocked, attributes,
  subcategory, brand, model, condition
) ON public.listings TO anon, authenticated;

-- Preserve write permissions for authenticated users (RLS still enforces ownership).
GRANT INSERT, UPDATE, DELETE ON public.listings TO authenticated;

-- service_role keeps full access for edge functions and admin paths.
GRANT ALL ON public.listings TO service_role;