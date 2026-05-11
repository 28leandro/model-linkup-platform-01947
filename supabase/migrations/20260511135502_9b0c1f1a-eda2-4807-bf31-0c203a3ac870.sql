-- Add taxonomy columns to listings (all nullable, backwards compatible)
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS subcategory text,
  ADD COLUMN IF NOT EXISTS brand text,
  ADD COLUMN IF NOT EXISTS model text,
  ADD COLUMN IF NOT EXISTS condition text;

-- Validate condition values via trigger (CHECK constraints are fine here since static, but trigger is more flexible)
ALTER TABLE public.listings
  DROP CONSTRAINT IF EXISTS listings_condition_check;

ALTER TABLE public.listings
  ADD CONSTRAINT listings_condition_check
  CHECK (condition IS NULL OR condition IN ('nuevo','como_nuevo','usado_excelente','usado_funcional'));

-- Helpful indexes for filtering
CREATE INDEX IF NOT EXISTS idx_listings_subcategory ON public.listings(subcategory);
CREATE INDEX IF NOT EXISTS idx_listings_brand ON public.listings(brand);
CREATE INDEX IF NOT EXISTS idx_listings_condition ON public.listings(condition);