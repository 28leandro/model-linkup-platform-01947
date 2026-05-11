import { Link } from "react-router-dom";
import { CATEGORIES } from "@/lib/categories";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

/**
 * Bento-style grid of main marketplace categories.
 * First two tiles are bigger (hero), the rest are smaller and uniform.
 */
const CategoryBento = () => {
  const { language, t } = useLanguage();
  const isPt = language === "pt";

  return (
    <section className="container mx-auto px-3 sm:px-4 py-6 sm:py-10">
      <div className="mb-4 sm:mb-6 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
            {t("categories.title")}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isPt ? "Explore por categoria" : "Explorá por categoría"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[120px] sm:auto-rows-[140px] gap-3 sm:gap-4">
        {CATEGORIES.map((cat, idx) => {
          const Icon = cat.icon;
          const big = idx < 2;
          return (
            <Link
              key={cat.id}
              to={`/category/${cat.id}`}
              className={cn(
                "group relative overflow-hidden rounded-2xl border bg-card",
                "shadow-sm hover:shadow-md transition-all duration-300",
                "hover:-translate-y-0.5",
                big ? "col-span-2 row-span-2" : "col-span-1 row-span-1"
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-80 group-hover:opacity-100 transition-opacity",
                  cat.accent
                )}
                aria-hidden
              />
              <div className="relative h-full w-full p-4 sm:p-5 flex flex-col justify-between">
                <Icon
                  className={cn(
                    "transition-transform group-hover:scale-110",
                    big ? "h-10 w-10 sm:h-12 sm:w-12" : "h-6 w-6 sm:h-7 sm:w-7"
                  )}
                  strokeWidth={1.75}
                />
                <div>
                  <h3
                    className={cn(
                      "font-semibold leading-tight text-foreground",
                      big ? "text-lg sm:text-2xl" : "text-sm sm:text-base"
                    )}
                  >
                    {isPt ? cat.label_pt : cat.label_es}
                  </h3>
                  {big && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                      {isPt ? cat.desc_pt : cat.desc_es}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryBento;