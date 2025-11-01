import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
}

const SearchBar = ({ searchQuery, onSearchQueryChange, onSearch }: SearchBarProps) => {
  return (
    <div className="border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-4 max-w-2xl mx-auto">
          <Input 
            placeholder="Que recherchez-vous ?" 
            className="flex-1"
            value={searchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          />
          <Button onClick={onSearch}>
            <Search className="w-4 h-4 mr-2" />
            Rechercher
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;