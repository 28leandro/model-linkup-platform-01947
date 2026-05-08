import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const ServiceCategories = () => {
  const { t } = useLanguage();

  const categories = [
    {
      name: t('categories.vehicles'),
      description: t('categories.vehicles.desc'),
      link: "/category/vehicles",
      type: "vehicles"
    },
    {
      name: t('categories.realEstate') || 'Inmuebles',
      description: t('categories.realEstate.desc') || 'Venta y alquiler de propiedades',
      link: "/category/real-estate",
      type: "real-estate"
    },
    {
      name: t('categories.services'),
      description: t('categories.services.desc'),
      link: "/category/services",
      type: "services"
    }
  ];

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">{t('categories.title')}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {categories.map((category) => (
          <Card key={category.name} className="hover:shadow-md transition-shadow bg-primary text-primary-foreground">
            <CardContent className="p-3 sm:p-4">
              <Link to={category.link} className="block">
                <h3 className="font-medium text-sm sm:text-lg mb-1 text-primary-foreground line-clamp-2">{category.name}</h3>
                <p className="text-xs sm:text-sm text-primary-foreground/80 line-clamp-2">{category.description}</p>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ServiceCategories;