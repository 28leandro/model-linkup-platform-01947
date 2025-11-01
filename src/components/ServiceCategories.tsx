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
      name: t('categories.realEstateSale'),
      description: t('categories.realEstateSale.desc'),
      link: "/category/real-estate-sale",
      type: "real-estate"
    },
    {
      name: t('categories.realEstateRent'),
      description: t('categories.realEstateRent.desc'),
      link: "/category/real-estate-rent",
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
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold mb-4">{t('categories.title')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Card key={category.name} className="hover:shadow-md transition-shadow bg-primary text-primary-foreground">
            <CardContent className="p-4">
              <Link to={category.link} className="block">
                <h3 className="font-medium text-lg mb-1 text-primary-foreground">{category.name}</h3>
                <p className="text-sm text-primary-foreground/80">{category.description}</p>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ServiceCategories;