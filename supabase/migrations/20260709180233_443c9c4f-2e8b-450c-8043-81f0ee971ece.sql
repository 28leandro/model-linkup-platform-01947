REVOKE SELECT (phone) ON public.listings FROM PUBLIC;
REVOKE SELECT (phone) ON public.listings FROM anon;
REVOKE SELECT (phone) ON public.listings FROM authenticated;