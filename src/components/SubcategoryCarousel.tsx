import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { getCategoryById } from "@/lib/categories";

interface Props {
  categoryId: string;
  title?: string;
}

/** Horizontal-scroll carousel of a category's subcategories (mobile-first). */
const SubcategoryCarousel = ({ categoryId, title }: Props) => {
  const { language } = useLanguage();
  const isPt = language === "pt";
  const cat = getCategoryById(categoryId);
  if (!cat?.subcategories?.length) return null;
  const Icon = cat.icon;

  return (
    <section className="container mx-auto px-3 sm:px-4 pt-2 pb-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
          <Icon className="h-4 w-4" strokeWidth={2} />
          {title ?? (isPt ? cat.label_pt : cat.label_es)}
        </h2>
        <Link
          to={`/category/${cat.id}`}
          className="text-xs sm:text-sm text-primary hover:underline"
        >
          {isPt ? "Ver tudo" : "Ver todo"}
        </Link>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 sm:-mx-4 sm:px-4 snap-x snap-mandatory scrollbar-none">
        {cat.subcategories.map((sub) => {
          const SubIcon = sub.icon ?? cat.icon;
          return (
            <Link
              key={sub.id}
              to={`/category/${cat.id}?sub=${sub.id}`}
              className="snap-start shrink-0 flex flex-col items-center justify-center gap-1.5 w-[88px] sm:w-[100px] h-[88px] sm:h-[100px] rounded-2xl border bg-card hover:bg-accent hover:text-accent-foreground transition-colors px-2 text-center"
            >
              <SubIcon className="h-5 w-5" strokeWidth={2} />
              <span className="text-[11px] sm:text-xs font-medium leading-tight line-clamp-2">
                {isPt ? sub.label_pt : sub.label_es}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default SubcategoryCarousel;
