
-- ============================================
-- 1. listing_ratings: add comment + seller response
-- ============================================
ALTER TABLE public.listing_ratings
  ADD COLUMN IF NOT EXISTS comment text,
  ADD COLUMN IF NOT EXISTS seller_response text,
  ADD COLUMN IF NOT EXISTS seller_response_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Backfill existing rows with placeholder comment so NOT NULL can be added safely
UPDATE public.listing_ratings
SET comment = 'Sin comentario'
WHERE comment IS NULL;

ALTER TABLE public.listing_ratings
  ALTER COLUMN comment SET NOT NULL;

-- Updated_at trigger
DROP TRIGGER IF EXISTS listing_ratings_set_updated_at ON public.listing_ratings;
CREATE TRIGGER listing_ratings_set_updated_at
  BEFORE UPDATE ON public.listing_ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 2. service_contacts table
-- ============================================
CREATE TABLE IF NOT EXISTS public.service_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL,
  seller_id uuid NOT NULL,
  listing_id uuid NOT NULL,
  channel text NOT NULL CHECK (channel IN ('inbox','whatsapp')),
  contacted_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz,
  invite_sent_at timestamptz,
  declined_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (buyer_id, listing_id, channel)
);

GRANT SELECT, INSERT, UPDATE ON public.service_contacts TO authenticated;
GRANT ALL ON public.service_contacts TO service_role;

ALTER TABLE public.service_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyer reads own contacts"
  ON public.service_contacts FOR SELECT TO authenticated
  USING (auth.uid() = buyer_id);

CREATE POLICY "Seller reads own contacts"
  ON public.service_contacts FOR SELECT TO authenticated
  USING (auth.uid() = seller_id);

CREATE INDEX IF NOT EXISTS service_contacts_buyer_listing_idx
  ON public.service_contacts (buyer_id, listing_id);
CREATE INDEX IF NOT EXISTS service_contacts_pending_invite_idx
  ON public.service_contacts (confirmed_at, invite_sent_at)
  WHERE confirmed_at IS NOT NULL AND invite_sent_at IS NULL AND declined_at IS NULL;

DROP TRIGGER IF EXISTS service_contacts_set_updated_at ON public.service_contacts;
CREATE TRIGGER service_contacts_set_updated_at
  BEFORE UPDATE ON public.service_contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 3. Trigger: track inbox contacts automatically
-- ============================================
CREATE OR REPLACE FUNCTION public.track_inbox_contact()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_seller uuid;
  v_category text;
BEGIN
  -- Skip system messages (no sender) or self-messages
  IF NEW.sender_id IS NULL OR NEW.sender_id = NEW.receiver_id THEN
    RETURN NEW;
  END IF;

  SELECT user_id, category INTO v_seller, v_category
  FROM public.listings
  WHERE id = NEW.ad_id;

  -- Only services
  IF v_category IS DISTINCT FROM 'services' THEN
    RETURN NEW;
  END IF;

  IF NEW.sender_id <> v_seller AND NEW.receiver_id = v_seller THEN
    -- Buyer -> seller: create or keep pending contact
    INSERT INTO public.service_contacts (buyer_id, seller_id, listing_id, channel, contacted_at)
    VALUES (NEW.sender_id, v_seller, NEW.ad_id, 'inbox', now())
    ON CONFLICT (buyer_id, listing_id, channel) DO NOTHING;
  ELSIF NEW.sender_id = v_seller THEN
    -- Seller -> buyer: confirm any pending contact (any channel) for this buyer/listing
    UPDATE public.service_contacts
    SET confirmed_at = now()
    WHERE seller_id = v_seller
      AND listing_id = NEW.ad_id
      AND buyer_id = NEW.receiver_id
      AND confirmed_at IS NULL
      AND declined_at IS NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS messages_track_inbox_contact ON public.messages;
CREATE TRIGGER messages_track_inbox_contact
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.track_inbox_contact();

-- ============================================
-- 4. Eligibility helper + validation trigger
-- ============================================
CREATE OR REPLACE FUNCTION public.can_rate_service(listing_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.listings l
    JOIN public.service_contacts sc
      ON sc.listing_id = l.id AND sc.buyer_id = auth.uid()
    WHERE l.id = listing_uuid
      AND l.category = 'services'
      AND l.user_id <> auth.uid()
      AND sc.confirmed_at IS NOT NULL
      AND sc.confirmed_at < (now() - interval '24 hours')
      AND sc.declined_at IS NULL
  );
