import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { StarRating } from "@/components/StarRating";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import type { Listing } from "@/store/listingsStore";

const CategoryPage = () => {
  const { id } = useParams();
  const [listings, setListings] = useState<Listing[]>([]);
  
  const categoryMap: Record<string, { type: string, title: string }> = {
    "vehicles": { type: "vehicles", title: "Veículos" },
    "real-estate-sale": { type: "real-estate", title: "Imóveis à Venda" },
    "real-estate-rent": { type: "real-estate", title: "Imóveis para Alugar" },
    "services": { type: "services", title: "Serviços" }
  };

  const category = categoryMap[id || "vehicles"];

  useEffect(() => {
    const fetchListings = async () => {
      const { data, error } = await supabase
        .from('listings_public')
        .select('*');
      
      if (!error && data) {
        setListings(data as Listing[]);
      }
    };
    
    fetchListings();
  }, []);
  
  const categoryListings = listings.filter((listing) => 
    listing.type === category.type
  );

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="text-primary hover:underline">
            ← Voltar
          </Link>
          <h1 className="text-2xl font-bold mt-2">
            {category?.title || "Categoria"}
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {categoryListings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum anúncio encontrado nesta categoria.</p>
          </div>
        ) : (
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
        )}
      </main>
    </div>
  );
};

export default CategoryPage;