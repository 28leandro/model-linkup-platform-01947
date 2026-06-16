
ALTER TABLE public.listing_ratings DISABLE TRIGGER USER;

UPDATE public.listing_ratings
SET rating = FLOOR(((rating_punctuality + rating_location + rating_professionalism)::numeric / 3))::int
WHERE rating_punctuality IS NOT NULL;

ALTER TABLE public.listing_ratings DROP CONSTRAINT IF EXISTS listing_ratings_rating_check;
ALTER TABLE public.listing_ratings ALTER COLUMN rating TYPE numeric(3,2) USING (rating::numeric);
ALTER TABLE public.listing_ratings ADD CONSTRAINT listing_ratings_rating_check CHECK (rating >= 1 AND rating <= 5);

UPDATE public.listing_ratings
SET rating = ROUND(((rating_punctuality + rating_location + rating_professionalism)::numeric / 3), 2)
WHERE rating_punctuality IS NOT NULL;

ALTER TABLE public.listing_ratings ENABLE TRIGGER USER;

CREATE OR REPLACE FUNCTION public.validate_service_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cat text;
BEGIN
  SELECT category INTO cat FROM public.listings WHERE id = NEW.listing_id;
  IF cat = 'services' THEN
    IF NEW.rating_punctuality IS NULL OR NEW.rating_location IS NULL OR NEW.rating_professionalism IS NULL THEN
      RAISE EXCEPTION 'Los 3 criterios son obligatorios para servicios';
    END IF;
    IF NEW.rating_punctuality < 1 OR NEW.rating_punctuality > 5
       OR NEW.rating_location < 1 OR NEW.rating_location > 5
       OR NEW.rating_professionalism < 1 OR NEW.rating_professionalism > 5 THEN
      RAISE EXCEPTION 'Cada criterio debe estar entre 1 y 5';
    END IF;
    NEW.rating := ROUND(((NEW.rating_punctuality + NEW.rating_location + NEW.rating_professionalism)::numeric / 3), 2);
  END IF;
  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS public.get_listing_ratings_with_profiles(uuid);
CREATE OR REPLACE FUNCTION public.get_listing_ratings_with_profiles(listing_uuid uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  rating numeric,
  comment text,
  created_at timestamptz,
  updated_at timestamptz,
  seller_response text,
  seller_response_at timestamptz,
  reviewer_name text,
  reviewer_avatar text,
  rating_punctuality integer,
  rating_location integer,
  rating_professionalism integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    r.id, r.user_id, r.rating, r.comment, r.created_at, r.updated_at,
    r.seller_response, r.seller_response_at,
    COALESCE(NULLIF(TRIM(CONCAT_WS(' ', (au.raw_user_meta_data->>'first_name'), (au.raw_user_meta_data->>'last_name'))), ''),
             au.raw_user_meta_data->>'full_name',
             au.raw_user_meta_data->>'name',
             SPLIT_PART(au.email, '@', 1),
             'Usuario') AS reviewer_name,
    au.raw_user_meta_data->>'avatar_url' AS reviewer_avatar,
    r.rating_punctuality, r.rating_location, r.rating_professionalism
  FROM public.listing_ratings r
  LEFT JOIN auth.users au ON au.id = r.user_id
  WHERE r.listing_id = listing_uuid
  ORDER BY r.created_at DESC;
$$;
