
-- Fix listings_public view: security_invoker, mask phone, only published
DROP VIEW IF EXISTS public.listings_public;
CREATE VIEW public.listings_public
WITH (security_invoker = true)
AS
SELECT
  id, title, description, category, type, location, images, rating,
  latitude, longitude, created_at, user_id, price, area, year, fuel_type, is_published,
  CASE WHEN auth.uid() = user_id THEN phone ELSE NULL END AS phone
FROM public.listings
WHERE is_published = true OR auth.uid() = user_id;

GRANT SELECT ON public.listings_public TO authenticated, anon;

-- Tighten base listings SELECT policy: hide unpublished from non-owners and prevent bulk phone harvest by non-owners via direct table access
DROP POLICY IF EXISTS "Anyone can view listings" ON public.listings;
CREATE POLICY "View published or own listings"
ON public.listings
FOR SELECT
TO authenticated, anon
USING (is_published = true OR auth.uid() = user_id);

-- Restrict ratings write policies to authenticated only
DROP POLICY IF EXISTS "Users can rate listings they don't own" ON public.listing_ratings;
DROP POLICY IF EXISTS "Users can update own ratings" ON public.listing_ratings;
DROP POLICY IF EXISTS "Users can delete own ratings" ON public.listing_ratings;

CREATE POLICY "Users can rate listings they don't own"
ON public.listing_ratings
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND NOT EXISTS (
    SELECT 1 FROM public.listings
    WHERE listings.id = listing_ratings.listing_id
      AND listings.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own ratings"
ON public.listing_ratings
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings"
ON public.listing_ratings
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Restrict favorites policies to authenticated only
DROP POLICY IF EXISTS "Users can add own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can view own favorites" ON public.user_favorites;

CREATE POLICY "Users can add own favorites"
ON public.user_favorites
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
ON public.user_favorites
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can view own favorites"
ON public.user_favorites
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Lock down payment_orders: clients should never write; only service role (bypasses RLS) inserts/updates
-- Add explicit deny by not creating any INSERT/UPDATE/DELETE policies; SELECT for owner already exists.
-- Ensure SELECT is authenticated-only
DROP POLICY IF EXISTS "Users view own payment orders" ON public.payment_orders;
CREATE POLICY "Users view own payment orders"
ON public.payment_orders
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Lock down get_listing_average_rating: revoke anon execute
REVOKE EXECUTE ON FUNCTION public.get_listing_average_rating(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_listing_average_rating(uuid) TO authenticated;
