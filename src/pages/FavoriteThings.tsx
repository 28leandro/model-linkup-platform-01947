import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const FavoriteThings = () => {
  const { t } = useLanguage();
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-6 sm:mb-8 text-center">
          {t('favorites.title')}
        </h1>
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {favorites.map((favorite) => (
            <Card key={favorite.id} className="hover:shadow-lg transition-shadow bg-card overflow-hidden">
              <CardHeader className="p-0">
                <div className="aspect-video w-full overflow-hidden">
                  <img
                    src={favorite.image}
                    alt={favorite.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
                <CardTitle className="px-4 pt-4 text-base sm:text-lg">{favorite.title}</CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <p className="text-sm text-muted-foreground">
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