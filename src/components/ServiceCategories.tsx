import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { CATEGORIES } from "@/lib/categories";

const ServiceCategories = () => {
  const { language, t } = useLanguage();
  const isPt = language === "pt";

  return (
    <div className="container mx-auto px-3 sm:px-4 pt-4 pb-2">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              to={`/category/${cat.id}`}
              className="group flex items-center gap-2 rounded-xl bg-primary/10 text-foreground border border-border/50 backdrop-blur-sm px-3 py-2.5 shadow-sm hover:bg-primary hover:text-primary-foreground hover:shadow-md hover:border-primary transition-all"
            >
              <Icon className="w-5 h-5 shrink-0" strokeWidth={2} />
              <span className="font-medium text-xs sm:text-sm truncate">
                {isPt ? cat.label_pt : cat.label_es}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceCategories;