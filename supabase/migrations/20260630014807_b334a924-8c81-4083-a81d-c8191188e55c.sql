CREATE OR REPLACE FUNCTION public.get_listing_ratings_with_profiles(listing_uuid uuid)
 RETURNS TABLE(id uuid, user_id uuid, rating numeric, comment text, created_at timestamp with time zone, updated_at timestamp with time zone, seller_response text, seller_response_at timestamp with time zone, reviewer_name text, reviewer_avatar text, rating_punctuality integer, rating_location integer, rating_professionalism integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    r.id, r.user_id, r.rating, r.comment, r.created_at, r.updated_at,
    r.seller_response, r.seller_response_at,
    COALESCE(
      NULLIF(TRIM(CONCAT_WS(' ', (au.raw_user_meta_data->>'first_name'), (au.raw_user_meta_data->>'last_name'))), ''),
      au.raw_user_meta_data->>'full_name',
      au.raw_user_meta_data->>'name',
      'Usuario'
    ) AS reviewer_name,
    au.raw_user_meta_data->>'avatar_url' AS reviewer_avatar,
    r.rating_punctuality, r.rating_location, r.rating_professionalism
  FROM public.listing_ratings r
  LEFT JOIN auth.users au ON au.id = r.user_id
  WHERE r.listing_id = listing_uuid
  ORDER BY r.created_at DESC;
$function$;