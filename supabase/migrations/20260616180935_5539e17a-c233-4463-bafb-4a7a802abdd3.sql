
CREATE OR REPLACE FUNCTION public.enforce_payment_gate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  caller_role text := auth.role();
  MAX_FREE_PHOTOS constant int := 10;
BEGIN
  IF caller_role = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    -- Photos are free for everyone right now: auto-unlock up to 10.
    NEW.photos_unlocked := true;
    IF COALESCE(array_length(NEW.images, 1), 0) > MAX_FREE_PHOTOS THEN
      NEW.is_published := false;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    NEW.photos_unlocked := true;
    IF COALESCE(array_length(NEW.images, 1), 0) > MAX_FREE_PHOTOS THEN
      NEW.is_published := false;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;
