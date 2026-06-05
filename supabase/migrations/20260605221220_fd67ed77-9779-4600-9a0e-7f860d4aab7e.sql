
-- Revoke broad SELECT (which includes phone) and re-grant column-level SELECT on every column EXCEPT phone.
-- Phone remains accessible only via SECURITY DEFINER RPCs (get_my_listing_phone, get_listing_contact_phone).
REVOKE SELECT ON public.listings FROM anon, authenticated;

GRANT SELECT (
  id, title, description, type, category, rating, location,
  latitude, longitude, images, created_at, user_id, price, area,
  year, fuel_type, currency, is_published, photos_unlocked,
  attributes, subcategory, brand, model, condition
) ON public.listings TO anon, authenticated;
