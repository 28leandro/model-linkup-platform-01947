
CREATE OR REPLACE FUNCTION public.prevent_owner_modifying_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner uuid;
BEGIN
  SELECT user_id INTO v_owner FROM public.listings WHERE id = NEW.listing_id;
  -- If the updater is the listing owner (not the reviewer), only allow seller_response columns to change
  IF auth.uid() = v_owner AND auth.uid() <> OLD.user_id THEN
    IF NEW.rating IS DISTINCT FROM OLD.rating
       OR NEW.comment IS DISTINCT FROM OLD.comment
       OR NEW.user_id IS DISTINCT FROM OLD.user_id
       OR NEW.listing_id IS DISTINCT FROM OLD.listing_id
       OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'Listing owners may only update seller_response fields';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_owner_modifying_review ON public.listing_ratings;
CREATE TRIGGER trg_prevent_owner_modifying_review
  BEFORE UPDATE ON public.listing_ratings
  FOR EACH ROW EXECUTE FUNCTION public.prevent_owner_modifying_review();
