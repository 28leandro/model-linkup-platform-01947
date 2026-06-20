CREATE OR REPLACE FUNCTION public.get_listing_contact_phone(listing_uuid uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    NULLIF(TRIM(l.phone), ''),
    NULLIF(TRIM(u.raw_user_meta_data->>'phone'), '')
  )
  FROM public.listings l
  LEFT JOIN auth.users u ON u.id = l.user_id
  WHERE l.id = listing_uuid AND l.is_published = true
$$;