import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface SearchBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
}

const SearchBar = ({ searchQuery, onSearchQueryChange, onSearch }: SearchBarProps) => {
  const { t } = useLanguage();

  return (
    <div className="border-b">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-2xl mx-auto">
          <Input 
            placeholder={t('search.placeholder')}
            className="flex-1 h-11 sm:h-10 text-base"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          />
          <Button onClick={onSearch} className="w-full sm:w-auto h-11 sm:h-10">
            <Search className="w-4 h-4 mr-2" />
            {t('search.button')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;