GRANT SELECT (moderation_status, rejection_reason, moderated_at) ON public.listings TO authenticated;
GRANT SELECT (moderation_status) ON public.listings TO anon;