DROP POLICY IF EXISTS "Users delete own messages" ON public.messages;
CREATE POLICY "Users delete own messages"
ON public.messages FOR DELETE
TO authenticated
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);