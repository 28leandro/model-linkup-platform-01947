-- Drop the existing restrictive policy for viewing listings
DROP POLICY IF EXISTS "Authenticated users can view listings" ON public.listings;

-- Create a new PERMISSIVE policy that allows ANYONE (including anonymous users) to view listings
CREATE POLICY "Anyone can view listings" 
ON public.listings 
FOR SELECT 
USING (true);