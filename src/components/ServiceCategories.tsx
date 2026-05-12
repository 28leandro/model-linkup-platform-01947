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
        {CATEGORIES.map((cat, idx) => {
          const Icon = cat.icon;
          const isBlue = idx % 2 === 0;
          const colorClasses = isBlue
            ? "bg-blue-500/15 border-blue-500/30 hover:bg-blue-600 hover:border-blue-600 hover:text-white"
            : "bg-red-500/15 border-red-500/30 hover:bg-red-600 hover:border-red-600 hover:text-white";
          return (
            <Link
              key={cat.id}
              to={`/category/${cat.id}`}
              className={`group flex items-center gap-2 rounded-xl text-foreground border backdrop-blur-sm px-3 py-2.5 shadow-sm hover:shadow-md transition-all ${colorClasses}`}
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