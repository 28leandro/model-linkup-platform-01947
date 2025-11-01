import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { StarRating } from "@/components/StarRating";
import { Listing } from "@/store/listingsStore";

interface SearchResultsProps {
  listings: Listing[];
}

const SearchResults = ({ listings }: SearchResultsProps) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold mb-4">
        {listings.length > 0 ? 'Résultats de recherche' : 'Aucun résultat trouvé'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <Card key={listing.id} className="group hover:shadow-lg transition-shadow duration-200 bg-white border-2">
            <Link to={`/listing/${listing.id}`}>
              <div className="aspect-video bg-white rounded-t-md overflow-hidden">
                {listing.images && listing.images.length > 0 ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    Pas d'image
                  </div>
                )}
              </div>
              <CardContent className="p-4 bg-white">
                <h3 className="font-medium text-lg mb-2 text-gray-900">{listing.title}</h3>
                <StarRating rating={listing.rating} />
                <p className="text-sm text-gray-600 mt-2">{listing.location}</p>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;