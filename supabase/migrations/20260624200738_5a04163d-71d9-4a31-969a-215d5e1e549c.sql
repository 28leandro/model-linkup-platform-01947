
ALTER TABLE public.messages
  ADD CONSTRAINT messages_content_length CHECK (length(content) BETWEEN 1 AND 5000);

CREATE OR REPLACE FUNCTION public.get_listing_contact_phone(listing_uuid uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE WHEN auth.uid() IS NOT NULL THEN
    COALESCE(
      NULLIF(TRIM(l.phone), ''),
      NULLIF(TRIM(u.raw_user_meta_data->>'phone'), '')
    )
  END
  FROM public.listings l
  LEFT JOIN auth.users u ON u.id = l.user_id
  WHERE l.id = listing_uuid AND l.is_published = true
$$;

REVOKE EXECUTE ON FUNCTION public.get_listing_contact_phone(uuid) FROM anon;
