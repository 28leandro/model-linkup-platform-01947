
-- Revoke public EXECUTE on trigger functions (only the trigger system needs them)
REVOKE EXECUTE ON FUNCTION public.validate_seller_response() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.prevent_owner_modifying_review() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.track_inbox_contact() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_service_rating() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.enforce_payment_gate() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.validate_listing() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.messages_restrict_receiver_update() FROM PUBLIC, anon, authenticated;

-- Revoke anon access on authenticated-only helpers
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.can_rate_service(uuid) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_my_listing_phone(uuid) FROM anon, PUBLIC;

-- Keep anon access on truly-public read helpers (listings, ratings, contact)
-- get_listing_average_rating, get_listing_contact_phone, get_listing_owner,
-- get_listing_ratings_with_profiles remain executable by anon (used on public listing pages).
