-- Add price and area columns to listings table
ALTER TABLE public.listings 
ADD COLUMN price numeric,
ADD COLUMN area numeric;