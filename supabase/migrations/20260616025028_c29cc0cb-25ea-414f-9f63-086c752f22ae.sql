
ALTER TABLE public.listing_ratings
  ADD COLUMN IF NOT EXISTS rating_punctuality integer,
  ADD COLUMN IF NOT EXISTS rating_location integer,
  ADD COLUMN IF NOT EXISTS rating_professionalism integer;

ALTER TABLE public.listing_ratings DISABLE TRIGGER USER;
UPDATE public.listing_ratings
SET rating_punctuality = COALESCE(rating_punctuality, rating),
    rating_location = COALESCE(rating_location, rating),
    rating_professionalism = COALESCE(rating_professionalism, rating);
ALTER TABLE public.listing_ratings ENABLE TRIGGER USER;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'rating_punctuality_range') THEN
    ALTER TABLE public.listing_ratings ADD CONSTRAINT rating_punctuality_range CHECK (rating_punctuality IS NULL OR (rating_punctuality BETWEEN 1 AND 5));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'rating_location_range') THEN
    ALTER TABLE public.listing_ratings ADD CONSTRAINT rating_location_range CHECK (rating_location IS NULL OR (rating_location BETWEEN 1 AND 5));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'rating_professionalism_range') THEN
    ALTER TABLE public.listing_ratings ADD CONSTRAINT rating_professionalism_range CHECK (rating_professionalism IS NULL OR (rating_professionalism BETWEEN 1 AND 5));
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.validate_service_rating()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE
  v_category text; v_owner uuid; v_comment_len int;
BEGIN
  IF auth.role() = 'service_role' THEN RETURN NEW; END IF;

  SELECT category, user_id INTO v_category, v_owner FROM public.listings WHERE id = NEW.listing_id;
  IF v_category IS DISTINCT FROM 'services' THEN
    RAISE EXCEPTION 'Solo se pueden evaluar anuncios de servicios';
  END IF;
  IF v_owner = NEW.user_id THEN
    RAISE EXCEPTION 'No podes evaluar tu propio anuncio';
  END IF;

  IF NEW.rating_punctuality IS NULL OR NEW.rating_location IS NULL OR NEW.rating_professionalism IS NULL THEN
    RAISE EXCEPTION 'Debes calificar los 3 criterios (puntualidad, lugar y profesionalismo)';
  END IF;
  IF NEW.rating_punctuality < 1 OR NEW.rating_punctuality > 5
     OR NEW.rating_location < 1 OR NEW.rating_location > 5
     OR NEW.rating_professionalism < 1 OR NEW.rating_professionalism > 5 THEN
    RAISE EXCEPTION 'Cada criterio debe estar entre 1 y 5';
  END IF;

  NEW.rating := GREATEST(1, LEAST(5,
    ROUND((NEW.rating_punctuality + NEW.rating_location + NEW.rating_professionalism)::numeric / 3.0)::int
  ));

  v_comment_len := length(trim(coalesce(NEW.comment, '')));
  IF v_comment_len < 20 THEN RAISE EXCEPTION 'El comentario debe tener al menos 20 caracteres'; END IF;
  IF v_comment_len > 1000 THEN RAISE EXCEPTION 'El comentario no puede superar 1000 caracteres'; END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.service_contacts
    WHERE buyer_id = NEW.user_id AND listing_id = NEW.listing_id
      AND confirmed_at IS NOT NULL AND confirmed_at < (now() - interval '24 hours')
      AND declined_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Solo podes evaluar despues de contactar al prestador y esperar 24 horas';
  END IF;

  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.prevent_owner_modifying_review()
 RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE v_owner uuid;
BEGIN
  SELECT user_id INTO v_owner FROM public.listings WHERE id = NEW.listing_id;
  IF auth.uid() = v_owner AND auth.uid() <> OLD.user_id THEN
    IF NEW.rating IS DISTINCT FROM OLD.rating
       OR NEW.comment IS DISTINCT FROM OLD.comment
       OR NEW.user_id IS DISTINCT FROM OLD.user_id
       OR NEW.listing_id IS DISTINCT FROM OLD.listing_id
       OR NEW.created_at IS DISTINCT FROM OLD.created_at
       OR NEW.rating_punctuality IS DISTINCT FROM OLD.rating_punctuality
       OR NEW.rating_location IS DISTINCT FROM OLD.rating_location
       OR NEW.rating_professionalism IS DISTINCT FROM OLD.rating_professionalism THEN
      RAISE EXCEPTION 'Listing owners may only update seller_response fields';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

DROP FUNCTION IF EXISTS public.get_listing_ratings_with_profiles(uuid);
CREATE FUNCTION public.get_listing_ratings_with_profiles(listing_uuid uuid)
 RETURNS TABLE(id uuid, user_id uuid, rating integer, comment text, created_at timestamp with time zone, updated_at timestamp with time zone, seller_response text, seller_response_at timestamp with time zone, reviewer_name text, reviewer_avatar text, rating_punctuality integer, rating_location integer, rating_professionalism integer)
 LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  SELECT r.id, r.user_id, r.rating, r.comment, r.created_at, r.updated_at,
    r.seller_response, r.seller_response_at,
    COALESCE((au.raw_user_meta_data ->> 'full_name'),(au.raw_user_meta_data ->> 'name'),split_part(au.email,'@',1),'Usuario') AS reviewer_name,
    (au.raw_user_meta_data ->> 'avatar_url') AS reviewer_avatar,
    r.rating_punctuality, r.rating_location, r.rating_professionalism
  FROM public.listing_ratings r
  LEFT JOIN auth.users au ON au.id = r.user_id
  WHERE r.listing_id = listing_uuid
  ORDER BY r.created_at DESC;
$function$;
