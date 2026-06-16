
-- Allow anonymous visitors to read ratings (public marketplace)
DROP POLICY IF EXISTS "Authenticated can view ratings" ON public.listing_ratings;
CREATE POLICY "Anyone can view ratings"
  ON public.listing_ratings
  FOR SELECT
  TO anon, authenticated
  USING (true);
GRANT SELECT ON public.listing_ratings TO anon;

-- Strengthen the owner-response policy: limit USING to rows authored by someone else
-- (defense-in-depth alongside trg_prevent_owner_modifying_review trigger)
DROP POLICY IF EXISTS "Listing owner can respond to ratings" ON public.listing_ratings;
CREATE POLICY "Listing owner can respond to ratings"
  ON public.listing_ratings
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() <> user_id
    AND EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_ratings.listing_id
        AND listings.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() <> user_id
    AND EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = listing_ratings.listing_id
        AND listings.user_id = auth.uid()
    )
  );
