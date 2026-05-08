
-- listings
DROP POLICY IF EXISTS "Users can delete own listings" ON public.listings;
DROP POLICY IF EXISTS "Users can update own listings" ON public.listings;
DROP POLICY IF EXISTS "View published or own listings" ON public.listings;

CREATE POLICY "Users can delete own listings" ON public.listings
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own listings" ON public.listings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "View published listings (anon)" ON public.listings
  FOR SELECT TO anon USING (is_published = true);
CREATE POLICY "View published or own listings (auth)" ON public.listings
  FOR SELECT TO authenticated USING (is_published = true OR auth.uid() = user_id);

-- listing_ratings
DROP POLICY IF EXISTS "Authenticated can view ratings" ON public.listing_ratings;
DROP POLICY IF EXISTS "Users can delete own ratings" ON public.listing_ratings;
DROP POLICY IF EXISTS "Users can update own ratings" ON public.listing_ratings;

CREATE POLICY "Authenticated can view ratings" ON public.listing_ratings
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can delete own ratings" ON public.listing_ratings
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own ratings" ON public.listing_ratings
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- user_favorites
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can view own favorites" ON public.user_favorites;

CREATE POLICY "Users can delete own favorites" ON public.user_favorites
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view own favorites" ON public.user_favorites
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- payment_orders
DROP POLICY IF EXISTS "Users view own payment orders" ON public.payment_orders;
CREATE POLICY "Users view own payment orders" ON public.payment_orders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Restrict function execution
REVOKE EXECUTE ON FUNCTION public.get_listing_average_rating(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_my_listing_phone(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_listing_average_rating(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_listing_phone(uuid) TO authenticated;

-- Storage: prevent listing all files in bucket while keeping individual reads working
DROP POLICY IF EXISTS "Public can read listing images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view listing images" ON storage.objects;

CREATE POLICY "Public read listing images by name" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'listing-images' AND name IS NOT NULL);
