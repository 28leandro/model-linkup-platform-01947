
CREATE OR REPLACE FUNCTION public.protect_listing_owner_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Service role bypasses all restrictions
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Prevent owners from tampering with payment-gated / identity fields
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'user_id cannot be modified';
  END IF;

  IF NEW.photos_unlocked IS DISTINCT FROM OLD.photos_unlocked THEN
    NEW.photos_unlocked := OLD.photos_unlocked;
  END IF;

  IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    NEW.created_at := OLD.created_at;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_listing_owner_fields ON public.listings;
CREATE TRIGGER trg_protect_listing_owner_fields
BEFORE UPDATE ON public.listings
FOR EACH ROW
EXECUTE FUNCTION public.protect_listing_owner_fields();
