-- Drop the existing view
DROP VIEW IF EXISTS public.listings_public;

-- Recreate view WITHOUT security definer
-- This view protects phone numbers: only owners see their own phone
CREATE VIEW public.listings_public 
WITH (security_invoker=true)
AS
SELECT 
  id,
  title,
  description,
  rating,
  category,
  type,
  location,
  latitude,
  longitude,
  images,
  created_at,
  CASE 
    WHEN auth.uid() = user_id THEN phone
    ELSE NULL
  END as phone,
  user_id
FROM public.listings;

-- Grant access to the view
GRANT SELECT ON public.listings_public TO authenticated;
GRANT SELECT ON public.listings_public TO anon;