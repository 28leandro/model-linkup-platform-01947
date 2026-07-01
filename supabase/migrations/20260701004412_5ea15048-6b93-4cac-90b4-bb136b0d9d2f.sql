
-- 1) Remove direct read access to the phone column.
REVOKE SELECT (phone) ON public.listings FROM anon;
REVOKE SELECT (phone) ON public.listings FROM authenticated;

-- Explicit column-level SELECT grants for every non-phone column.
GRANT SELECT (
  id, title, description, type, category, rating, location,
  latitude, longitude, images, created_at, user_id, price, area, year,
  fuel_type, currency, is_published, photos_unlocked, attributes,
  subcategory, brand, model, condition
) ON public.listings TO authenticated;

GRANT SELECT (
  id, title, description, type, category, rating, location,
  latitude, longitude, images, created_at, user_id, price, area, year,
  fuel_type, currency, is_published, attributes,
  subcategory, brand, model, condition
) ON public.listings TO anon;

-- 2) Tighten storage.objects public read policy for the listing-images bucket.
DROP POLICY IF EXISTS "Public read listing images by name" ON storage.objects;

CREATE POLICY "Public read images for published listings"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'listing-images'
  AND EXISTS (
    SELECT 1
    FROM public.listings l
    WHERE l.is_published = true
      AND l.user_id::text = (storage.foldername(storage.objects.name))[1]
      AND EXISTS (
        SELECT 1
        FROM unnest(l.images) AS img
        WHERE img LIKE '%' || storage.objects.name
      )
  )
);

CREATE POLICY "Owners read own listing images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'listing-images'
  AND auth.uid()::text = (storage.foldername(storage.objects.name))[1]
);
