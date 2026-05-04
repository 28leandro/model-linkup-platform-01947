import { Star, StarHalf } from "lucide-react";

interface StarRatingProps {
  rating: number;
}

export const StarRating = ({ rating }: StarRatingProps) => {
  const safeRating = Number(rating) || 0;
  const fullStars = Math.floor(safeRating);
  const hasHalfStar = safeRating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      {[...Array(Math.max(0, fullStars))].map((_, i) => (
        <Star key={`full-${i}`} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      ))}
      {hasHalfStar && <StarHalf className="w-4 h-4 fill-yellow-400 text-yellow-400" />}
      {[...Array(Math.max(0, emptyStars))].map((_, i) => (
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      ))}
      <span className="text-sm text-gray-600 ml-1">({safeRating.toFixed(1)})</span>
    </div>
  );
};