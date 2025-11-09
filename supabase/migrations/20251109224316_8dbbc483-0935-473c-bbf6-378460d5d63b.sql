-- Add user_id column to listings table
ALTER TABLE public.listings 
ADD COLUMN user_id uuid REFERENCES auth.users(id);

-- Update existing listings to set a default user_id (optional, or leave NULL)
-- For now, we'll leave existing listings with NULL user_id

-- Drop old permissive policies
DROP POLICY IF EXISTS "Anyone can view listings" ON public.listings;
DROP POLICY IF EXISTS "Anyone can create listing" ON public.listings;

-- Create new secure RLS policies

-- Authenticated users can view all listings
CREATE POLICY "Authenticated users can view listings"
  ON public.listings FOR SELECT
  TO authenticated
  USING (true);

-- Users can only create their own listings
CREATE POLICY "Users can create own listings"
  ON public.listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own listings
CREATE POLICY "Users can update own listings"
  ON public.listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own listings
CREATE POLICY "Users can delete own listings"
  ON public.listings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Update storage policies for listing-images bucket

-- Drop old permissive policies
DROP POLICY IF EXISTS "Anyone can upload listing images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view listing images" ON storage.objects;

-- Authenticated users can upload to their own folder
CREATE POLICY "Users can upload own listing images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'listing-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Anyone can view listing images (bucket is public for viewing)
CREATE POLICY "Public can view listing images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'listing-images');

-- Users can update their own images
CREATE POLICY "Users can update own listing images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'listing-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can delete their own images
CREATE POLICY "Users can delete own listing images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'listing-images' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );