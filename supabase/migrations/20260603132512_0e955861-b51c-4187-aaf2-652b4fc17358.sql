-- 1) Revoke direct column access to phone on listings; owner reads via get_my_listing_phone()
REVOKE SELECT (phone) ON public.listings FROM anon, authenticated;

-- 2) Replace the receiver UPDATE policy to remove the no-op tautology.
-- The messages_restrict_receiver_update trigger continues to enforce that
-- receivers may only modify read_at.
DROP POLICY IF EXISTS "Receiver can mark as read" ON public.messages;
CREATE POLICY "Receiver can mark as read"
ON public.messages
FOR UPDATE
TO authenticated
USING (auth.uid() = receiver_id)
WITH CHECK (auth.uid() = receiver_id);