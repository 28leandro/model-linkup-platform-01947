import { Skeleton } from "@/components/ui/skeleton";

interface ListingCardSkeletonGridProps {
  count?: number;
}

const ListingCardSkeleton = () => (
  <div className="bg-transparent rounded-xl overflow-hidden">
    <Skeleton className="w-full aspect-square lg:aspect-[3/4] rounded-xl" />
    <div className="pt-2 px-0.5 space-y-1.5">
      <Skeleton className="h-4 w-16 rounded-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  </div>
);

const ListingCardSkeletonGrid = ({ count = 10 }: ListingCardSkeletonGridProps) => (
  <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

export { ListingCardSkeleton };
export default ListingCardSkeletonGrid;