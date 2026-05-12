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
          const isRed = idx % 2 === 0;
          const colorClasses = isRed
            ? "bg-gradient-to-br from-red-400 via-red-500 to-rose-600 text-white hover:from-red-500 hover:via-red-600 hover:to-rose-700"
            : "bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 text-white hover:from-blue-500 hover:via-blue-600 hover:to-indigo-700";
          return (
            <Link
              key={cat.id}
              to={`/category/${cat.id}`}
              className={`group flex items-center gap-2 rounded-xl px-3 py-2.5 shadow-sm hover:shadow-md transition-all ${colorClasses}`}
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