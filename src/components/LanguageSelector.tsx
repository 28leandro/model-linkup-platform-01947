import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <span className="text-lg">{language === 'pt' ? '🇧🇷' : '🇵🇾'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setLanguage('pt')}
          className={`${language === 'pt' ? 'bg-accent' : ''} flex items-center gap-2`}
        >
          <span className="text-xl">🇧🇷</span>
          <span>Português</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('es')}
          className={`${language === 'es' ? 'bg-accent' : ''} flex items-center gap-2`}
        >
          <span className="text-xl">🇵🇾</span>
          <span>Español</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
