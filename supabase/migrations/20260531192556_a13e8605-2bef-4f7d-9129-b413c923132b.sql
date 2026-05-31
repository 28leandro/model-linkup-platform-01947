-- Tighten the messages UPDATE policy so receivers can only flip `read_at`,
-- not rewrite content, sender_id, receiver_id or other fields.
DROP POLICY IF EXISTS "Receiver can mark as read" ON public.messages;

CREATE POLICY "Receiver can mark as read"
ON public.messages
FOR UPDATE
TO authenticated
USING (auth.uid() = receiver_id)
WITH CHECK (
  auth.uid() = receiver_id
  AND sender_id IS NOT DISTINCT FROM sender_id  -- placeholder, see trigger below
);

-- A WITH CHECK alone cannot reference OLD values, so enforce immutability via trigger.
CREATE OR REPLACE FUNCTION public.messages_restrict_receiver_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- service_role bypasses
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Only the receiver path: allow only read_at to change
  IF auth.uid() = OLD.receiver_id THEN
    IF NEW.sender_id     IS DISTINCT FROM OLD.sender_id
    OR NEW.receiver_id   IS DISTINCT FROM OLD.receiver_id
    OR NEW.ad_id         IS DISTINCT FROM OLD.ad_id
    OR NEW.content       IS DISTINCT FROM OLD.content
    OR NEW.guest_name    IS DISTINCT FROM OLD.guest_name
    OR NEW.guest_contact IS DISTINCT FROM OLD.guest_contact
    OR NEW.created_at    IS DISTINCT FROM OLD.created_at
    THEN
      RAISE EXCEPTION 'Receivers may only update read_at on messages';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS messages_restrict_receiver_update ON public.messages;
CREATE TRIGGER messages_restrict_receiver_update
BEFORE UPDATE ON public.messages
FOR EACH ROW
EXECUTE FUNCTION public.messages_restrict_receiver_update();