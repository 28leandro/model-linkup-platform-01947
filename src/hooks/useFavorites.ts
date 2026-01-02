import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export const useFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavoriteIds([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('listing_id')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavoriteIds(data?.map(f => f.listing_id) || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = async (listingId: string) => {
    if (!user) {
      toast({
        title: t('favorites.loginRequired'),
        variant: 'destructive',
      });
      return false;
    }

    const isFavorite = favoriteIds.includes(listingId);

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId);

        if (error) throw error;
        setFavoriteIds(prev => prev.filter(id => id !== listingId));
        toast({ title: t('favorites.removed') });
      } else {
        const { error } = await supabase
          .from('user_favorites')
          .insert({ user_id: user.id, listing_id: listingId });

        if (error) throw error;
        setFavoriteIds(prev => [...prev, listingId]);
        toast({ title: t('favorites.added') });
      }
      return true;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  };

  const isFavorite = (listingId: string) => favoriteIds.includes(listingId);

  return { favoriteIds, toggleFavorite, isFavorite, loading, refetch: fetchFavorites };
};
