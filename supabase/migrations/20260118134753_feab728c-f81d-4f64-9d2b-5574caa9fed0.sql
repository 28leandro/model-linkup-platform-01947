-- Create ratings table for visitor evaluations
CREATE TABLE public.listing_ratings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (listing_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.listing_ratings ENABLE ROW LEVEL SECURITY;

-- Users can view all ratings
CREATE POLICY "Anyone can view ratings"
ON public.listing_ratings
FOR SELECT
USING (true);

-- Users can create ratings (but not for their own listings)
CREATE POLICY "Users can rate listings they don't own"
ON public.listing_ratings
FOR INSERT
WITH CHECK (
    auth.uid() = user_id 
    AND NOT EXISTS (
        SELECT 1 FROM public.listings 
        WHERE id = listing_id AND user_id = auth.uid()
    )
);

-- Users can update their own ratings
CREATE POLICY "Users can update own ratings"
ON public.listing_ratings
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own ratings
CREATE POLICY "Users can delete own ratings"
ON public.listing_ratings
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to calculate average rating
CREATE OR REPLACE FUNCTION public.get_listing_average_rating(listing_uuid UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0)
    FROM public.listing_ratings
    WHERE listing_id = listing_uuid
$$;