$$;

CREATE OR REPLACE FUNCTION public.validate_service_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_category text;
  v_owner uuid;
  v_comment_len int;
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  SELECT category, user_id INTO v_category, v_owner
  FROM public.listings WHERE id = NEW.listing_id;

  IF v_category IS DISTINCT FROM 'services' THEN
    RAISE EXCEPTION 'Solo se pueden evaluar anuncios de servicios';
  END IF;

  IF v_owner = NEW.user_id THEN
    RAISE EXCEPTION 'No podes evaluar tu propio anuncio';
  END IF;

  IF NEW.rating < 1 OR NEW.rating > 5 THEN
    RAISE EXCEPTION 'La calificacion debe estar entre 1 y 5';
  END IF;

  v_comment_len := length(trim(coalesce(NEW.comment, '')));
  IF v_comment_len < 20 THEN
    RAISE EXCEPTION 'El comentario debe tener al menos 20 caracteres';
  END IF;
  IF v_comment_len > 1000 THEN
    RAISE EXCEPTION 'El comentario no puede superar 1000 caracteres';
  END IF;

  -- Must have confirmed contact +24h
  IF NOT EXISTS (
    SELECT 1 FROM public.service_contacts
    WHERE buyer_id = NEW.user_id
      AND listing_id = NEW.listing_id
      AND confirmed_at IS NOT NULL
      AND confirmed_at < (now() - interval '24 hours')
      AND declined_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Solo podes evaluar despues de contactar al prestador y esperar 24 horas';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS listing_ratings_validate ON public.listing_ratings;
CREATE TRIGGER listing_ratings_validate
  BEFORE INSERT OR UPDATE ON public.listing_ratings
  FOR EACH ROW EXECUTE FUNCTION public.validate_service_rating();

-- ============================================
-- 5. Seller response: only listing owner can write seller_response
-- ============================================
CREATE OR REPLACE FUNCTION public.validate_seller_response()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner uuid;
  v_len int;
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF NEW.seller_response IS DISTINCT FROM COALESCE(OLD.seller_response, NULL) THEN
    SELECT user_id INTO v_owner FROM public.listings WHERE id = NEW.listing_id;
    IF v_owner <> auth.uid() THEN
      RAISE EXCEPTION 'Solo el anunciante puede responder a una evaluacion';
    END IF;
    v_len := length(trim(coalesce(NEW.seller_response, '')));
    IF NEW.seller_response IS NOT NULL AND (v_len < 1 OR v_len > 1000) THEN
      RAISE EXCEPTION 'La respuesta debe tener entre 1 y 1000 caracteres';
    END IF;
    NEW.seller_response_at := CASE WHEN NEW.seller_response IS NULL THEN NULL ELSE now() END;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS listing_ratings_seller_response ON public.listing_ratings;
CREATE TRIGGER listing_ratings_seller_response
  BEFORE UPDATE ON public.listing_ratings
  FOR EACH ROW EXECUTE FUNCTION public.validate_seller_response();

-- Allow listing owner to update their listing's ratings (for seller_response)
DROP POLICY IF EXISTS "Listing owner can respond to ratings" ON public.listing_ratings;
CREATE POLICY "Listing owner can respond to ratings"
  ON public.listing_ratings FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = listing_ratings.listing_id AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = listing_ratings.listing_id AND user_id = auth.uid()
    )
  );

-- ============================================
-- 6. RPC to list ratings with reviewer profile + can_rate flag
-- ============================================
CREATE OR REPLACE FUNCTION public.get_listing_ratings_with_profiles(listing_uuid uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  rating int,
  comment text,
  created_at timestamptz,
  updated_at timestamptz,
  seller_response text,
  seller_response_at timestamptz,
  reviewer_name text,
  reviewer_avatar text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    r.id, r.user_id, r.rating, r.comment, r.created_at, r.updated_at,
    r.seller_response, r.seller_response_at,
    COALESCE(
      (au.raw_user_meta_data ->> 'full_name'),
      (au.raw_user_meta_data ->> 'name'),
      split_part(au.email, '@', 1),
      'Usuario'
    ) AS reviewer_name,
    (au.raw_user_meta_data ->> 'avatar_url') AS reviewer_avatar
  FROM public.listing_ratings r
  LEFT JOIN auth.users au ON au.id = r.user_id
  WHERE r.listing_id = listing_uuid
  ORDER BY r.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_listing_ratings_with_profiles(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_rate_service(uuid) TO authenticated;
