DROP VIEW IF EXISTS public.listings_public;
CREATE VIEW public.listings_public
WITH (security_invoker = true) AS
SELECT id, user_id, created_at, title, description, price, currency, type,
       category, subcategory, brand, model, condition, location, rating,
       latitude, longitude, images, area, year, fuel_type, is_published,
       attributes, NULL::text AS phone
FROM public.listings
WHERE is_published = true OR auth.uid() = user_id;

GRANT SELECT ON public.listings_public TO anon, authenticated;