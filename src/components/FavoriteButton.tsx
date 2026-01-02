import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFavorites } from '@/hooks/useFavorites';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  listingId: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
}

const FavoriteButton = ({ listingId, className, size = 'icon' }: FavoriteButtonProps) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(listingId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleFavorite(listingId);
  };

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleClick}
      className={cn(
        'hover:bg-background/80 transition-colors',
        className
      )}
    >
      <Heart
        className={cn(
          'w-5 h-5 transition-colors',
          favorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground hover:text-red-500'
        )}
      />
    </Button>
  );
};

export default FavoriteButton;
