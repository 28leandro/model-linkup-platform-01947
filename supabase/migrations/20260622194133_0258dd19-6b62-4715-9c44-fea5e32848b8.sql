
DROP POLICY IF EXISTS "Users send messages" ON public.messages;

CREATE POLICY "Users send messages"
ON public.messages
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = sender_id
  AND sender_id <> receiver_id
  AND EXISTS (
    SELECT 1 FROM public.listings l
    WHERE l.id = messages.ad_id
      AND (
        -- Buyer contacting the listing owner
        l.user_id = messages.receiver_id
        -- Owner replying to a buyer who already messaged about this listing
        OR (
          l.user_id = auth.uid()
          AND EXISTS (
            SELECT 1 FROM public.messages prev
            WHERE prev.ad_id = messages.ad_id
              AND prev.sender_id = messages.receiver_id
              AND prev.receiver_id = auth.uid()
          )
        )
      )
  )
);
