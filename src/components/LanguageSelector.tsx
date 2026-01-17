import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const BrazilFlag = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="512" fill="#009739"/>
    <polygon points="256,64 480,256 256,448 32,256" fill="#FEDD00"/>
    <circle cx="256" cy="256" r="96" fill="#012169"/>
    <path d="M160,256 Q256,200 352,256" stroke="white" strokeWidth="16" fill="none"/>
  </svg>
);

const ParaguayFlag = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 512 336" xmlns="http://www.w3.org/2000/svg">
    <rect width="512" height="112" fill="#D52B1E"/>
    <rect y="112" width="512" height="112" fill="#FFFFFF"/>
    <rect y="224" width="512" height="112" fill="#0038A8"/>
    <circle cx="256" cy="168" r="48" fill="none" stroke="#000" strokeWidth="2"/>
    <polygon points="256,140 262,156 280,156 266,166 272,184 256,174 240,184 246,166 232,156 250,156" fill="#009B3A"/>
  </svg>
);

const LanguageSelector = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 px-2">
          {language === 'pt' ? (
            <BrazilFlag className="w-6 h-5 rounded-sm" />
          ) : (
            <ParaguayFlag className="w-6 h-5 rounded-sm" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background border shadow-lg">
        <DropdownMenuItem
          onClick={() => setLanguage('pt')}
          className={`${language === 'pt' ? 'bg-accent' : ''} flex items-center gap-2 cursor-pointer`}
        >
          <BrazilFlag className="w-6 h-4 rounded-sm" />
          <span>Português</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('es')}
          className={`${language === 'es' ? 'bg-accent' : ''} flex items-center gap-2 cursor-pointer`}
        >
          <ParaguayFlag className="w-6 h-4 rounded-sm" />
          <span>Español</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
