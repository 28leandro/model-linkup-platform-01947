import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const ServiceCategories = () => {
  const categories = [
    {
      name: "Bricolage",
      description: "Réparations, montage de meubles",
      link: "/category/bricolage"
    },
    {
      name: "Jardinage",
      description: "Entretien, plantation",
      link: "/category/jardinage"
    },
    {
      name: "Ménage",
      description: "Nettoyage, repassage",
      link: "/category/menage"
    },
    {
      name: "Rénovation",
      description: "Peinture, carrelage",
      link: "/category/renovation"
    },
    {
      name: "Cours particuliers",
      description: "Soutien scolaire, langues",
      link: "/category/cours"
    },
    {
      name: "Transport",
      description: "Déménagement, livraison",
      link: "/category/transport"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-xl font-semibold mb-4">Service entre particulier</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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