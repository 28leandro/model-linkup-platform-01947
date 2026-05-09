CREATE OR REPLACE FUNCTION public.enforce_payment_gate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  caller_role text := auth.role();
BEGIN
  -- Service role (backend functions / webhook) is trusted
  IF caller_role = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    -- Clients can never insert a listing that is already photo-unlocked
    NEW.photos_unlocked := false;
    -- If posting more than 3 images without prior unlock, force unpublished
    IF COALESCE(array_length(NEW.images, 1), 0) > 3 THEN
      NEW.is_published := false;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Clients can never flip photos_unlocked themselves
    NEW.photos_unlocked := OLD.photos_unlocked;
    -- If still locked and uploading more than 3 images, force unpublished
    IF NOT COALESCE(OLD.photos_unlocked, false)
       AND COALESCE(array_length(NEW.images, 1), 0) > 3 THEN
      NEW.is_published := false;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;