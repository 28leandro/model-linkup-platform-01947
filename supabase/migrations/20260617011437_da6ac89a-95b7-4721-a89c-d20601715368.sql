REVOKE INSERT, UPDATE, DELETE ON public.listings FROM anon;
GRANT SELECT ON public.listings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.listings TO authenticated;
GRANT ALL ON public.listings TO service_role;

REVOKE INSERT, UPDATE, DELETE ON public.listings_public FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.listings_public FROM authenticated;
GRANT SELECT ON public.listings_public TO anon;
GRANT SELECT ON public.listings_public TO authenticated;
GRANT ALL ON public.listings_public TO service_role;