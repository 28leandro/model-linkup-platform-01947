import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";

export type SortOption = 'recent' | 'oldest' | 'price_asc' | 'price_desc' | 'relevant';

interface ListingFilterProps {
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
}

const ListingFilter = ({ sortOption, onSortChange }: ListingFilterProps) => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
      <span className="text-sm text-muted-foreground whitespace-nowrap">{t('filter.sortBy')}:</span>
      <Select value={sortOption} onValueChange={(value) => onSortChange(value as SortOption)}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder={t('filter.selectSort')} />
        </SelectTrigger>
        <SelectContent position="popper" className="z-50 bg-background border">
          <SelectItem value="recent">{t('filter.recent')}</SelectItem>
          <SelectItem value="oldest">{t('filter.oldest')}</SelectItem>
          <SelectItem value="price_asc">{t('filter.priceAsc')}</SelectItem>
          <SelectItem value="price_desc">{t('filter.priceDesc')}</SelectItem>
          <SelectItem value="relevant">{t('filter.relevant')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ListingFilter;
