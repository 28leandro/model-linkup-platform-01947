-- First, check and clean up any NULL user_id records
-- Delete listings without user_id as they are orphaned
DELETE FROM public.listings WHERE user_id IS NULL;

-- Make user_id NOT NULL to prevent RLS bypass
ALTER TABLE public.listings 
ALTER COLUMN user_id SET NOT NULL;

-- Add constraint for extra safety
ALTER TABLE public.listings
ADD CONSTRAINT listings_user_id_required 
CHECK (user_id IS NOT NULL);

-- Create a secure view that protects phone numbers
-- Only the listing owner can see their own phone number
CREATE OR REPLACE VIEW public.listings_public AS
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