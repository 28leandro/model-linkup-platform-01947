
ALTER TABLE public.messages
  ALTER COLUMN sender_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS guest_name text,
  ADD COLUMN IF NOT EXISTS guest_contact text;

-- Constraint: either authenticated sender OR guest info
ALTER TABLE public.messages
  DROP CONSTRAINT IF EXISTS messages_sender_or_guest_check;
ALTER TABLE public.messages
  ADD CONSTRAINT messages_sender_or_guest_check
  CHECK (
    sender_id IS NOT NULL
    OR (guest_name IS NOT NULL AND length(trim(guest_name)) > 0
        AND guest_contact IS NOT NULL AND length(trim(guest_contact)) > 0)
  );

-- Allow anonymous (guest) inserts to listing owners
DROP POLICY IF EXISTS "Guests send messages to owner" ON public.messages;
CREATE POLICY "Guests send messages to owner"
ON public.messages
FOR INSERT
TO anon
WITH CHECK (
  sender_id IS NULL
  AND guest_name IS NOT NULL AND length(trim(guest_name)) BETWEEN 1 AND 100
  AND guest_contact IS NOT NULL AND length(trim(guest_contact)) BETWEEN 3 AND 200
  AND length(content) BETWEEN 1 AND 1000
  AND EXISTS (
    SELECT 1 FROM public.listings l
    WHERE l.id = messages.ad_id
      AND l.user_id = messages.receiver_id
      AND l.is_published = true
  )
);

-- Allow listing owner to view guest messages addressed to them (already covered by existing policy via receiver_id)
