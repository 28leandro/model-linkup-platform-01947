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
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">{t('filter.sortBy')}:</span>
      <Select value={sortOption} onValueChange={(value) => onSortChange(value as SortOption)}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder={t('filter.selectSort')} />
        </SelectTrigger>
        <SelectContent>
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
