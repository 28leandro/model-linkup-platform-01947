import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const FavoriteThings = () => {
  const favorites = [
    {
      id: 1,
      title: "Maisons de charme",
      image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04",
      description: "Des propriétés uniques pleines de caractère"
    },
    {
      id: 2,
      title: "Animaux de compagnie",
      image: "https://images.unsplash.com/photo-1582562124811-c09040d0a901",
      description: "Nos amis à quatre pattes"
    },
    {
      id: 3,
      title: "Nature & Jardins",
      image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9",
      description: "Le meilleur de la nature"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-primary mb-8 text-center">
          Vos Coups de Cœur
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <Card key={favorite.id} className="hover:shadow-lg transition-shadow bg-white">
              <CardHeader>
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                  <img
                    src={favorite.image}
                    alt={favorite.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardTitle className="mt-4">{favorite.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {favorite.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FavoriteThings;