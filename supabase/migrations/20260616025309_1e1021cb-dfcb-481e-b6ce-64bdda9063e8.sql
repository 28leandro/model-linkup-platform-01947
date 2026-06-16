ALTER TABLE public.listing_ratings DROP CONSTRAINT IF EXISTS listing_ratings_rating_check;

ALTER TABLE public.listing_ratings ADD CONSTRAINT listing_ratings_rating_check CHECK (rating >= 3 AND rating <= 15);

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

  NEW.rating := NEW.rating_punctuality + NEW.rating_location + NEW.rating_professionalism;

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

ALTER TABLE public.listing_ratings DISABLE TRIGGER USER;
UPDATE public.listing_ratings
SET rating = COALESCE(rating_punctuality,0) + COALESCE(rating_location,0) + COALESCE(rating_professionalism,0)
WHERE rating_punctuality IS NOT NULL OR rating_location IS NOT NULL OR rating_professionalism IS NOT NULL;
ALTER TABLE public.listing_ratings ENABLE TRIGGER USER;
