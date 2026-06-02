import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { CATEGORIES } from "@/lib/categories";

const ServiceCategories = () => {
  const { language, t } = useLanguage();
  const isPt = language === "pt";

  return (
    <div className="container mx-auto px-3 sm:px-4 pt-4 pb-2">
      <div className="flex gap-2 sm:gap-3 overflow-x-auto -mx-3 px-3 sm:-mx-4 sm:px-4 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {CATEGORIES.map((cat, idx) => {
          const Icon = cat.icon;
          const neutralIds = new Set(["real-estate", "fashion", "tech"]);
          const isNeutral = neutralIds.has(cat.id);
          const isBlue = idx % 2 === 0;
          return (
            <Link
              key={cat.id}
              to={`/category/${cat.id}`}
              className={`snap-start shrink-0 group flex items-center gap-2 rounded-full border px-3 py-2 bg-card text-foreground transition-all ${
                isNeutral
                  ? "hover:bg-accent hover:text-accent-foreground"
                  : isBlue
                  ? "hover:bg-primary hover:text-primary-foreground"
                  : "hover:bg-destructive hover:text-destructive-foreground"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" strokeWidth={2} />
              <span className="font-medium text-xs sm:text-sm whitespace-nowrap">
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