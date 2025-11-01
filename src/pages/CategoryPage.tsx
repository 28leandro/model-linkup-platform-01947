import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useListingsStore } from "@/store/listingsStore";
import { StarRating } from "@/components/StarRating";

const CategoryPage = () => {
  const { id } = useParams();
  const listings = useListingsStore((state) => state.listings);
  
  const categoryListings = listings.filter((listing) => {
    if (id === "3") {
      return listing.category === "multimedia";
    }
    return false;
  });

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="text-primary hover:underline">
            ← Retour
          </Link>
          <h1 className="text-2xl font-bold mt-2">
            {id === "3" ? "Multimédia" : "Catégorie"}
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryListings.map((listing) => (
            <Card key={listing.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <Link to={`/listing/${listing.id}`}>
                  <div className="aspect-video bg-white rounded-md mb-3 overflow-hidden">
                    <img
                      src={listing.images[0] || "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=500&q=80"}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-medium text-lg mb-1">{listing.title}</h3>
                  <div className="mb-2">
                    <StarRating rating={listing.rating} />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{listing.location}</p>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CategoryPage;