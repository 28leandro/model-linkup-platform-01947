
-- 1) Hide phone column on listings from clients; force reads via listings_public view or RPC
REVOKE SELECT (phone) ON public.listings FROM anon, authenticated;

-- 2) Prevent clients from flipping photos_unlocked / is_published without payment
--    Attach the existing enforce_payment_gate trigger that resets these for non-service_role
DROP TRIGGER IF EXISTS enforce_payment_gate_trg ON public.listings;
CREATE TRIGGER enforce_payment_gate_trg
BEFORE INSERT OR UPDATE ON public.listings
FOR EACH ROW
EXECUTE FUNCTION public.enforce_payment_gate();

-- Additionally revoke column-level UPDATE on photos_unlocked from clients
REVOKE UPDATE (photos_unlocked) ON public.listings FROM anon, authenticated;

-- 3) Lock down SECURITY DEFINER function unused by clients
REVOKE EXECUTE ON FUNCTION public.get_listing_owner(uuid) FROM PUBLIC, anon, authenticated;
