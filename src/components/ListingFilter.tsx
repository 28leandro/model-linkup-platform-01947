import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { Filter, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";

export type SortOption = 'recent' | 'oldest' | 'price_asc' | 'price_desc' | 'relevant';
export type FuelType = 'all' | 'gasoline' | 'diesel' | 'electric';

export interface FilterOptions {
  sortOption: SortOption;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  fuelType: FuelType;
}

interface ListingFilterProps {
  sortOption: SortOption;
  onSortChange: (option: SortOption) => void;
  filters?: FilterOptions;
  onFiltersChange?: (filters: FilterOptions) => void;
}

const ListingFilter = ({ sortOption, onSortChange, filters, onFiltersChange }: ListingFilterProps) => {
  const { t } = useLanguage();
  const [localFilters, setLocalFilters] = useState<FilterOptions>({
    sortOption: sortOption,
    minPrice: filters?.minPrice,
    maxPrice: filters?.maxPrice,
    minYear: filters?.minYear,
    maxYear: filters?.maxYear,
    fuelType: filters?.fuelType || 'all',
  });

  const currentYear = new Date().getFullYear();

  const handleApplyFilters = () => {
    onSortChange(localFilters.sortOption);
    if (onFiltersChange) {
      onFiltersChange(localFilters);
    }
  };

  const handleClearFilters = () => {
    const clearedFilters: FilterOptions = {
      sortOption: 'recent',
      minPrice: undefined,
      maxPrice: undefined,
      minYear: undefined,
      maxYear: undefined,
      fuelType: 'all',
    };
    setLocalFilters(clearedFilters);
    onSortChange('recent');
    if (onFiltersChange) {
      onFiltersChange(clearedFilters);
    }
  };

  const hasActiveFilters = localFilters.minPrice !== undefined || 
    localFilters.maxPrice !== undefined || 
    localFilters.minYear !== undefined || 
    localFilters.maxYear !== undefined || 
    localFilters.fuelType !== 'all';

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="w-full sm:w-auto gap-2">
            <Filter className="h-4 w-4" />
            {t('filter.title')}
            {hasActiveFilters && (
              <span className="ml-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                !
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:w-[400px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t('filter.title')}</SheetTitle>
            <SheetDescription>{t('filter.description')}</SheetDescription>
          </SheetHeader>
          
          <div className="py-6 space-y-6">
            {/* Sort Option */}
            <div className="space-y-2">
              <Label>{t('filter.sortBy')}</Label>
              <Select 
                value={localFilters.sortOption} 
                onValueChange={(value) => setLocalFilters(prev => ({ ...prev, sortOption: value as SortOption }))}
              >
                <SelectTrigger className="w-full">
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

            {/* Price Range */}
            <div className="space-y-2">
              <Label>{t('filter.priceRange')}</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder={t('filter.minPrice')}
                    value={localFilters.minPrice || ''}
                    onChange={(e) => setLocalFilters(prev => ({ 
                      ...prev, 
                      minPrice: e.target.value ? Number(e.target.value) : undefined 
                    }))}
                    min={0}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder={t('filter.maxPrice')}
                    value={localFilters.maxPrice || ''}
                    onChange={(e) => setLocalFilters(prev => ({ 
                      ...prev, 
                      maxPrice: e.target.value ? Number(e.target.value) : undefined 
                    }))}
                    min={0}
                  />
                </div>
              </div>
            </div>

            {/* Year Range */}
            <div className="space-y-2">
              <Label>{t('filter.yearRange')}</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder={t('filter.minYear')}
                    value={localFilters.minYear || ''}
                    onChange={(e) => setLocalFilters(prev => ({ 
                      ...prev, 
                      minYear: e.target.value ? Number(e.target.value) : undefined 
                    }))}
                    min={1900}
                    max={currentYear}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder={t('filter.maxYear')}
                    value={localFilters.maxYear || ''}
                    onChange={(e) => setLocalFilters(prev => ({ 
                      ...prev, 
                      maxYear: e.target.value ? Number(e.target.value) : undefined 
                    }))}
                    min={1900}
                    max={currentYear}
                  />
                </div>
              </div>
            </div>

            {/* Fuel Type */}
            <div className="space-y-2">
              <Label>{t('filter.fuelType')}</Label>
              <Select 
                value={localFilters.fuelType} 
                onValueChange={(value) => setLocalFilters(prev => ({ ...prev, fuelType: value as FuelType }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('filter.selectFuel')} />
                </SelectTrigger>
                <SelectContent position="popper" className="z-50 bg-background border">
                  <SelectItem value="all">{t('filter.allFuels')}</SelectItem>
                  <SelectItem value="gasoline">{t('filter.gasoline')}</SelectItem>
                  <SelectItem value="diesel">{t('filter.diesel')}</SelectItem>
                  <SelectItem value="electric">{t('filter.electric')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <SheetFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={handleClearFilters}
              className="w-full sm:w-auto gap-2"
            >
              <X className="h-4 w-4" />
              {t('filter.clear')}
            </Button>
            <SheetClose asChild>
              <Button 
                onClick={handleApplyFilters}
                className="w-full sm:w-auto"
              >
                {t('filter.apply')}
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Quick sort selector for desktop */}
      <div className="hidden sm:flex items-center gap-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">{t('filter.sortBy')}:</span>
        <Select value={sortOption} onValueChange={(value) => onSortChange(value as SortOption)}>
          <SelectTrigger className="w-[200px]">
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
    </div>
  );
};

export default ListingFilter;