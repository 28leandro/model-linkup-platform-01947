REVOKE SELECT ON public.listings FROM anon, authenticated;

GRANT SELECT (
  id, user_id, created_at, title, description, price, currency,
  type, category, subcategory, brand, model, condition, rating,
  location, latitude, longitude, images, area, year, fuel_type,
  is_published, photos_unlocked, attributes
) ON public.listings TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.listings TO authenticated;
REVOKE SELECT (phone) ON public.listings FROM authenticated;
REVOKE SELECT (phone) ON public.listings FROM anon;
GRANT ALL ON public.listings TO service_role;