
-- Restrict listing_ratings SELECT to authenticated only
DROP POLICY IF EXISTS "Anyone can view ratings" ON public.listing_ratings;
CREATE POLICY "Authenticated can view ratings"
ON public.listing_ratings
FOR SELECT
TO authenticated
USING (true);

-- Column-level protection: revoke phone column from anon/authenticated on listings table.
-- Clients should use listings_public view (which masks phone). Owners use the view's owner-aware logic
-- or explicit RPC. We grant all other columns explicitly.
REVOKE SELECT ON public.listings FROM anon, authenticated;
GRANT SELECT (
  id, user_id, created_at, title, description, price, currency,
  type, category, location, rating, latitude, longitude, images,
  area, year, fuel_type, is_published
) ON public.listings TO anon, authenticated;

-- Owners need to read their own phone; provide a SECURITY DEFINER helper
CREATE OR REPLACE FUNCTION public.get_my_listing_phone(listing_uuid uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT phone FROM public.listings
  WHERE id = listing_uuid AND user_id = auth.uid()
$$;

REVOKE EXECUTE ON FUNCTION public.get_my_listing_phone(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_listing_phone(uuid) TO authenticated;
