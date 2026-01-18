import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface RatingSystemProps {
  listingId: string;
  listingOwnerId: string;
  onRatingChange?: (newAverage: number) => void;
}

export const RatingSystem = ({ listingId, listingOwnerId, onRatingChange }: RatingSystemProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalRatings, setTotalRatings] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const isOwner = user?.id === listingOwnerId;
  const canRate = user && !isOwner;

  useEffect(() => {
    fetchRatings();
  }, [listingId, user]);

  const fetchRatings = async () => {
    // Fetch average rating
    const { data: avgData } = await supabase
      .rpc('get_listing_average_rating', { listing_uuid: listingId });
    
    if (avgData !== null) {
      setAverageRating(Number(avgData));
      onRatingChange?.(Number(avgData));
    }

    // Fetch total ratings count
    const { count } = await supabase
      .from('listing_ratings')
      .select('*', { count: 'exact', head: true })
      .eq('listing_id', listingId);
    
    setTotalRatings(count || 0);

    // Fetch user's rating if logged in
    if (user) {
      const { data: userRatingData } = await supabase
        .from('listing_ratings')
        .select('rating')
        .eq('listing_id', listingId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (userRatingData) {
        setUserRating(userRatingData.rating);
      }
    }
  };

  const handleRate = async (rating: number) => {
    if (!canRate) {
      if (!user) {
        toast({
          title: t('rating.loginRequired'),
          variant: 'destructive',
        });
      } else if (isOwner) {
        toast({
          title: t('rating.cannotRateOwn'),
          variant: 'destructive',
        });
      }
      return;
    }

    setIsLoading(true);

    try {
      if (userRating) {
        // Update existing rating
        const { error } = await supabase
          .from('listing_ratings')
          .update({ rating })
          .eq('listing_id', listingId)
          .eq('user_id', user.id);

        if (error) throw error;
        toast({ title: t('rating.updated') });
      } else {
        // Insert new rating
        const { error } = await supabase
          .from('listing_ratings')
          .insert({ 
            listing_id: listingId, 
            user_id: user.id, 
            rating 
          });

        if (error) throw error;
        toast({ title: t('rating.submitted') });
      }

      setUserRating(rating);
      await fetchRatings();
    } catch (error) {
      console.error('Error rating:', error);
      toast({
        title: t('rating.error'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-muted/50 p-4 rounded-lg">
      <div className="flex flex-col gap-3">
        {/* Average Rating Display */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-5 h-5 ${
                  star <= averageRating
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-lg font-semibold">{averageRating.toFixed(1)}</span>
          <span className="text-sm text-muted-foreground">
            ({totalRatings} {totalRatings === 1 ? t('rating.vote') : t('rating.votes')})
          </span>
        </div>

        {/* User Rating Section */}
        {canRate && (
          <div className="border-t pt-3 mt-1">
            <p className="text-sm text-muted-foreground mb-2">
              {userRating ? t('rating.yourRating') : t('rating.rateThis')}
            </p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  variant="ghost"
                  size="sm"
                  disabled={isLoading}
                  className="p-1 h-auto hover:bg-transparent"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => handleRate(star)}
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      star <= (hoverRating || userRating || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-300'
                    }`}
                  />
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Message for owners */}
        {isOwner && (
          <p className="text-sm text-muted-foreground italic">
            {t('rating.ownerMessage')}
          </p>
        )}

        {/* Message for non-logged users */}
        {!user && (
          <p className="text-sm text-muted-foreground">
            {t('rating.loginToRate')}
          </p>
        )}
      </div>
    </div>
  );
};
