import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { CATEGORIES } from "@/lib/categories";

const ServiceCategories = () => {
  const { language, t } = useLanguage();
  const isPt = language === "pt";

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">{t('categories.title')}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Card key={cat.id} className="hover:shadow-md transition-shadow bg-primary text-primary-foreground w-full">
              <CardContent className="p-4 sm:p-5 flex flex-col justify-center min-h-[110px] sm:min-h-[140px]">
                <Link to={`/category/${cat.id}`} className="block">
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 mb-2 text-primary-foreground" strokeWidth={1.75} />
                  <h3 className="font-semibold text-sm sm:text-lg mb-1 text-primary-foreground line-clamp-2">
                    {isPt ? cat.label_pt : cat.label_es}
                  </h3>
                  <p className="text-xs sm:text-sm text-primary-foreground/80 line-clamp-2">
                    {isPt ? cat.desc_pt : cat.desc_es}
                  </p>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceCategories;